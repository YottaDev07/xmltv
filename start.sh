#!/bin/bash

# XMLTV Little Rock EPG - Startup Script
# This script starts the Node.js EPG service

echo "Starting XMLTV Little Rock EPG Service..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create cache directory if it doesn't exist
mkdir -p cache

# Start the server
echo "Starting server on port 3000..."
echo "XMLTV endpoint: http://localhost:3000/xmltv?key=secret"
echo "Press Ctrl+C to stop the server"
echo ""

node server.js
