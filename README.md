# Podman Orchestrator

A CLI tool to orchestrate podman containers for server farm simulation. This tool creates multiple containers running SSH servers, making it easy to mock a server farm for testing and development purposes.

## Features

- 🚀 Start multiple Ubuntu-based containers with SSH access
- 📦 Install custom packages on containers
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
podman-orchestrator start --count 5 --packages vim,curl,wget,git
```

**Options:**
- `--count <number>`: Number of containers to start (default: 3)
- `--image <image>`: Base image to use (default: ubuntu:20.04)
- `--packages <packages>`: Additional packages to install (comma-separated, default: vim,curl,wget)
- `--port-start <port>`: Starting port number (default: 2000)
- `--cpus <cpus>`: CPU allocation per container (default: 1.0)
- `--memory <memory>`: Memory allocation per container (default: 512m)

### Check Status

```bash
podman-orchestrator status
```

### Stop All Containers

```bash
podman-orchestrator stop
```

### Clean Up Stopped Containers

```bash
podman-orchestrator cleanup
```

### Regenerate SSH Config

```bash
podman-orchestrator ssh-config
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
- Ubuntu 20.04 (configurable)
- OpenSSH server
- Additional packages specified at startup
- SSH service on assigned port
- Root access enabled with password authentication

## Example Usage

```bash
# Start 5 containers with additional packages
podman-orchestrator start --count 5 --packages htop,tree,net-tools

# Check status
podman-orchestrator status

# Connect to a container
ssh orch-orch-server-1

# Stop all when done
podman-orchestrator stop
```

## Architecture

- Builds custom Docker images on-the-fly with SSH server
- Manages container lifecycle through podman commands
- Tracks container state in local JSON file
- Generates SSH configs for easy access
- Supports resource allocation controls

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
1. Check if containers are running: `podman-orchestrator status`
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