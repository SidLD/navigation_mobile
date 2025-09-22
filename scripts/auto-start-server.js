const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Auto-starting navigation server...');

// Start the local server
const serverProcess = spawn('node', [path.join(__dirname, 'local-server.js')], {
  stdio: 'inherit',
  detached: false
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down auto-started server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down auto-started server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});

// Keep the process alive
process.stdin.resume();
