const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development environment...\n');

// Start the navigation server
console.log('📡 Starting navigation server on port 3001...');
const navServer = spawn('node', ['scripts/serve-navigation.js'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

// Start the Expo development server
console.log('📱 Starting Expo development server...');
const expoServer = spawn('npx', ['expo', 'start'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  navServer.kill('SIGINT');
  expoServer.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development servers...');
  navServer.kill('SIGTERM');
  expoServer.kill('SIGTERM');
  process.exit(0);
});

// Handle server errors
navServer.on('error', (err) => {
  console.error('❌ Navigation server error:', err);
});

expoServer.on('error', (err) => {
  console.error('❌ Expo server error:', err);
});

navServer.on('close', (code) => {
  console.log(`📡 Navigation server exited with code ${code}`);
});

expoServer.on('close', (code) => {
  console.log(`📱 Expo server exited with code ${code}`);
});
