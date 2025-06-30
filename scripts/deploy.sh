#!/bin/bash

# Happy Cricket Production Deployment Script
set -e

echo "🏏 Starting Happy Cricket Production Deployment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please create .env.production with all required environment variables"
    exit 1
fi

# Load environment variables
export $(cat .env.production | xargs)

# Check Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed!"
    exit 1
fi

print_status "Building production images..."

# Build backend image
print_status "Building backend image..."
docker build -f backend/Dockerfile.prod -t happy-cricket-backend:latest ./backend

# Build frontend image  
print_status "Building frontend image..."
docker build -f frontend/Dockerfile.prod -t happy-cricket-frontend:latest ./frontend

print_success "Images built successfully!"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.production.yml down

# Start production services
print_status "Starting production services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."

# Check backend health
if curl -f http://localhost:8001/api/health > /dev/null 2>&1; then
    print_success "Backend is healthy!"
else
    print_error "Backend health check failed!"
    docker-compose -f docker-compose.production.yml logs backend
    exit 1
fi

# Check frontend health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Frontend is healthy!"
else
    print_error "Frontend health check failed!"
    docker-compose -f docker-compose.production.yml logs frontend
    exit 1
fi

# Display service status
print_status "Service Status:"
docker-compose -f docker-compose.production.yml ps

print_success "🎉 Happy Cricket deployed successfully!"
print_status "🌐 Frontend: http://localhost:3000"
print_status "🔧 Backend API: http://localhost:8001/api/docs"
print_status "📊 Grafana: http://localhost:3001"
print_status "🔍 Kibana: http://localhost:5601"
print_status "📈 Prometheus: http://localhost:9090"

# Optional: Run database migrations
read -p "Run database migrations? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Running database migrations..."
    docker-compose -f docker-compose.production.yml exec backend alembic upgrade head
    print_success "Database migrations completed!"
fi

# Optional: Create admin user
read -p "Create admin user? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Creating admin user..."
    docker-compose -f docker-compose.production.yml exec backend python scripts/create_admin.py
    print_success "Admin user created!"
fi

print_success "🏏 Happy Cricket is now running in production mode!"