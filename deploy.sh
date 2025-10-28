#!/bin/bash
# Docker Deployment Script for Laboratory Management System

echo "🐋 Starting LabMS Docker Deployment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from .env.docker template..."
    cp .env.docker .env
    echo "⚠️  Please update the .env file with your actual values before proceeding."
    echo "   Especially update: JWT_SECRET, DB_PASSWORD, GMAIL credentials"
    read -p "Press Enter when you've updated the .env file..."
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional)
read -p "Do you want to remove old images and rebuild? (y/N): " rebuild
if [[ $rebuild =~ ^[Yy]$ ]]; then
    echo "🧹 Removing old images..."
    docker-compose down --rmi all --volumes --remove-orphans
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

# Test services
echo "🧪 Testing services..."

# Test database
echo "Testing database connection..."
docker-compose exec -T backend npm run test-db

# Test backend API
echo "Testing backend API..."
curl -f http://localhost:5000/api/health || echo "❌ Backend health check failed"

# Test frontend
echo "Testing frontend..."
curl -f http://localhost/health || echo "❌ Frontend health check failed"

echo "✅ LabMS Docker deployment completed!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:5000/api"
echo "   Database: localhost:3307"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo "🔄 Restart services: docker-compose restart"