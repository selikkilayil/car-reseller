# Quick PostgreSQL Setup

Choose your preferred method:

## Method 1: Automated Setup (Recommended)

Run the setup script:

```bash
./setup-postgres.sh
```

This will:
- Start PostgreSQL in Docker
- Update your .env file
- Run migrations
- Seed the database

Then just run:
```bash
npm run dev
```

---

## Method 2: Manual Setup with Docker

### Step 1: Start PostgreSQL

```bash
docker run --name car-reseller-db \
  -e POSTGRES_PASSWORD=carreseller123 \
  -e POSTGRES_DB=car_reseller \
  -p 5432:5432 \
  -d postgres:16
```

### Step 2: Update .env

Replace the content of `.env` with:

```env
DATABASE_URL="postgresql://postgres:carreseller123@localhost:5432/car_reseller"
```

### Step 3: Migrate Database

```bash
# Remove old SQLite migrations
rm -rf prisma/migrations

# Create new PostgreSQL migration
npx prisma migrate dev --name init_postgres

# Seed database
npm run db:seed
```

### Step 4: Start Application

```bash
npm run dev
```

---

## Method 3: Use Cloud PostgreSQL (No Docker Needed)

### Option A: Supabase (Free)

1. Go to https://supabase.com
2. Create a new project
3. Get your connection string from Settings → Database
4. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?sslmode=require"
   ```

### Option B: Neon (Free)

1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `.env` with the provided URL

### Then run:

```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init_postgres
npm run db:seed
npm run dev
```

---

## Verify Setup

Check if PostgreSQL is running:

```bash
# For Docker
docker ps | grep car-reseller-db

# Test connection
npx prisma studio
```

---

## Common Commands

```bash
# View database in browser
npx prisma studio

# Stop PostgreSQL (Docker)
docker stop car-reseller-db

# Start PostgreSQL (Docker)
docker start car-reseller-db

# View PostgreSQL logs (Docker)
docker logs car-reseller-db

# Remove PostgreSQL (Docker)
docker stop car-reseller-db
docker rm car-reseller-db
```

---

## Troubleshooting

### Port 5432 already in use

```bash
# Find what's using the port
lsof -i :5432

# Stop it or use a different port
docker run --name car-reseller-db \
  -e POSTGRES_PASSWORD=carreseller123 \
  -e POSTGRES_DB=car_reseller \
  -p 5433:5432 \
  -d postgres:16

# Update .env to use port 5433
DATABASE_URL="postgresql://postgres:carreseller123@localhost:5433/car_reseller"
```

### Docker not installed

Install Docker Desktop:
- macOS: https://docs.docker.com/desktop/install/mac-install/
- Windows: https://docs.docker.com/desktop/install/windows-install/
- Linux: https://docs.docker.com/desktop/install/linux-install/

### Connection refused

Make sure PostgreSQL is running:
```bash
docker ps
```

If not running:
```bash
docker start car-reseller-db
```

---

## What Changed?

- ✅ Database: SQLite → PostgreSQL
- ✅ Schema updated for PostgreSQL
- ✅ All features work the same
- ✅ Better performance
- ✅ Production-ready

Your data will be fresh (empty database). If you need to keep SQLite data, see POSTGRES_MIGRATION.md for data migration steps.
