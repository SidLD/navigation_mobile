# Localhost Navigation Solution

This solution serves your navigation HTML files locally and accesses them via `localhost:3000` in your React Native WebView. This approach keeps all your original 3D functionality intact while solving the asset loading issues.

## 🚀 Quick Start

### Option 1: Automatic Startup (Recommended)
```bash
./start-with-server.sh
```
This script starts both the navigation server and Expo development server automatically.

### Option 2: Manual Startup
1. **Start the navigation server:**
   ```bash
   npm run serve-local
   ```

2. **In another terminal, start Expo:**
   ```bash
   npm start
   ```

## 📁 Files Created

- `scripts/local-server.js` - Express server that serves navigation HTML files
- `scripts/server-manager.js` - Server management utilities
- `scripts/auto-start-server.js` - Auto-start script
- `start-with-server.sh` - Combined startup script
- `components/NavigationWebView.tsx` - Updated to use localhost

## 🌐 Available Endpoints

- `http://localhost:3000` - **Main navigation (with GLB model loading)** ⭐
- `http://localhost:3000/mobile` - Mobile navigation version
- `http://localhost:3000/bundled` - Bundled navigation version
- `http://localhost:3000/health` - Health check endpoint
- `http://localhost:3000/assets/*` - Static assets
- `http://localhost:3000/threejs/*` - Three.js libraries
- `http://localhost:3000/nwssu.glb` - 3D model file
- `http://localhost:3000/path.json` - Path data

## 🔧 How It Works

1. **Local Server**: Express server serves your navigation HTML files and assets
2. **WebView Integration**: React Native WebView loads content from `localhost:3000`
3. **Asset Resolution**: All external assets are served from the local server
4. **No Internet Required**: Everything runs locally on your machine

## 📱 Usage in Your App

The `NavigationWebView` component now:
- Connects to `http://localhost:3000`
- Shows loading state while connecting
- Displays error message if server is not running
- Provides retry functionality
- Loads your full 3D navigation experience

## 🛠️ Troubleshooting

### Server Not Starting
```bash
# Check if port 3000 is available
lsof -i :3000

# Kill any process using port 3000
kill -9 $(lsof -t -i:3000)
```

### WebView Not Loading
1. Ensure server is running: `curl http://localhost:3000/health`
2. Check Expo logs for WebView errors
3. Try refreshing the WebView

### Asset Loading Issues
- All assets are served from `http://localhost:3000/assets/`
- Check browser dev tools for 404 errors
- Ensure asset files exist in the `assets/` directory

## 🔄 Development Workflow

1. **Start servers**: `./start-with-server.sh`
2. **Make changes** to your HTML/CSS/JS files
3. **Refresh WebView** in your app
4. **Stop servers**: `Ctrl+C`

## 📦 Production Considerations

For production builds, you might want to:
1. Bundle the server with your app
2. Use a different port (e.g., 8080)
3. Add authentication if needed
4. Implement proper error handling

## ✅ Benefits

- ✅ **No Asset Loading Errors**: All files served locally
- ✅ **Full 3D Functionality**: Original Three.js code works
- ✅ **Offline Capable**: No internet required
- ✅ **Easy Development**: Simple file serving
- ✅ **Debugging Friendly**: Can inspect in browser
- ✅ **Flexible**: Easy to modify HTML/CSS/JS

## 🎯 Next Steps

1. Test the solution with your app
2. Customize the server configuration if needed
3. Add any additional endpoints for your specific needs
4. Consider adding hot-reload for development
