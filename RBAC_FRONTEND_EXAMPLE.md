# Frontend RBAC Usage Examples

## Using the useAuth Hook

The `useAuth` hook provides easy access to user information and permission checks in your React components.

### Basic Usage

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, loading, can } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Role: {user?.role}</p>
      
      {/* Conditionally show buttons based on permissions */}
      {can.createCars() && (
        <button>Add New Car</button>
      )}
      
      {can.editCars() && (
        <button>Edit Car</button>
      )}
      
      {can.deleteCars() && (
        <button>Delete Car</button>
      )}
    </div>
  );
}
```

### Example: Cars List Page with Permissions

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function CarsPage() {
  const { user, can } = useAuth();
  const [cars, setCars] = useState([]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Cars</h1>
        
        {/* Only show Add button for users who can create cars */}
        {can.createCars() && (
          <button className="btn-primary">
            <Plus size={20} />
            Add Car
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Make</th>
            <th>Model</th>
            <th>Year</th>
            <th>Status</th>
            {(can.editCars() || can.deleteCars()) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {cars.map(car => (
            <tr key={car.id}>
              <td>{car.make}</td>
              <td>{car.model}</td>
              <td>{car.year}</td>
              <td>{car.status}</td>
              {(can.editCars() || can.deleteCars()) && (
                <td>
                  {can.editCars() && (
                    <button onClick={() => handleEdit(car.id)}>
                      <Edit2 size={18} />
                    </button>
                  )}
                  {can.deleteCars() && (
                    <button onClick={() => handleDelete(car.id)}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Example: Disable Form Fields for Viewers

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function CarForm() {
  const { can } = useAuth();
  const isReadOnly = !can.editCars();

  return (
    <form>
      <input
        type="text"
        name="make"
        disabled={isReadOnly}
        className={isReadOnly ? 'bg-gray-100' : ''}
      />
      
      <input
        type="text"
        name="model"
        disabled={isReadOnly}
        className={isReadOnly ? 'bg-gray-100' : ''}
      />
      
      {!isReadOnly && (
        <button type="submit">Save Changes</button>
      )}
    </form>
  );
}
```

### Example: Role-Based Navigation

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export function Navigation() {
  const { user, can } = useAuth();

  return (
    <nav>
      <Link href="/">Dashboard</Link>
      
      {can.viewCars() && (
        <Link href="/cars">Cars</Link>
      )}
      
      {can.viewParties() && (
        <Link href="/parties">Parties</Link>
      )}
      
      {can.viewTransactions() && (
        <Link href="/transactions">Transactions</Link>
      )}
      
      {can.manageUsers() && (
        <Link href="/users">Users</Link>
      )}
      
      <div className="user-info">
        <span>{user?.name}</span>
        <span className="badge">{user?.role}</span>
      </div>
    </nav>
  );
}
```

### Example: Conditional Rendering Based on Role

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show different content based on role */}
      {user?.role === 'ADMIN' && (
        <div className="admin-panel">
          <h2>Admin Panel</h2>
          <p>System statistics and user management</p>
        </div>
      )}
      
      {user?.role === 'MANAGER' && (
        <div className="manager-panel">
          <h2>Manager Dashboard</h2>
          <p>Operations overview and car management</p>
        </div>
      )}
      
      {user?.role === 'ACCOUNTANT' && (
        <div className="accountant-panel">
          <h2>Financial Dashboard</h2>
          <p>Transactions and account balances</p>
        </div>
      )}
      
      {user?.role === 'VIEWER' && (
        <div className="viewer-panel">
          <h2>Overview</h2>
          <p>Read-only access to system data</p>
        </div>
      )}
    </div>
  );
}
```

## Available Permission Methods

```typescript
const { can } = useAuth();

// Cars
can.viewCars()      // ADMIN, MANAGER, ACCOUNTANT, VIEWER
can.createCars()    // ADMIN, MANAGER
can.editCars()      // ADMIN, MANAGER
can.deleteCars()    // ADMIN only

// Repairs
can.viewRepairs()   // ADMIN, MANAGER, ACCOUNTANT, VIEWER
can.createRepairs() // ADMIN, MANAGER
can.editRepairs()   // ADMIN, MANAGER
can.deleteRepairs() // ADMIN only

// Transactions
can.viewTransactions()   // ADMIN, MANAGER, ACCOUNTANT, VIEWER
can.createTransactions() // ADMIN, MANAGER, ACCOUNTANT
can.editTransactions()   // ADMIN, ACCOUNTANT
can.deleteTransactions() // ADMIN only

// Parties
can.viewParties()   // ADMIN, MANAGER, ACCOUNTANT, VIEWER
can.createParties() // ADMIN, MANAGER
can.editParties()   // ADMIN, MANAGER
can.deleteParties() // ADMIN only

// Users
can.manageUsers()   // ADMIN only
```

## Best Practices

1. **Always check permissions on both frontend and backend**
   - Frontend checks improve UX by hiding unavailable features
   - Backend checks ensure security (never trust the client)

2. **Show appropriate feedback**
   - Hide buttons/features users can't access
   - Show disabled state with tooltips explaining why

3. **Handle loading states**
   - Show loading indicators while checking auth
   - Prevent flickering by waiting for auth to load

4. **Graceful degradation**
   - If auth check fails, default to most restrictive permissions
   - Show appropriate error messages

5. **Keep permissions in sync**
   - Frontend permissions in `useAuth` should match backend `Permissions`
   - Update both when changing role capabilities
