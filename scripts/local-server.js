const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Serve Three.js files from the correct path
app.use('/threejs', express.static(path.join(__dirname, '../assets/navigation/threejs')));

// Serve the GLB model file
app.get('/nwssu.glb', (req, res) => {
  const modelPath = path.join(__dirname, '../assets/navigation/nwssu.glb');
  if (fs.existsSync(modelPath)) {
    res.sendFile(modelPath);
  } else {
    res.status(404).send('GLB model file not found');
  }
});

// Serve the path.json file
app.get('/path.json', (req, res) => {
  const jsonPath = path.join(__dirname, '../assets/navigation/path.json');
  if (fs.existsSync(jsonPath)) {
    res.sendFile(jsonPath);
  } else {
    res.status(404).send('Path JSON file not found');
  }
});

// Serve the main navigation HTML file (original with GLB loading)
app.get('/', (req, res) => {
  const htmlPath = path.join(__dirname, '../assets/navigation/index.html');
  
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('Navigation HTML file not found');
  }
});

// Serve the mobile version
app.get('/mobile', (req, res) => {
  const htmlPath = path.join(__dirname, '../assets/navigation_mobile.html');
  
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('Mobile HTML file not found');
  }
});

// Serve the bundled version
app.get('/bundled', (req, res) => {
  const htmlPath = path.join(__dirname, '../assets/navigation_bundled.html');
  
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('Bundled HTML file not found');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Navigation server running on all interfaces`);
  console.log(`🎯 Main navigation (with GLB): http://localhost:${PORT}`);
  console.log(`📱 Mobile version: http://localhost:${PORT}/mobile`);
  console.log(`📦 Bundled version: http://localhost:${PORT}/bundled`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`📁 Assets: http://localhost:${PORT}/assets/`);
  console.log(`🔧 Three.js: http://localhost:${PORT}/threejs/`);
  console.log(`📱 For mobile devices, use your computer's IP address:`);
  console.log(`   Example: http://192.168.254.113:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down navigation server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down navigation server...');
  process.exit(0);
});
