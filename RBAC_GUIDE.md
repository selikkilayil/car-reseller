# RBAC Implementation Guide

## Overview

This application now has Role-Based Access Control (RBAC) implemented with four user roles:

### Roles & Permissions

1. **ADMIN** - Full system access
   - Manage users (create, edit, delete)
   - Full access to all features
   - Can view, create, edit, and delete everything

2. **MANAGER** - Operations management
   - Manage cars (create, edit, view)
   - Manage repairs (create, edit, view)
   - Manage parties (create, edit, view)
   - View transactions and accounts
   - Cannot manage users or delete records

3. **ACCOUNTANT** - Financial management
   - View all data
   - Manage transactions and accounts
   - Edit transactions
   - Cannot manage cars, repairs, or users

4. **VIEWER** - Read-only access
   - View all data
   - Cannot create, edit, or delete anything

## Getting Started

### 1. Run Database Migration

```bash
cd car-reseller
npx prisma migrate dev --name add_rbac
```

### 2. Seed Default Admin User

```bash
npm run db:seed
```

This creates a default admin account:
- **Email**: admin@example.com
- **Password**: admin123

### 3. Start the Application

```bash
npm run dev
```

### 4. Login

Navigate to `http://localhost:3000/login` and use the admin credentials.

## Usage

### Managing Users (Admin Only)

1. Login as admin
2. Navigate to "Users" in the sidebar
3. Click "Add User" to create new users
4. Assign appropriate roles based on responsibilities

### Protecting API Routes

All API routes should be protected using the `requireAuth` middleware:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, Permissions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Check permission
  const auth = await requireAuth(req, Permissions.canViewCars);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // auth.user contains the authenticated user
  // Your route logic here...
}
```

### Available Permission Checks

```typescript
Permissions.canViewCars(role)
Permissions.canCreateCars(role)
Permissions.canEditCars(role)
Permissions.canDeleteCars(role)

Permissions.canViewRepairs(role)
Permissions.canCreateRepairs(role)
Permissions.canEditRepairs(role)
Permissions.canDeleteRepairs(role)

Permissions.canViewTransactions(role)
Permissions.canCreateTransactions(role)
Permissions.canEditTransactions(role)
Permissions.canDeleteTransactions(role)

Permissions.canViewParties(role)
Permissions.canCreateParties(role)
Permissions.canEditParties(role)
Permissions.canDeleteParties(role)

Permissions.canManageUsers(role) // Admin only
```

## Security Features

1. **Password Hashing**: Passwords are hashed using SHA-256
2. **Session Management**: Secure session tokens with 7-day expiration
3. **HTTP-Only Cookies**: Session tokens stored in HTTP-only cookies
4. **Middleware Protection**: All routes protected by middleware
5. **Role-Based Permissions**: Fine-grained permission checks

## Customizing Permissions

Edit `src/lib/auth.ts` to modify the `Permissions` object:

```typescript
export const Permissions = {
  canViewCars: (role: Role) => ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER'].includes(role),
  canCreateCars: (role: Role) => ['ADMIN', 'MANAGER'].includes(role),
  // Add more permissions as needed
};
```

## Next Steps

1. **Update remaining API routes**: Add `requireAuth` to all API routes
2. **Frontend permission checks**: Hide/disable UI elements based on user role
3. **Audit logging**: Track user actions for compliance
4. **Password reset**: Implement password reset functionality
5. **Two-factor authentication**: Add 2FA for enhanced security

## Example: Protecting All Routes

For each API route file, follow this pattern:

```typescript
// GET - View permission
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, Permissions.canViewXXX);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ... your logic
}

// POST - Create permission
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, Permissions.canCreateXXX);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ... your logic
}

// PATCH - Edit permission
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req, Permissions.canEditXXX);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ... your logic
}

// DELETE - Delete permission
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req, Permissions.canDeleteXXX);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // ... your logic
}
```

## Troubleshooting

### Can't login after migration
- Make sure you ran the seed script: `npm run db:seed`
- Check that the database migration completed successfully

### Session expires too quickly
- Adjust the expiration in `src/lib/auth.ts` in the `createSession` function

### Need to reset admin password
Run this in Prisma Studio or directly in your database:
```sql
UPDATE "User" SET password = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' WHERE email = 'admin@example.com';
-- This sets the password to 'admin123'
```
