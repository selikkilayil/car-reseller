# Prisma Migration Commands

## 🚀 Common Migration Commands

### 1. Create and Apply Migration (Development)
```bash
npx prisma migrate dev --name your_migration_name
```
This will:
- Create a new migration file
- Apply it to your database
- Generate Prisma Client

**Example:**
```bash
npx prisma migrate dev --name add_user_table
npx prisma migrate dev --name update_car_fields
```

### 2. Apply Existing Migrations (Production)
```bash
npx prisma migrate deploy
```
Use this in production to apply pending migrations.

### 3. Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```
This will:
- Drop the database
- Create it again
- Apply all migrations
- Run seed script

**With force (no confirmation):**
```bash
npx prisma migrate reset --force
```

### 4. Check Migration Status
```bash
npx prisma migrate status
```
Shows which migrations are applied and which are pending.

### 5. Generate Prisma Client
```bash
npx prisma generate
```
Regenerates the Prisma Client after schema changes.

### 6. View Database in Browser
```bash
npx prisma studio
```
Opens a GUI to view and edit your database.

---

## 📋 Step-by-Step Workflow

### When You Change the Schema:

1. **Edit** `prisma/schema.prisma`
2. **Create migration:**
   ```bash
   npx prisma migrate dev --name describe_your_change
   ```
3. **Done!** The migration is applied and client is generated.

### When You Pull Code with New Migrations:

```bash
# Apply the new migrations
npx prisma migrate dev

# Or in production
npx prisma migrate deploy
```

### When You Want to Start Fresh:

```bash
# Reset everything
npx prisma migrate reset --force

# Seed the database
npm run db:seed
```

---

## 🔧 Your Current Setup

### Database Info:
- **Type:** PostgreSQL 15
- **Database:** car_reseller
- **Connection:** postgresql://selik@localhost:5432/car_reseller

### To Apply Current Schema:
```bash
# If you haven't run migrations yet
npx prisma migrate dev --name init

# If migrations exist, just apply them
npx prisma migrate deploy
```

### To Reset and Start Fresh:
```bash
npx prisma migrate reset --force
npm run db:seed
```

---

## 📝 Migration Files

Migrations are stored in: `prisma/migrations/`

Each migration has:
- A timestamp folder (e.g., `20251201111211_init_postgres/`)
- A `migration.sql` file with the SQL commands

**Example structure:**
```
prisma/
├── migrations/
│   ├── 20251201111211_init_postgres/
│   │   └── migration.sql
│   └── migration_lock.toml
└── schema.prisma
```

---

## ⚠️ Important Notes

### Development vs Production

**Development (`migrate dev`):**
- Creates migration files
- Applies them immediately
- Generates Prisma Client
- Can reset database if needed

**Production (`migrate deploy`):**
- Only applies existing migrations
- Never creates new migrations
- Safer for production use

### When to Use Each Command

| Command | When to Use |
|---------|-------------|
| `migrate dev` | Local development, creating new migrations |
| `migrate deploy` | Production, CI/CD, applying existing migrations |
| `migrate reset` | Start fresh, clear all data |
| `migrate status` | Check what's applied |
| `generate` | After pulling schema changes |
| `studio` | View/edit data visually |

---

## 🎯 Quick Reference

```bash
# Most common workflow
npx prisma migrate dev --name my_change    # Create & apply migration
npx prisma studio                          # View database

# Reset everything
npx prisma migrate reset --force           # Clear database
npm run db:seed                            # Add initial data

# Check status
npx prisma migrate status                  # See migration status
npx prisma validate                        # Validate schema

# Production
npx prisma migrate deploy                  # Apply migrations
npx prisma generate                        # Generate client
```

---

## 🔍 Troubleshooting

### "Migration failed" error:
```bash
# Check what went wrong
npx prisma migrate status

# Reset and try again
npx prisma migrate reset --force
npx prisma migrate dev --name init
```

### "Client is not generated":
```bash
npx prisma generate
```

### "Database is out of sync":
```bash
# Option 1: Reset (loses data)
npx prisma migrate reset --force

# Option 2: Create new migration
npx prisma migrate dev --name fix_sync
```

### Check PostgreSQL is running:
```bash
brew services list | grep postgres
# If not running:
brew services start postgresql@15
```

---

## 📚 Additional Resources

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Migration Troubleshooting](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)

---

**Need help?** Check `POSTGRES_SUCCESS.md` for your current setup details.
