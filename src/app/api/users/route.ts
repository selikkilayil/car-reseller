import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, Permissions, hashPassword } from '@/lib/auth';

// Get all users (Admin only)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, Permissions.canManageUsers);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new user (Admin only)
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, Permissions.canManageUsers);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { username, password, name, role } = await request.json();

    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Username, password, name, and role are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this username already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
