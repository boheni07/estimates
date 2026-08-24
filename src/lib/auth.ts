import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/estimate';

const JWT_SECRET = process.env.JWT_SECRET || 'estimate-secret-jwt-key-2026-antigravity';
export const AUTH_COOKIE_NAME = 'estimate_auth_token';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  department: string;
  position: string;
  role: UserRole;
  email?: string | null;
  phone?: string | null;
}

/**
 * 비밀번호 단방향 해싱
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * 비밀번호 일치 여부 확인
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * JWT 토큰 생성
 */
export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      department: user.department,
      position: user.position,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * JWT 토큰 검증 및 복호화
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * 현재 요청(Route Handler 또는 Server Component)의 로그인 사용자 정보 조회
 */
export async function getSessionUser(request?: Request): Promise<AuthUser | null> {
  try {
    let token: string | undefined;

    if (request) {
      // 1. Authorization Bearer 헤더
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      // 2. NextRequest cookies 객체 (Next.js)
      if (!token && 'cookies' in request && typeof (request as any).cookies?.get === 'function') {
        token = (request as any).cookies.get(AUTH_COOKIE_NAME)?.value;
      }

      // 3. Raw Cookie 헤더
      if (!token) {
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
          const cookiesList = cookieHeader.split(';');
          for (const c of cookiesList) {
            const [name, ...rest] = c.trim().split('=');
            if (name === AUTH_COOKIE_NAME) {
              token = decodeURIComponent(rest.join('='));
              break;
            }
          }
        }
      }
    }

    // 4. next/headers cookies() (Server Component / Action)
    if (!token) {
      try {
        const cookieStore = cookies();
        token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
      } catch (e) {
        // ignore in static or edge contexts
      }
    }

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // DB에서 실제 활성 사용자 여부 확인
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        name: true,
        department: true,
        position: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      department: user.department,
      position: user.position,
      phone: user.phone,
      email: user.email,
      role: user.role as UserRole,
    };
  } catch (err) {
    console.error('getSessionUser error:', err);
    return null;
  }
}