import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const estimates = await prisma.estimate.findMany({
      include: {
        project: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = estimates.length;
    const totalAmount = estimates.reduce((acc, cur) => acc + cur.grandTotal, 0);

    // 상태별 집계
    const statusCounts = {
      DRAFT: 0,
      REVIEW: 0,
      SENT: 0,
      WON: 0,
      LOST: 0,
      CANCELED: 0,
    };

    const statusAmounts = {
      DRAFT: 0,
      REVIEW: 0,
      SENT: 0,
      WON: 0,
      LOST: 0,
      CANCELED: 0,
    };

    estimates.forEach((est) => {
      const st = est.status as keyof typeof statusCounts;
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
        statusAmounts[st] += est.grandTotal;
      }
    });

    // 수주율 계산 (수주 / (수주 + 실주 + 제출 + 검토))
    const closedOrActive = statusCounts.WON + statusCounts.LOST + statusCounts.SENT + statusCounts.REVIEW;
    const winRate = closedOrActive > 0 ? Math.round((statusCounts.WON / closedOrActive) * 100) : 0;

    // 고객사 및 프로젝트 수
    const companyCount = await prisma.company.count();
    const projectCount = await prisma.project.count();

    // 최근 견적 6건
    const recentEstimates = estimates.slice(0, 6);

    // 고객사별 견적 집계 (Top 5)
    const companyMap = new Map<string, { name: string; count: number; totalAmount: number; wonCount: number }>();
    estimates.forEach((est) => {
      const comp = est.project?.company;
      if (comp) {
        const existing = companyMap.get(comp.id) || { name: comp.name, count: 0, totalAmount: 0, wonCount: 0 };
        existing.count++;
        existing.totalAmount += est.grandTotal;
        if (est.status === 'WON') existing.wonCount++;
        companyMap.set(comp.id, existing);
      }
    });

    const topCompanies = Array.from(companyMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalCount,
        totalAmount,
        wonAmount: statusAmounts.WON,
        winRate,
        companyCount,
        projectCount,
      },
      statusCounts,
      statusAmounts,
      recentEstimates,
      topCompanies,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
