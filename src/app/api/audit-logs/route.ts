import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 전체 견적서 열람/감사 로그 조회 (ADMIN 전용)
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '열람 이력 및 감사 로그는 시스템 관리자(ADMIN)만 조회할 수 있습니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get('estimateId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    const where: any = {};
    if (estimateId) where.estimateId = estimateId;
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const logs = await prisma.estimateViewLog.findMany({
      where,
      include: {
        estimate: {
          select: {
            id: true,
            estimateNumber: true,
            version: true,
            title: true,
            project: {
              select: {
                title: true,
                company: {
                  select: { name: true },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            department: true,
            position: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}