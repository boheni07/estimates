import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateEstimate } from '@/lib/calculator';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 견적서 단건 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const estimate = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            department: true,
            position: true,
            email: true,
            phone: true,
          },
        },
        project: {
          include: {
            company: true,
          },
        },
        labors: {
          orderBy: { sortOrder: 'asc' },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
        expenses: {
          orderBy: { sortOrder: 'asc' },
        },
        histories: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!estimate) {
      return NextResponse.json({ error: '견적서를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(estimate);
  } catch (error: any) {
    console.error('Error fetching estimate detail:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 견적서 수정/업데이트 (작성자 본인 수정 또는 타인 수정 시 자동 마이너 버전 분기)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser(request);
    const body = await request.json();
    const {
      title,
      status,
      overheadRate,
      technicalRate,
      profitRate,
      discountAmount,
      vatRate,
      validUntil,
      paymentTerms,
      remarks,
      changeReason,
      labors = [],
      items = [],
      expenses = [],
    } = body;

    // 기존 견적서 확인
    const existing = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: {
        author: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: '수정할 견적서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 금액 재계산
    const calc = calculateEstimate(labors, items, expenses, {
      overheadRate: overheadRate !== undefined ? overheadRate : existing.overheadRate,
      technicalRate: technicalRate !== undefined ? technicalRate : existing.technicalRate,
      profitRate: profitRate !== undefined ? profitRate : existing.profitRate,
      discountAmount: discountAmount !== undefined ? discountAmount : existing.discountAmount,
      vatRate: vatRate !== undefined ? vatRate : existing.vatRate,
    });

    // ⭐️ [요구사항 핵심]: 작성자 확인 및 타인 수정 시 자동 마이너 버전(+0.1) 분기 로직
    // 기존 견적서에 작성자가 존재하고, 현재 로그인 사용자가 해당 작성자가 아닌 경우 (ID가 다를 때)
    const isOtherUser = Boolean(
      sessionUser &&
      existing.authorId &&
      existing.authorId !== sessionUser.id
    );

    if (isOtherUser) {
      // 1. 새 마이너 버전(+0.1) 계산
      const newVersion = Math.round((existing.version + 0.1) * 10) / 10;
      const editorName = `${sessionUser?.name || '사용자'} ${sessionUser?.position || ''}`.trim();
      const originalAuthorName = `${existing.author?.name || '기존 작성자'} ${existing.author?.position || ''}`.trim();
      
      const autoReason = changeReason 
        ? `${changeReason} (작성자 [${originalAuthorName}] -> [${editorName}] 수정 분기)`
        : `[${editorName}] 님이 원본(v${existing.version.toFixed(1)}, ${originalAuthorName}) 수정 시 자동 마이너 버전(v${newVersion.toFixed(1)}) 분기 생성`;

      // 2. 새로운 견적서 레코드로 분기 생성
      const branchedEstimate = await prisma.estimate.create({
        data: {
          projectId: existing.projectId,
          parentEstimateId: existing.id,
          authorId: sessionUser?.id || null,
          estimateNumber: existing.estimateNumber,
          version: newVersion,
          title: title !== undefined ? title : existing.title,
          status: 'DRAFT', // 새 분기는 DRAFT로 시작
          overheadRate: overheadRate !== undefined ? overheadRate : existing.overheadRate,
          technicalRate: technicalRate !== undefined ? technicalRate : existing.technicalRate,
          profitRate: profitRate !== undefined ? profitRate : existing.profitRate,
          discountAmount: calc.discountAmount,
          vatRate: vatRate !== undefined ? vatRate : existing.vatRate,
          totalLaborCost: calc.totalLaborCost,
          totalOverheadCost: calc.totalOverheadCost,
          totalTechCost: calc.totalTechCost,
          totalExpenseCost: calc.totalExpenseCost,
          totalDevService: calc.totalDevService,
          totalItemsCost: calc.totalItemsCost,
          totalSupplyPrice: calc.totalSupplyPrice,
          totalVat: calc.totalVat,
          grandTotal: calc.grandTotal,
          validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : existing.validUntil,
          paymentTerms: paymentTerms !== undefined ? paymentTerms : existing.paymentTerms,
          remarks: remarks !== undefined ? remarks : existing.remarks,
          changeReason: autoReason,
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
            create: [
              {
                action: 'VERSION_UP',
                description: autoReason,
              },
            ],
          },
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              department: true,
              position: true,
            },
          },
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

      // 감사 로그에 타인 수정 분기 시도 기록
      await prisma.estimateViewLog.create({
        data: {
          estimateId: existing.id,
          userId: sessionUser?.id || null,
          userName: sessionUser?.name || '사용자',
          userDept: `${sessionUser?.department || ''} ${sessionUser?.position || ''}`.trim(),
          action: 'EDIT_ATTEMPT',
          ipAddress: request.headers.get('x-forwarded-for') || null,
          userAgent: request.headers.get('user-agent') || null,
        },
      });

      return NextResponse.json({
        ...branchedEstimate,
        branched: true,
        branchMessage: `작성자가 다른 견적서이므로 v${newVersion.toFixed(1)} 마이너 버전으로 자동 분기되어 저장되었습니다.`,
      });
    }

    // 작성자 본인이거나 아직 작성자가 지정되지 않은 경우 기존 레코드 업데이트
    const updated = await prisma.$transaction(async (tx) => {
      // 1. 기존 labors, items, expenses 삭제
      await tx.estimateLabor.deleteMany({ where: { estimateId: params.id } });
      await tx.estimateItem.deleteMany({ where: { estimateId: params.id } });
      await tx.estimateExpense.deleteMany({ where: { estimateId: params.id } });

      // 2. 이력 기록
      let historyAction = 'EDITED';
      let historyDesc = '견적서 내용 수정';
      if (status && status !== existing.status) {
        historyAction = 'STATUS_CHANGE';
        historyDesc = `상태 변경: ${existing.status} -> ${status}`;
      } else if (changeReason) {
        historyDesc = changeReason;
      }

      await tx.estimateHistory.create({
        data: {
          estimateId: params.id,
          action: historyAction,
          description: historyDesc,
        },
      });

      // 3. 메인 견적서 업데이트 및 하위 항목 생성
      return await tx.estimate.update({
        where: { id: params.id },
        data: {
          authorId: existing.authorId || sessionUser?.id || null,
          title: title !== undefined ? title : existing.title,
          status: status !== undefined ? status : existing.status,
          overheadRate: overheadRate !== undefined ? overheadRate : existing.overheadRate,
          technicalRate: technicalRate !== undefined ? technicalRate : existing.technicalRate,
          profitRate: profitRate !== undefined ? profitRate : existing.profitRate,
          discountAmount: calc.discountAmount,
          vatRate: vatRate !== undefined ? vatRate : existing.vatRate,
          totalLaborCost: calc.totalLaborCost,
          totalOverheadCost: calc.totalOverheadCost,
          totalTechCost: calc.totalTechCost,
          totalExpenseCost: calc.totalExpenseCost,
          totalDevService: calc.totalDevService,
          totalItemsCost: calc.totalItemsCost,
          totalSupplyPrice: calc.totalSupplyPrice,
          totalVat: calc.totalVat,
          grandTotal: calc.grandTotal,
          validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : existing.validUntil,
          paymentTerms: paymentTerms !== undefined ? paymentTerms : existing.paymentTerms,
          remarks: remarks !== undefined ? remarks : existing.remarks,
          changeReason: changeReason !== undefined ? changeReason : existing.changeReason,
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
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              department: true,
              position: true,
            },
          },
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
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating estimate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 견적서 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.estimate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
