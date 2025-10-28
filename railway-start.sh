#!/bin/bash
# Railway deployment script

echo "Installing backend dependencies..."
cd zbackend
npm install

echo "Starting the application..."
npm start