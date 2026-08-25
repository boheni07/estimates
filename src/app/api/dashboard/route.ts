import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. 모든 견적서를 버전 내림차순, 생성일 내림차순으로 조회
    const allEstimates = await prisma.estimate.findMany({
      include: {
        project: {
          include: {
            company: true,
          },
        },
      },
      orderBy: [{ estimateNumber: 'asc' }, { version: 'desc' }, { createdAt: 'desc' }],
    });

    // 2. 견적서 번호(estimateNumber)별 최종 버전(최신 버전)만 선별
    const latestEstimatesMap = new Map<string, typeof allEstimates[0]>();
    for (const est of allEstimates) {
      if (!latestEstimatesMap.has(est.estimateNumber)) {
        latestEstimatesMap.set(est.estimateNumber, est);
      }
    }
    const latestEstimates = Array.from(latestEstimatesMap.values());

    // 3. 최종 버전 기준 총 건수 및 총 발행액 계산
    const totalCount = latestEstimates.length;
    const totalAmount = latestEstimates.reduce((acc, cur) => acc + (cur.grandTotal || 0), 0);

    // 4. 상태별 견적건수 및 금액 집계 (최종 버전 기준)
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

    latestEstimates.forEach((est) => {
      const st = est.status as keyof typeof statusCounts;
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
        statusAmounts[st] += (est.grandTotal || 0);
      }
    });

    // 5. 수주율 계산 (수주 / (수주 + 실주 + 제출 + 검토))
    const closedOrActive = statusCounts.WON + statusCounts.LOST + statusCounts.SENT + statusCounts.REVIEW;
    const winRate = closedOrActive > 0 ? Math.round((statusCounts.WON / closedOrActive) * 100) : 0;

    // 6. 고객사 및 프로젝트 수
    const companyCount = await prisma.company.count();
    const projectCount = await prisma.project.count();

    // 7. 최근 견적 6건 (최종 버전 기준, 최신순 정렬)
    const recentEstimates = [...latestEstimates]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    // 8. 고객사별 견적 집계 (Top 5 - 최종 버전 기준)
    const companyMap = new Map<string, { name: string; count: number; totalAmount: number; wonCount: number }>();
    latestEstimates.forEach((est) => {
      const comp = est.project?.company;
      if (comp) {
        const existing = companyMap.get(comp.id) || { name: comp.name, count: 0, totalAmount: 0, wonCount: 0 };
        existing.count++;
        existing.totalAmount += (est.grandTotal || 0);
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
