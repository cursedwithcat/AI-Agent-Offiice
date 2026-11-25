import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import prisma from './prisma';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.warn('[SECURITY WARNING] JWT_SECRET environment variable is not defined. Using fallback secret.');
    }
    return 'pwkfastwork-secret-key-jwt-2026';
  }
  return secret;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'JOB_SEEKER' | 'COMPANY' | 'UNIVERSITY' | 'ADMIN';
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest) {
  // Check cookie first
  let token = request.cookies.get('pwk_token')?.value;

  // Fallback to Authorization header
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        jobSeekerProfile: {
          include: {
            university: {
              include: {
                universityProfile: true,
              },
            },
          },
        },
        companyProfile: true,
        universityProfile: true,
      },
    });

    if (!user || user.status === 'SUSPENDED') return null;

    return user;
  } catch (error) {
    console.error('Error in getUserFromRequest:', error);
    return null;
  }
}
