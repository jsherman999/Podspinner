# Podmo (Podman Orchestrator)

A CLI tool to orchestrate podman containers for server farm simulation. This tool creates multiple containers running SSH servers, making it easy to mock a server farm for testing and development purposes.

## Features

- 🚀 Start multiple Ubuntu-based containers with SSH access
- 📦 Install custom packages on containers
- 📜 Copy custom scripts into containers
- ⚡ Run initialization scripts on container startup
- 🐳 Add custom Dockerfile instructions
- 📁 Mount volumes for persistent storage or shared data
- 🔧 Generate automatic SSH configuration
- 📊 Monitor container status
- 🧹 Clean up stopped containers
- 🎛️ Control CPU and memory allocation per container

## Installation

```bash
# Clone or download the project
cd podman-orchestrator

# Install dependencies
npm install

# Build the project
npm run build

# Install globally (optional)
npm link
```

## Prerequisites

- Podman must be installed and running
- Node.js (v16 or higher)
- Ubuntu/Debian.containers for base images

## Usage

### Start Containers

```bash
podmo start --count 5 --packages vim,curl,wget,git
```

**Basic Options:**
- `-c, --count <number>`: Number of containers to start (default: 3)
- `-i, --image <image>`: Base image to use (default: ubuntu:20.04)
- `-p, --packages <packages>`: Additional packages to install (comma-separated, default: vim,curl,wget)
- `--port-start <port>`: Starting port number (default: 2000)
- `--cpus <cpus>`: CPU allocation per container (default: 1.0)
- `--memory <memory>`: Memory allocation per container (default: 512m)

**Advanced Options:**
- `--scripts <scripts>`: Local scripts to copy into containers (comma-separated paths)
  - Scripts are copied to `/usr/local/scripts/` inside containers
  - Example: `--scripts ./setup.sh,./deploy.sh`

- `--init-script <script>`: Initialization script to run on container startup
  - Script runs before SSH daemon starts
  - Useful for environment setup, service initialization, etc.
  - Example: `--init-script ./init.sh`

- `--dockerfile-instructions <instructions>`: Custom Dockerfile instructions to add
  - Add any valid Dockerfile commands
  - Example: `--dockerfile-instructions "ENV MY_VAR=value\nRUN apt-get install -y python3"`

- `--volumes <volumes>`: Volumes to mount (format: /host/path:/container/path)
  - Mount host directories or files into containers
  - Multiple volumes separated by commas
  - Example: `--volumes /home/user/data:/data,/home/user/logs:/var/log/app`

### Check Status

```bash
podmo status
```

### Stop All Containers

```bash
podmo stop
```

### Clean Up Stopped Containers

```bash
podmo cleanup
```

### Regenerate SSH Config

```bash
podmo ssh-config
```

## SSH Access

After starting containers, the tool generates an SSH configuration file at `~/.ssh/config.orchestrator`.

To use it:

```bash
# Include in your main SSH config
echo "Include ~/.ssh/config.orchestrator" >> ~/.ssh/config

# Connect to containers
ssh orch-orch-server-1  # Connect to the first container
ssh orch-orch-server-2  # Connect to the second container
# ... etc
```

**Default SSH credentials:**
- Username: `root`
- Password: `orch123`

## Container Details

Each container runs:
- Ubuntu 20.04 (configurable via `--image`)
- OpenSSH server on assigned port
- Additional packages specified at startup
- Custom scripts in `/usr/local/scripts/` (if provided)
- Initialization script run at startup (if provided)
- Custom Dockerfile instructions applied (if provided)
- Volume mounts to host filesystem (if provided)
- Root access enabled with password authentication

## Example Usage

### Basic Usage
```bash
# Start 5 containers with additional packages
podmo start --count 5 --packages htop,tree,net-tools

# Check status
podmo status

# Connect to a container
ssh orch-orch-server-1

# Stop all when done
podmo stop
```

### Advanced Usage with Custom Scripts

```bash
# Create an initialization script
cat > init.sh << 'EOF'
#!/bin/bash
echo "Container initialized at $(date)" >> /var/log/init.log
echo "Setting up environment..."
export APP_ENV=production
mkdir -p /app/data
EOF

# Create a utility script
cat > backup.sh << 'EOF'
#!/bin/bash
echo "Running backup..."
tar -czf /backup/data-$(date +%Y%m%d).tar.gz /app/data
EOF

# Start containers with custom scripts and volumes
podmo start \
  --count 3 \
  --packages git,python3,python3-pip \
  --scripts ./backup.sh \
  --init-script ./init.sh \
  --volumes /home/user/shared:/shared,/home/user/backup:/backup \
  --dockerfile-instructions "RUN pip3 install flask redis"

# Connect and verify scripts are available
ssh orch-orch-server-1
# Inside container:
# ls /usr/local/scripts/  # backup.sh will be here
# cat /var/log/init.log    # See init script output
# ls /shared               # Access shared volume
```

### Using Custom Dockerfile Instructions

```bash
# Add custom environment and install specific software versions
podmo start \
  --count 2 \
  --dockerfile-instructions "ENV NODE_VERSION=18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g pm2"
```

## Architecture

- Builds custom Docker images on-the-fly with SSH server and custom configurations
- Copies local scripts and files into the build context
- Manages container lifecycle through podman commands
- Supports volume mounting for persistent storage and data sharing
- Tracks container state in local JSON file
- Generates SSH configs for easy access
- Supports resource allocation controls (CPU, memory)
- Executes initialization scripts on container startup

## Security Notes

⚠️ **This tool is intended for development/testing ONLY.**

- All containers run as root
- SSH uses password authentication
- Host key checking is disabled in SSH config
- Not suitable for production environments

## Troubleshooting

### Podman not found
Make sure podman is installed and available in your PATH.

### SSH connection issues
1. Check if containers are running: `podmo status`
2. Verify SSH service is running in containers: `ps aux | grep sshd`
3. Test direct connection: `ssh -p <port> root@localhost`

### Firewall blocking connections
Ensure ports are available and not blocked by firewall:

```bash
# Check if ports are open
sudo netstat -tlnp | grep :2000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.