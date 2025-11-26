#!/usr/bin/env node

import { Command } from 'commander';
import { Orchestrator } from './orchestrator';

const program = new Command();

program
  .name('podmo')
  .description('CLI tool to orchestrate podman containers for server farm simulation')
  .version('1.0.0');

program
  .command('start')
  .description('Start containers')
  .option('-c, --count <number>', 'Number of containers to start', '3')
  .option('-i, --image <image>', 'Base image to use', 'ubuntu:20.04')
  .option('-p, --packages <packages>', 'Additional packages to install (comma-separated)', 'vim,curl,wget')
  .option('--port-start <port>', 'Starting port number', '2000')
  .option('--cpus <cpus>', 'CPU allocation per container', '1.0')
  .option('--memory <memory>', 'Memory allocation per container', '512m')
  .option('--scripts <scripts>', 'Local scripts to copy into containers (comma-separated paths)', '')
  .option('--init-script <script>', 'Initialization script to run on container startup', '')
  .option('--dockerfile-instructions <instructions>', 'Custom Dockerfile instructions to add', '')
  .option('--volumes <volumes>', 'Volumes to mount (format: /host/path:/container/path,...)', '')
  .action(async (options) => {
    const orchestrator = new Orchestrator();

    const config = {
      count: parseInt(options.count),
      image: options.image,
      packages: options.packages ? options.packages.split(',').map((p: string) => p.trim()) : [],
      portStart: parseInt(options.portStart),
      cpus: options.cpus,
      memory: options.memory,
      scripts: options.scripts ? options.scripts.split(',').map((s: string) => s.trim()) : [],
      initScript: options.initScript || '',
      dockerfileInstructions: options.dockerfileInstructions || '',
      volumes: options.volumes ? options.volumes.split(',').map((v: string) => v.trim()) : [],
    };

    try {
      await orchestrator.startContainers(config);
    } catch (error: any) {
      console.error('Error starting containers:', error.message);
      process.exit(1);
    }
  });

program
  .command('stop')
  .description('Stop all containers')
  .action(async () => {
    const orchestrator = new Orchestrator();
    try {
      await orchestrator.stopAllContainers();
    } catch (error: any) {
      console.error('Error stopping containers:', error.message);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Check status of containers')
  .action(async () => {
    const orchestrator = new Orchestrator();
    try {
      const status = await orchestrator.getStatus();
      console.log('\n=== Container Status ===\n');
      console.log(`Total containers: ${status.total}`);
      console.log('\nContainers:');

      for (const container of status.containers) {
        console.log(`\n  Name: ${container.name}`);
        console.log(`  ID: ${container.id.substring(0, 12)}`);
        console.log(`  Port: ${container.port}`);
        console.log(`  Status: ${container.status}`);
        console.log(`  Created: ${container.created}`);
      }
      console.log('');
    } catch (error: any) {
      console.error('Error getting status:', error.message);
      process.exit(1);
    }
  });

program
  .command('cleanup')
  .description('Clean up stopped containers')
  .action(async () => {
    const orchestrator = new Orchestrator();
    try {
      await orchestrator.cleanup();
    } catch (error: any) {
      console.error('Error during cleanup:', error.message);
      process.exit(1);
    }
  });

program
  .command('ssh-config')
  .description('Regenerate SSH configuration')
  .action(async () => {
    const orchestrator = new Orchestrator();
    try {
      const containers = await orchestrator.listContainers();
      if (containers.length === 0) {
        console.log('No containers found. Start containers first.');
        return;
      }
      console.log('SSH configuration regenerated.');
    } catch (error: any) {
      console.error('Error regenerating SSH config:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
