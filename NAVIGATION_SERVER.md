# Navigation Server Setup

This project now includes a local HTTP server to serve the navigation files for the WebView component.

## Quick Start

### Option 1: Start both servers together
```bash
npm run dev
```
This will start both the navigation server (port 3001) and the Expo development server.

### Option 2: Start servers separately

1. **Start the navigation server:**
   ```bash
   npm run serve-navigation
   ```
   This starts the server on `http://localhost:3001`

2. **Start the Expo development server:**
   ```bash
   npm start
   ```

## How it works

- The navigation server serves files from `assets/navigation/` directory
- The WebView component in `app/(tabs)/index.tsx` loads from `http://localhost:3001`
- The server includes CORS headers for local development
- All file types are supported including HTML, JS, CSS, JSON, and 3D models (.glb)

## Server Features

- **Port**: 3001 (configurable in `scripts/serve-navigation.js`)
- **CORS**: Enabled for local development
- **File Types**: HTML, JS, CSS, JSON, GLB, images
- **Security**: Directory traversal protection
- **Error Handling**: 404 for missing files, 403 for forbidden paths

## Troubleshooting

### WebView not loading
1. Make sure the navigation server is running (`npm run serve-navigation`)
2. Check that port 3001 is not being used by another application
3. Verify the WebView URL in `app/(tabs)/index.tsx` is `http://localhost:3001`

### Server won't start
1. Check if port 3001 is already in use
2. Verify the `assets/navigation/` directory exists
3. Check file permissions

### Files not loading
1. Verify the file exists in `assets/navigation/`
2. Check the file path in the HTML/JS code
3. Look at the server console for error messages

## Development Workflow

1. Start the development environment: `npm run dev`
2. Make changes to files in `assets/navigation/`
3. Refresh the WebView in your React Native app
4. The changes will be reflected immediately (no restart needed)

## File Structure

```
assets/navigation/
├── index.html          # Main navigation interface
├── location-editor.html
├── path-editor.html
├── path.json          # Campus locations and paths
├── nwssu.glb          # 3D campus model
├── styles.css
└── threejs/           # Three.js libraries
    ├── three.min.js
    ├── GLTFLoader.min.js
    └── OrbitControls.js
```
