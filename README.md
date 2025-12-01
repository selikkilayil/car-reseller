# Car Reseller Management System

A comprehensive system for managing car reselling business operations including purchases, repairs, sales, and financial tracking.

## Features

### 🚗 Car Lifecycle Management
- **Purchase**: Record car purchases from direct users or dealerships
- **Repair**: Track repairs by type (bodywork, electric, painting, spares, etc.)
- **Sale**: Manage sales with profit calculations
- **Status Tracking**: PURCHASED → IN_REPAIR → READY_FOR_SALE → SOLD → DELIVERED

### 💰 Financial Tracking
- Multiple bank account management
- Cash on hand tracking
- Transaction recording for all operations
- Payment method support: Bank, Cash, or Mixed
- Automatic balance updates

### 📊 Comprehensive Tracking
- **Parties**: Manage sellers, buyers, brokers, and dealerships
- **Expenses**: Track expenses by category (purchase, repair, sale)
- **Repairs**: Categorized repair types with cost tracking
- **Profit Calculation**: Real-time profit/loss calculation per vehicle

### 🔍 Key Features
- Loan vehicle handling (track loan amount vs. amount paid)
- Brokerage tracking for both purchases and sales
- Detailed expense tracking (travel, fuel, delivery, etc.)
- Complete transaction history
- Summary view showing total costs and profit

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: Prisma 6 + PostgreSQL (was SQLite, now migrated)
- **Forms**: React Hook Form + Zod validation
- **UI**: Custom components with Lucide icons
- **Currency**: Indian Rupees (₹) with Indian numbering system

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to project
cd car-reseller

# Install dependencies
npm install

# Setup PostgreSQL (choose one method):

# Method 1: Automated setup with Docker
./setup-postgres.sh

# Method 2: Manual setup (see QUICK_POSTGRES_SETUP.md)
# - Start PostgreSQL (Docker or local)
# - Update .env with DATABASE_URL
# - Run: npx prisma migrate dev --name init
# - Run: npm run db:seed

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

**Note**: See `QUICK_POSTGRES_SETUP.md` for detailed PostgreSQL setup instructions.

## Database Schema

### Core Models
- **Car**: Main entity tracking vehicle lifecycle
- **Party**: Sellers, buyers, brokers, dealerships
- **BankAccount**: Bank account tracking
- **CashAccount**: Cash on hand tracking
- **Repair**: Repair records with types
- **RepairType**: Categories of repairs
- **Expense**: Additional expenses by category
- **Transaction**: All financial transactions

## Usage Guide

### 1. Setup Accounts
1. Go to **Accounts** page
2. Add your bank accounts
3. Set initial cash balance

### 2. Add Parties
1. Go to **Parties** page
2. Add sellers, buyers, brokers, and dealerships
3. Include contact information

### 3. Purchase a Car
1. Go to **Cars** page
2. Click "New Purchase"
3. Fill in vehicle details
4. Select seller and payment method
5. Add brokerage if applicable
6. Handle loan vehicles if needed

### 4. Add Repairs
1. Open car detail page
2. Go to "Repairs" tab
3. Add repairs by type
4. Track costs and vendors
5. Add repair-related expenses

### 5. Mark Ready for Sale
1. When repairs complete, click "Mark Ready for Sale"
2. Car status updates to READY_FOR_SALE

### 6. Record Sale
1. Click "Record Sale" on ready cars
2. Enter net rate and sale price
3. System shows total cost and estimated profit
4. Select buyer and payment method
5. Add sale expenses (delivery, etc.)

### 7. Track Finances
- Dashboard shows total bank and cash balances
- Each transaction updates account balances
- View complete transaction history per car

## API Routes

- `GET/POST /api/cars` - List/create cars
- `GET /api/cars/[id]` - Get car details with summary
- `PATCH /api/cars/[id]/status` - Update car status
- `POST /api/cars/[id]/sale` - Record sale
- `GET/POST /api/parties` - Manage parties
- `GET/POST /api/bank-accounts` - Manage bank accounts
- `GET/PUT /api/cash-account` - Manage cash
- `POST /api/repairs` - Add repairs
- `POST /api/expenses` - Add expenses
- `GET/POST /api/repair-types` - Manage repair types

## PostgreSQL Setup

The system now uses PostgreSQL. Quick setup:

```bash
# Automated setup (recommended)
./setup-postgres.sh

# Or see detailed guides:
# - QUICK_POSTGRES_SETUP.md (step-by-step)
# - POSTGRES_MIGRATION.md (detailed with troubleshooting)
```

**Cloud Options** (no Docker needed):
- Supabase (free tier)
- Neon (free tier)
- Railway, Render, etc.

Just update `.env` with your connection string!

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Project Structure

```
car-reseller/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts            # Seed data
│   └── migrations/        # Migration history
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── cars/          # Cars pages
│   │   ├── parties/       # Parties page
│   │   ├── accounts/      # Accounts page
│   │   ├── repair-types/  # Repair types page
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Dashboard
│   ├── components/
│   │   ├── forms/         # Form components
│   │   ├── ui/            # UI components
│   │   ├── CarDetail.tsx  # Car detail view
│   │   └── Sidebar.tsx    # Navigation
│   ├── hooks/
│   │   └── useData.ts     # Data fetching hooks
│   └── lib/
│       ├── prisma.ts      # Prisma client
│       └── validations.ts # Zod schemas
└── package.json
```

## License

MIT
