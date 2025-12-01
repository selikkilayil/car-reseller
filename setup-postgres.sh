#!/bin/bash

echo "🐘 Car Reseller - PostgreSQL Setup"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Check if container already exists
if docker ps -a | grep -q car-reseller-db; then
    echo "⚠️  PostgreSQL container already exists"
    echo ""
    read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing old container..."
        docker stop car-reseller-db 2>/dev/null
        docker rm car-reseller-db 2>/dev/null
    else
        echo "Starting existing container..."
        docker start car-reseller-db
        echo "✅ PostgreSQL is running!"
        exit 0
    fi
fi

echo "🚀 Starting PostgreSQL in Docker..."
docker run --name car-reseller-db \
  -e POSTGRES_PASSWORD=carreseller123 \
  -e POSTGRES_DB=car_reseller \
  -e POSTGRES_USER=postgres \
  -p 5432:5432 \
  -d postgres:16

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Check if container is running
if docker ps | grep -q car-reseller-db; then
    echo "✅ PostgreSQL is running!"
    echo ""
    
    # Update .env file
    echo "📝 Updating .env file..."
    cat > .env << EOF
# PostgreSQL Database Connection
DATABASE_URL="postgresql://postgres:carreseller123@localhost:5432/car_reseller"
EOF
    
    echo "✅ .env file updated"
    echo ""
    
    # Remove old SQLite migrations
    if [ -d "prisma/migrations" ]; then
        echo "🗑️  Removing old SQLite migrations..."
        rm -rf prisma/migrations
    fi
    
    # Run migrations
    echo "🔄 Running database migrations..."
    npx prisma migrate dev --name init_postgres
    
    # Seed database
    echo "🌱 Seeding database..."
    npm run db:seed
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "📊 Database Info:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: car_reseller"
    echo "   Username: postgres"
    echo "   Password: carreseller123"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Run 'npm run dev' to start the application"
    echo "   2. Run 'npx prisma studio' to view the database"
    echo ""
    echo "🛑 To stop PostgreSQL:"
    echo "   docker stop car-reseller-db"
    echo ""
    echo "🔄 To start PostgreSQL again:"
    echo "   docker start car-reseller-db"
    echo ""
else
    echo "❌ Failed to start PostgreSQL"
    echo "   Check Docker logs: docker logs car-reseller-db"
    exit 1
fi
