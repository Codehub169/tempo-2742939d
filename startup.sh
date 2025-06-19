#!/bin/bash
# startup.sh

# This script prepares the Inventory Management System for launch.
# It installs dependencies for both the backend API and the frontend client,
# builds the frontend for production, and starts the server.

echo "--- Starting InventoryPro Setup ---"

# 1. Install API dependencies
echo ""
echo "--- Installing backend dependencies (./api) ---"
cd api
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install backend dependencies."
    exit 1
fi
echo "--- Backend dependencies installed successfully. ---"
echo ""

# 2. Install and build the frontend client
echo "--- Installing frontend dependencies (./client) ---"
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install frontend dependencies."
    exit 1
fi
echo "--- Frontend dependencies installed successfully. ---"
echo ""
echo "--- Building frontend application for production... ---"
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Failed to build the frontend application."
    exit 1
fi
echo "--- Frontend application built successfully. ---"
echo ""

# 3. Return to root directory
cd ..

# 4. Start the application
echo "--- Setup Complete! ---"
echo ""
echo "--- Starting backend server on port 9000 ---"
cd api
PORT=9000 npm start
