# PostgreSQL Migration Guide

## Prerequisites

You need PostgreSQL installed and running. Choose one option:

### Option 1: Local PostgreSQL Installation

**macOS (using Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Create Database:**
```bash
createdb car_reseller
```

### Option 2: Docker (Recommended for Development)

```bash
# Run PostgreSQL in Docker
docker run --name car-reseller-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=car_reseller \
  -p 5432:5432 \
  -d postgres:16

# Check if running
docker ps
```

### Option 3: Cloud PostgreSQL (Production)

Use services like:
- Supabase (Free tier available)
- Neon (Free tier available)
- Railway
- Render
- AWS RDS
- Digital Ocean

## Migration Steps

### 1. Update Environment Variables

Edit `.env` file:

```env
# For Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/car_reseller"

# For Docker
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/car_reseller"

# For Supabase/Neon (they provide the URL)
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
```

### 2. Update Prisma Schema

The schema has been updated to use PostgreSQL. Changes made:
- Changed provider from `sqlite` to `postgresql`
- Updated `@default(cuid())` to work with PostgreSQL

### 3. Backup Your SQLite Data (Optional)

If you have important data in SQLite:

```bash
# Export data to JSON
node scripts/export-sqlite-data.js

# Or manually backup the database file
cp prisma/dev.db prisma/dev.db.backup
```

### 4. Run Migration

```bash
# Delete old migrations (they're SQLite-specific)
rm -rf prisma/migrations

# Create new PostgreSQL migration
npx prisma migrate dev --name init_postgres

# Generate Prisma Client
npx prisma generate

# Seed the database
npm run db:seed
```

### 5. Start the Application

```bash
npm run dev
```

## Verification

Test that everything works:

```bash
# Check database connection
npx prisma studio

# Test API endpoints
curl http://localhost:3000/api/repair-types
curl http://localhost:3000/api/cars
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `brew services list` or `docker ps`
- Check port 5432 is not in use: `lsof -i :5432`

### Authentication Failed
- Verify username and password in DATABASE_URL
- For local PostgreSQL, you might need to create a user:
  ```bash
  psql postgres
  CREATE USER youruser WITH PASSWORD 'yourpassword';
  ALTER USER youruser CREATEDB;
  ```

### SSL Required
For cloud databases, add `?sslmode=require` to the connection string:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

## Data Migration (If Needed)

If you need to migrate existing SQLite data to PostgreSQL:

1. Export from SQLite:
```bash
sqlite3 prisma/dev.db .dump > backup.sql
```

2. Clean up the SQL file (remove SQLite-specific syntax)

3. Import to PostgreSQL:
```bash
psql car_reseller < backup.sql
```

Or use a tool like `pgloader`:
```bash
brew install pgloader
pgloader prisma/dev.db postgresql://localhost/car_reseller
```

## Differences from SQLite

PostgreSQL advantages:
- ✅ Better performance for concurrent users
- ✅ Advanced features (JSON, full-text search, etc.)
- ✅ Production-ready
- ✅ Better data integrity
- ✅ Supports multiple connections

Things to note:
- Case-sensitive by default
- Stricter type checking
- Better transaction support
- Requires a running server (unlike SQLite's file-based approach)

## Quick Start with Docker

The easiest way to get started:

```bash
# 1. Start PostgreSQL
docker run --name car-reseller-db \
  -e POSTGRES_PASSWORD=carreseller123 \
  -e POSTGRES_DB=car_reseller \
  -p 5432:5432 \
  -d postgres:16

# 2. Update .env
echo 'DATABASE_URL="postgresql://postgres:carreseller123@localhost:5432/car_reseller"' > .env

# 3. Migrate
rm -rf prisma/migrations
npx prisma migrate dev --name init_postgres
npm run db:seed

# 4. Start app
npm run dev
```

## Stopping/Starting PostgreSQL

**Docker:**
```bash
docker stop car-reseller-db
docker start car-reseller-db
docker rm car-reseller-db  # Remove container
```

**Homebrew:**
```bash
brew services stop postgresql@16
brew services start postgresql@16
```

## Production Deployment

For production, use a managed PostgreSQL service:

1. **Supabase** (Recommended for beginners)
   - Free tier available
   - Provides connection string
   - Built-in dashboard

2. **Neon** (Serverless PostgreSQL)
   - Free tier available
   - Auto-scaling
   - Branching support

3. **Railway/Render**
   - Easy deployment
   - Integrated with Git

Update your production `.env` with the provided DATABASE_URL.
