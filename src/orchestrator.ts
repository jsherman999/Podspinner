import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, existsSync } from 'fs/promises';

const execAsync = promisify(exec);

interface ContainerConfig {
  count: number;
  image: string;
  packages: string[];
  portStart: number;
  cpus: string;
  memory: string;
}

interface ContainerInfo {
  id: string;
  name: string;
  port: number;
  status: string;
  created: string;
}

const STATE_FILE = './orchestrator-state.json';

export class Orchestrator {
  private containers: ContainerInfo[] = [];

  constructor() {
    this.loadState();
  }

  private async loadState(): Promise<void> {
    try {
      if (existsSync(STATE_FILE)) {
        const data = await readFile(STATE_FILE, 'utf-8');
        this.containers = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load state file:', error);
      this.containers = [];
    }
  }

  private async saveState(): Promise<void> {
    try {
      await writeFile(STATE_FILE, JSON.stringify(this.containers, null, 2));
    } catch (error) {
      console.warn('Failed to save state file:', error);
    }
  }

  private async executePodmanCommand(command: string): Promise<string> {
    try {
      const { stdout } = await execAsync(command);
      return stdout.trim();
    } catch (error: any) {
      throw new Error(`Podman command failed: ${error.message}`);
    }
  }

  async startContainers(config: ContainerConfig): Promise<void> {
    console.log(`Starting ${config.count} containers...`);

    // First, pull the base image
    console.log(`Pulling base image: ${config.image}`);
    await this.executePodmanCommand(`podman pull ${config.image}`);

    // Create a temporary Dockerfile to extend the base image
    const dockerfileContent = this.generateDockerfile(config);
    await writeFile('./Dockerfile', dockerfileContent);

    // Build the custom image
    const customImageName = `orchestrator-${Date.now()}`;
    console.log(`Building custom image: ${customImageName}`);
    await this.executePodmanCommand(`podman build -t ${customImageName} .`);

    // Clean up Dockerfile
    try {
      execSync('rm ./Dockerfile');
    } catch (e) {
      // Ignore cleanup errors
    }

    // Start containers
    for (let i = 0; i < config.count; i++) {
      const containerName = `orch-server-${i + 1}`;
      const port = config.portStart + i;

      console.log(`Starting container: ${containerName} on port ${port}`);

      const cmd = [
        'podman run -d',
        `--name ${containerName}`,
        `--cpus=${config.cpus}`,
        `--memory=${config.memory}`,
        `-p ${port}:22`,
        '--cap-add=NET_ADMIN',
        '--cap-add=NET_RAW',
        customImageName
      ].join(' ');

      const containerId = await this.executePodmanCommand(cmd);

      this.containers.push({
        id: containerId,
        name: containerName,
        port: port,
        status: 'running',
        created: new Date().toISOString(),
      });

      console.log(`Container ${containerName} started with ID: ${containerId}`);
    }

    await this.saveState();

    // Generate SSH config
    await this.generateSshConfig();

    console.log(`\n✅ Started ${config.count} containers successfully!`);
    console.log(`SSH config has been generated in ~/.ssh/config.orchestrator`);
  }

  private generateDockerfile(config: ContainerConfig): string {
    const packageInstall = config.packages.length > 0 ?
      `RUN apt-get update && apt-get install -y openssh-server ${config.packages.join(' ')} && apt-get clean` :
      `RUN apt-get update && apt-get install -y openssh-server && apt-get clean`;

    return `FROM ${config.image}

RUN apt-get update && apt-get install -y sudo

# Install SSH server and additional packages
${packageInstall}

# Create SSH directory and generate keys
RUN mkdir -p /var/run/sshd /root/.ssh && chmod 700 /root/.ssh

# Configure SSH
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
RUN echo 'root:orch123' | chpasswd

# Generate SSH host keys
RUN ssh-keygen -A

# Expose SSH port
EXPOSE 22

# Start SSH daemon
CMD ["/usr/sbin/sshd", "-D"]`;
  }

  async stopAllContainers(): Promise<void> {
    if (this.containers.length === 0) {
      console.log('No containers to stop.');
      return;
    }

    console.log(`Stopping ${this.containers.length} containers...`);

    for (const container of this.containers) {
      try {
        console.log(`Stopping container: ${container.name}`);
        await this.executePodmanCommand(`podman stop ${container.id}`);
      } catch (error) {
        console.warn(`Failed to stop container ${container.name}:`, error);
      }
    }

    this.containers = [];
    await this.saveState();

    console.log('All containers stopped.');
  }

  async getStatus(): Promise<any> {
    const runningContainers: ContainerInfo[] = [];

    for (const container of this.containers) {
      try {
        const inspectOutput = await this.executePodmanCommand(`podman inspect ${container.id}`);
        const inspectData = JSON.parse(inspectOutput);

        const status = inspectData[0]?.State?.Status || 'unknown';
        runningContainers.push({
          ...container,
          status: status,
          uptime: inspectData[0]?.State?.StartedAt || container.created,
        });
      } catch (error) {
        // Container might be stopped or removed
        runningContainers.push({
          ...container,
          status: 'not_found',
          uptime: null,
        });
      }
    }

    return {
      total: this.containers.length,
      containers: runningContainers,
    };
  }

  async listContainers(): Promise<ContainerInfo[]> {
    const status = await this.getStatus();
    return status.containers;
  }

  async cleanup(): Promise<void> {
    console.log('Cleaning up stopped containers...');

    for (const container of [...this.containers]) {
      try {
        // Check if container is stopped
        const inspectOutput = await this.executePodmanCommand(`podman inspect ${container.id}`);
        const inspectData = JSON.parse(inspectOutput);
        const status = inspectData[0]?.State?.Status;

        if (status === 'exited' || status === 'stopped') {
          console.log(`Removing stopped container: ${container.name}`);
          await this.executePodmanCommand(`podman rm ${container.id}`);

          // Remove from our tracking
          this.containers = this.containers.filter(c => c.id !== container.id);
        }
      } catch (error) {
        // Container might already be removed
        this.containers = this.containers.filter(c => c.id !== container.id);
      }
    }

    await this.saveState();
  }

  private async generateSshConfig(): Promise<void> {
    let config = '# SSH Configuration for orchestrated containers\n';
    config += '# Auto-generated by podman-orchestrator\n\n';

    for (const container of this.containers) {
      config += `# Container: ${container.name}\n`;
      config += `Host orch-${container.name}\n`;
      config += `    HostName localhost\n`;
      config += `    Port ${container.port}\n`;
      config += `    User root\n`;
      config += `    PasswordAuthentication yes\n`;
      config += `    StrictHostKeyChecking no\n`;
      config += `    UserKnownHostsFile /dev/null\n`;
      config += `    LogLevel ERROR\n\n`;
    }

    const configPath = `${process.env.HOME}/.ssh/config.orchestrator`;

    // Create .ssh directory if it doesn't exist
    try {
      await this.executePodmanCommand('mkdir -p ~/.ssh');
    } catch (e) {
      // Directory might already exist
    }

    await writeFile(configPath, config);

    console.log(`\nSSH Configuration written to: ${configPath}`);
    console.log('You can include this in your main ~/.ssh/config by adding:');
    console.log(`Include ~/.ssh/config.orchestrator`);
  }
}