import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import * as crypto from 'crypto';

export type Role = 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'VIEWER';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: Role;
}

// Hash password using Node's crypto
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate session token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create session
export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

// Verify session and get user
export async function verifySession(token: string): Promise<AuthUser | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    return null;
  }

  return {
    id: session.user.id,
    username: session.user.username,
    name: session.user.name,
    role: session.user.role as Role,
  };
}

// Get user from request
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('session')?.value;
  if (!token) return null;
  return verifySession(token);
}

// Permission checks
export const Permissions = {
  // Cars
  canViewCars: (role: Role) => ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER'].includes(role),
  canCreateCars: (role: Role) => ['ADMIN', 'MANAGER'].includes(role),
  canEditCars: (role: Role) => ['ADMIN', 'MANAGER'].includes(role),
  canDeleteCars: (role: Role) => ['ADMIN'].includes(role),

  // Repairs
  canViewRepairs: (role: Role) => ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER'].includes(role),
  canCreateRepairs: (role: Role) => ['ADMIN', 'MANAGER'].includes(role),
  canEditRepairs: (role: Role) => ['ADMIN', 'MANAGER'].includes(role),
  canDeleteRepairs: (role: Role) => ['ADMIN'].includes(role),

  // Transactions & Accounts
  canViewTransactions: (role: Role) => ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER'].includes(role),
  canCreateTransactions: (role: Role) => ['ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(role),
  canEditTransactions: (role: Role) => ['ADMIN', 'ACCOUNTANT'].includes(role),
  canDeleteTransactions: (role: Role) => ['ADMIN'].includes(role),

  // Parties
  canViewParties: (role: Role) => ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER'].includes(role),
  canCreateParties: (role: Role) => ['ADMIN', 'MANAGER'].includes(role),
  canEditParties: (role: Role) => ['ADMIN', 'MANAGER'].includes(role),
  canDeleteParties: (role: Role) => ['ADMIN'].includes(role),

  // Users (Admin only)
  canManageUsers: (role: Role) => role === 'ADMIN',
};

// Middleware helper for API routes
export async function requireAuth(
  request: NextRequest,
  requiredPermission?: (role: Role) => boolean
): Promise<{ user: AuthUser } | { error: string; status: number }> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  if (requiredPermission && !requiredPermission(user.role)) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user };
}
