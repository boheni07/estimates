import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { versionType = 'minor', changeReason = '고객사 협의에 따른 변경 견적서 작성' } = body;

    // 원본 견적서 조회
    const source = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: {
        labors: true,
        items: true,
        expenses: true,
      },
    });

    if (!source) {
      return NextResponse.json({ error: '복제할 원본 견적서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 다음 버전 번호 계산
    let nextVersion = source.version;
    if (versionType === 'major') {
      nextVersion = Math.floor(source.version) + 1.0;
    } else {
      nextVersion = Math.round((source.version + 0.1) * 10) / 10;
    }

    // 새 견적서 생성
    const newEstimate = await prisma.estimate.create({
      data: {
        projectId: source.projectId,
        estimateNumber: source.estimateNumber,
        version: nextVersion,
        parentEstimateId: source.id,
        title: `${source.title} (v${nextVersion.toFixed(1)})`,
        status: 'DRAFT',
        overheadRate: source.overheadRate,
        technicalRate: source.technicalRate,
        profitRate: source.profitRate,
        discountAmount: source.discountAmount,
        vatRate: source.vatRate,
        totalLaborCost: source.totalLaborCost,
        totalOverheadCost: source.totalOverheadCost,
        totalTechCost: source.totalTechCost,
        totalExpenseCost: source.totalExpenseCost,
        totalDevService: source.totalDevService,
        totalItemsCost: source.totalItemsCost,
        totalSupplyPrice: source.totalSupplyPrice,
        totalVat: source.totalVat,
        grandTotal: source.grandTotal,
        validUntil: source.validUntil,
        paymentTerms: source.paymentTerms,
        remarks: source.remarks,
        changeReason: changeReason,
        labors: {
          create: source.labors.map((l) => ({
            role: l.role,
            grade: l.grade,
            manMonths: l.manMonths,
            unitPrice: l.unitPrice,
            totalPrice: l.totalPrice,
            sortOrder: l.sortOrder,
          })),
        },
        items: {
          create: source.items.map((i) => ({
            category: i.category,
            name: i.name,
            spec: i.spec,
            unit: i.unit,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discountRate: i.discountRate,
            totalPrice: i.totalPrice,
            sortOrder: i.sortOrder,
          })),
        },
        expenses: {
          create: source.expenses.map((e) => ({
            category: e.category,
            description: e.description,
            amount: e.amount,
            sortOrder: e.sortOrder,
          })),
        },
        histories: {
          create: {
            action: 'VERSION_UP',
            description: `v${source.version.toFixed(1)}에서 v${nextVersion.toFixed(1)} 버전 분기 생성. 사유: ${changeReason}`,
          },
        },
      },
      include: {
        project: {
          include: {
            company: true,
          },
        },
      },
    });

    return NextResponse.json(newEstimate, { status: 201 });
  } catch (error: any) {
    console.error('Error duplicating estimate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
