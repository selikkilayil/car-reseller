# Quick Command Reference

## 🚀 Most Used Commands

### Run Migrations
```bash
npm run db:migrate
# or
npx prisma migrate dev --name your_change_name
```

### View Database
```bash
npm run db:studio
# or
npx prisma studio
```

### Reset Database (⚠️ Deletes all data)
```bash
npm run db:reset
# or
npx prisma migrate reset --force && npm run db:seed
```

### Check Migration Status
```bash
npm run db:migrate:status
# or
npx prisma migrate status
```

---

## 📦 NPM Scripts Available

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start development server |
| `npm run db:migrate` | Create and apply migration |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:migrate:reset` | Reset database |
| `npm run db:migrate:status` | Check migration status |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:studio` | Open database GUI |
| `npm run db:seed` | Seed database |
| `npm run db:reset` | Reset + seed database |

---

## 🔄 Common Workflows

### 1. Change Database Schema
```bash
# 1. Edit prisma/schema.prisma
# 2. Run migration
npm run db:migrate

# 3. Enter migration name when prompted
# Example: "add_user_email_field"
```

### 2. Start Fresh Database
```bash
npm run db:reset
```

### 3. View/Edit Data
```bash
npm run db:studio
```

### 4. Check What's Applied
```bash
npm run db:migrate:status
```

---

## 🐘 PostgreSQL Commands

### Check if Running
```bash
brew services list | grep postgres
```

### Start/Stop/Restart
```bash
brew services start postgresql@15
brew services stop postgresql@15
brew services restart postgresql@15
```

### Connect to Database
```bash
psql car_reseller
```

### View Tables
```bash
psql car_reseller -c "\dt"
```

---

## 🆘 Troubleshooting

### Migration Failed?
```bash
npm run db:migrate:status    # Check status
npm run db:reset             # Reset and try again
```

### Database Connection Error?
```bash
brew services restart postgresql@15
```

### Client Not Generated?
```bash
npm run db:generate
```

---

## 📍 Your Setup

- **Database:** PostgreSQL 15
- **Name:** car_reseller
- **Connection:** postgresql://selik@localhost:5432/car_reseller
- **App URL:** http://localhost:3000

---

**For detailed info, see:** `PRISMA_COMMANDS.md`
