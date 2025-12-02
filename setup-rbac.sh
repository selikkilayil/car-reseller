#!/bin/bash

echo "🔐 Setting up RBAC for Car Reseller System..."

# Generate Prisma client with new schema
echo "📦 Generating Prisma client..."
npx prisma generate

# Run migration
echo "🗄️  Running database migration..."
npx prisma migrate dev --name add_rbac

# Seed database with default admin
echo "🌱 Seeding database with default admin user..."
npm run db:seed

echo "✅ RBAC setup complete!"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "Start the app with: npm run dev"
echo "Then navigate to: http://localhost:3000/login"
