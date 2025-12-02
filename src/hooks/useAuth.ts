'use client';

import { useState, useEffect } from 'react';

export type Role = 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const can = {
    // Cars
    viewCars: () => ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER'].includes(user?.role || ''),
    createCars: () => ['ADMIN', 'MANAGER'].includes(user?.role || ''),
    editCars: () => ['ADMIN', 'MANAGER'].includes(user?.role || ''),
    deleteCars: () => user?.role === 'ADMIN',

    // Repairs
    viewRepairs: () => ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER'].includes(user?.role || ''),
    createRepairs: () => ['ADMIN', 'MANAGER'].includes(user?.role || ''),
    editRepairs: () => ['ADMIN', 'MANAGER'].includes(user?.role || ''),
    deleteRepairs: () => user?.role === 'ADMIN',

    // Transactions
    viewTransactions: () => ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER'].includes(user?.role || ''),
    createTransactions: () => ['ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(user?.role || ''),
    editTransactions: () => ['ADMIN', 'ACCOUNTANT'].includes(user?.role || ''),
    deleteTransactions: () => user?.role === 'ADMIN',

    // Parties
    viewParties: () => ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER'].includes(user?.role || ''),
    createParties: () => ['ADMIN', 'MANAGER'].includes(user?.role || ''),
    editParties: () => ['ADMIN', 'MANAGER'].includes(user?.role || ''),
    deleteParties: () => user?.role === 'ADMIN',

    // Users
    manageUsers: () => user?.role === 'ADMIN',
  };

  return { user, loading, can };
}
