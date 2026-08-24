import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEstimate } from '@/lib/calculator';

// 견적서 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (companyId) {
      where.project = { companyId };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { estimateNumber: { contains: search } },
        { project: { title: { contains: search } } },
        { project: { company: { name: { contains: search } } } },
      ];
    }

    const estimates = await prisma.estimate.findMany({
      where,
      include: {
        project: {
          include: {
            company: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { version: 'desc' }],
    });

    return NextResponse.json(estimates);
  } catch (error: any) {
    console.error('Error fetching estimates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 견적서 신규 생성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      projectId,
      title,
      overheadRate = 110,
      technicalRate = 20,
      profitRate = 0,
      discountAmount = 0,
      vatRate = 10,
      validUntil,
      paymentTerms,
      remarks,
      labors = [],
      items = [],
      expenses = [],
    } = body;

    if (!projectId || !title) {
      return NextResponse.json({ error: '프로젝트와 견적서 제목을 입력해주세요.' }, { status: 400 });
    }

    // 금액 계산 수행
    const calc = calculateEstimate(labors, items, expenses, {
      overheadRate,
      technicalRate,
      profitRate,
      discountAmount,
      vatRate,
    });

    // 견적서 번호 채번 (EST-YYYYMMDD-랜덤/일련번호)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await prisma.estimate.count({
      where: {
        estimateNumber: {
          startsWith: `EST-${todayStr}`,
        },
      },
    });
    const seq = String(countToday + 1).padStart(3, '0');
    const estimateNumber = `EST-${todayStr}-${seq}`;

    // 트랜잭션으로 견적서 + 하위 항목들 생성
    const estimate = await prisma.estimate.create({
      data: {
        projectId,
        estimateNumber,
        version: 1.0,
        title,
        status: 'DRAFT',
        overheadRate,
        technicalRate,
        profitRate,
        discountAmount: calc.discountAmount,
        vatRate,
        totalLaborCost: calc.totalLaborCost,
        totalOverheadCost: calc.totalOverheadCost,
        totalTechCost: calc.totalTechCost,
        totalExpenseCost: calc.totalExpenseCost,
        totalDevService: calc.totalDevService,
        totalItemsCost: calc.totalItemsCost,
        totalSupplyPrice: calc.totalSupplyPrice,
        totalVat: calc.totalVat,
        grandTotal: calc.grandTotal,
        validUntil: validUntil ? new Date(validUntil) : null,
        paymentTerms,
        remarks,
        labors: {
          create: labors.map((l: any, idx: number) => ({
            role: l.role || 'SW 개발',
            grade: l.grade || '중급기술자',
            manMonths: Number(l.manMonths) || 0,
            unitPrice: Number(l.unitPrice) || 0,
            totalPrice: Math.round((Number(l.manMonths) || 0) * (Number(l.unitPrice) || 0)),
            sortOrder: idx,
          })),
        },
        items: {
          create: items.map((i: any, idx: number) => ({
            category: i.category || '기타',
            name: i.name,
            spec: i.spec || null,
            unit: i.unit || 'EA',
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.unitPrice) || 0,
            discountRate: Number(i.discountRate) || 0,
            totalPrice: Math.round((Number(i.quantity) || 1) * (Number(i.unitPrice) || 0) * (1 - (Number(i.discountRate) || 0) / 100)),
            sortOrder: idx,
          })),
        },
        expenses: {
          create: expenses.map((e: any, idx: number) => ({
            category: e.category || '직접경비',
            description: e.description || '',
            amount: Number(e.amount) || 0,
            sortOrder: idx,
          })),
        },
        histories: {
          create: {
            action: 'CREATED',
            description: '견적서 초안(v1.0) 작성 완료',
          },
        },
      },
      include: {
        project: {
          include: {
            company: true,
          },
        },
        labors: true,
        items: true,
        expenses: true,
        histories: true,
      },
    });

    return NextResponse.json(estimate, { status: 201 });
  } catch (error: any) {
    console.error('Error creating estimate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
