const { spawn } = require('child_process');
const path = require('path');

class ServerManager {
  constructor() {
    this.serverProcess = null;
    this.isRunning = false;
  }

  async startServer() {
    if (this.isRunning) {
      console.log('Server is already running');
      return true;
    }

    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, 'local-server.js');
      
      console.log('🚀 Starting navigation server...');
      
      this.serverProcess = spawn('node', [serverPath], {
        stdio: 'pipe',
        detached: false
      });

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        
        if (output.includes('Navigation server running')) {
          this.isRunning = true;
          resolve(true);
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
        reject(new Error(data.toString()));
      });

      this.serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        this.isRunning = false;
      });

      this.serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isRunning) {
          reject(new Error('Server startup timeout'));
        }
      }, 10000);
    });
  }

  async stopServer() {
    if (this.serverProcess && this.isRunning) {
      console.log('🛑 Stopping navigation server...');
      this.serverProcess.kill('SIGTERM');
      this.isRunning = false;
      return true;
    }
    return false;
  }

  isServerRunning() {
    return this.isRunning;
  }

  getServerUrl() {
    return 'http://localhost:3000';
  }
}

module.exports = ServerManager;
