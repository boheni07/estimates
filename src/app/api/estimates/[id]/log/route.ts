import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 견적서 열람 이력 기록
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser(request);
    const body = await request.json().catch(() => ({}));
    const { action = 'VIEW' } = body;

    const estimate = await prisma.estimate.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!estimate) {
      return NextResponse.json({ error: '견적서를 찾을 수 없습니다.' }, { status: 404 });
    }

    const userName = sessionUser?.name || '비로그인 사용자';
    const userDept = sessionUser ? `${sessionUser.department} ${sessionUser.position}` : null;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
    const userAgent = request.headers.get('user-agent') || null;

    const log = await prisma.estimateViewLog.create({
      data: {
        estimateId: params.id,
        userId: sessionUser?.id || null,
        userName,
        userDept,
        action,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('Error logging view event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}