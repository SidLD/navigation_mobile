#!/bin/bash

echo "🚀 Starting Navigation Mobile App with Local Server"
echo "=================================================="

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $SERVER_PID 2>/dev/null
    kill $EXPO_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the navigation server in the background
echo "📡 Starting navigation server on port 3000..."
node scripts/local-server.js &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Start Expo development server
echo "📱 Starting Expo development server..."
npx expo start &
EXPO_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "   - Navigation server: http://localhost:3000"
echo "   - Expo dev server: Check terminal for URL"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for either process to exit
wait
