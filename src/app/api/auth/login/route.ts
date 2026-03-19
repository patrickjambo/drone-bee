import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { username, password, portal } = await req.json();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.is_deleted) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.is_blocked) {
      return NextResponse.json(
        { error: 'Account is blocked. Contact administrator.' },
        { status: 403 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (portal === 'admin' && user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required.' },
        { status: 403 }
      );
    }

    if (portal === 'manager' && user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Unauthorized. Manager credentials required.' },
        { status: 403 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        last_login: new Date(),
        last_ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret_development_only',
      { expiresIn: '8h' }
    );

    const response = NextResponse.json(
      {
        message: 'Logged in successfully',
        role: user.role,
        requiresPasswordChange: false, // Could implement if they need a reset
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
