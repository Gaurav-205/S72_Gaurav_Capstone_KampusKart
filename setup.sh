#!/bin/bash
# KampusKart Setup Script for Unix/Linux/macOS
# This script helps fresh contributors set up the development environment.

set -e

echo ""
echo "===================================="
echo "  KampusKart Development Setup"
echo "===================================="
echo ""

# Check Node.js and npm versions
echo "Checking Node.js and npm versions..."
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed. Please install Node.js 18.x from https://nodejs.org/"
  exit 1
fi
node --version
npm --version

# Install dependencies
echo ""
echo "Installing root dependencies..."
npm install || {
  echo "ERROR: Root npm install failed."
  exit 1
}

# Warn about environment files
echo ""
echo "====== ENVIRONMENT VARIABLES ======"
echo ""
echo "Frontend environment file:  frontend/.env"
echo "Backend environment file:   backend/.env"
echo ""
echo "Copy .env.example files to their respective .env files:"
echo "  - cp frontend/.env.example frontend/.env"
echo "  - cp backend/.env.example backend/.env"
echo ""
echo "Then fill in your local credentials for:"
echo "  - MongoDB URI (or use local Docker MongoDB)"
echo "  - Google OAuth credentials"
echo "  - Cloudinary credentials"
echo "  - Email service credentials"
echo ""

# Docker Compose MongoDB setup reminder
echo ""
echo "====== MONGODB SETUP ======"
echo ""
echo "Option 1: Use Docker Compose (recommended)"
echo "  docker compose up -d"
echo "  This starts a local MongoDB instance on port 27017"
echo ""
echo "Option 2: Use MongoDB Atlas (cloud)"
echo "  Set MONGODB_URI in backend/.env to your MongoDB Atlas connection string"
echo ""

# Final instructions
echo ""
echo "====== SETUP COMPLETE ======"
echo ""
echo "Next steps:"
echo "  1. Copy frontend/.env.example to frontend/.env"
echo "  2. Copy backend/.env.example to backend/.env"
echo "  3. Fill in environment variables with your local/staging credentials"
echo "  4. Start MongoDB: docker compose up -d"
echo "  5. Run development server: npm run dev"
echo ""
echo "For more information, see docs/environment.md and docs/README.md"
echo ""
