#!/bin/bash
# startup.sh

# This script prepares the Inventory Management System for launch.
# It installs dependencies for both the backend API and the frontend client,
# and builds the frontend for production.

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

# 4. Final instructions
echo "--- Setup Complete! ---"
echo ""
echo "To run the application, you only need to start the backend server."
echo "It will serve the built frontend application and the API."
echo ""
echo "In your terminal, run the following commands:"
echo "  cd api"
echo "  PORT=9000 npm start"
echo ""
echo "The application will be available at http://localhost:9000"
echo ""
