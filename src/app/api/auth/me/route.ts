import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ user, authenticated: true });
  } catch (error: any) {
    return NextResponse.json({ user: null, authenticated: false }, { status: 500 });
  }
}