#!/bin/bash
# startup.sh

# This script prepares the Inventory Management System for launch.
# It installs dependencies for both the backend API and the frontend client.

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

# 2. Install Client dependencies
echo "--- Installing frontend dependencies (./client) ---"
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install frontend dependencies."
    exit 1
fi
echo "--- Frontend dependencies installed successfully. ---"
echo ""


# 3. Final instructions
echo "--- Setup Complete! ---"
echo ""
echo "To run the application, you need to start the backend and frontend servers in separate terminals."
echo ""
echo "In your first terminal, start the backend server:"
echo "  cd api"
echo "  npm start"
echo ""
echo "In your second terminal, start the frontend development server:"
echo "  cd client"
echo "  npm run dev"
echo ""
echo "The application will be available at http://localhost:5173"
echo ""
