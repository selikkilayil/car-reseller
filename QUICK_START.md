# 🚀 RBAC Quick Start Guide

## Step-by-Step Setup (5 minutes)

### Step 1: Run the Setup Script
```bash
cd car-reseller
./setup-rbac.sh
```

This will automatically:
- ✅ Generate Prisma client with User and Session models
- ✅ Create and run database migration
- ✅ Seed database with default admin user

### Step 2: Start the Development Server
```bash
npm run dev
```

### Step 3: Login
1. Open your browser to `http://localhost:3000`
2. You'll be redirected to the login page
3. Use these credentials:
   - **Email**: `admin@example.com`
   - **Password**: `admin123`

### Step 4: Create Your First User
1. After logging in, click "Users" in the sidebar
2. Click "Add User"
3. Fill in the form:
   - Name: Your name
   - Email: Your email
   - Password: Choose a password
   - Role: Select appropriate role
4. Click "Create"

### Step 5: Change Admin Password (Recommended)
1. In the Users page, click the edit icon next to the admin user
2. Enter a new secure password
3. Click "Update"

## ✅ That's It!

Your application now has:
- 🔐 Secure authentication
- 👥 User management
- 🎯 Role-based permissions
- 🚪 Login/logout functionality

## What's Next?

### Protect Your API Routes
Add authentication to your remaining API routes. Example:

```typescript
import { requireAuth, Permissions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, Permissions.canViewCars);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // Your code here
}
```

### Use Permissions in Frontend
```typescript
import { useAuth } from '@/hooks/useAuth';

export default function MyPage() {
  const { can } = useAuth();
  
  return (
    <>
      {can.createCars() && <button>Add Car</button>}
    </>
  );
}
```

## 📚 Full Documentation
- `RBAC_SUMMARY.md` - Complete overview
- `RBAC_GUIDE.md` - Detailed implementation guide
- `RBAC_FRONTEND_EXAMPLE.md` - Frontend code examples

## 🆘 Need Help?
Check the Troubleshooting section in `RBAC_SUMMARY.md`
