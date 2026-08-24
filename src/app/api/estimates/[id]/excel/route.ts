import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEstimateExcel } from '@/lib/excelExporter';
import { DEFAULT_SUPPLIER_INFO } from '@/lib/defaultRates';
import { EstimateType, CompanySupplierInfo } from '@/types/estimate';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const estimate = await prisma.estimate.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            company: true,
          },
        },
        labors: { orderBy: { sortOrder: 'asc' } },
        items: { orderBy: { sortOrder: 'asc' } },
        expenses: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!estimate) {
      return NextResponse.json({ error: '견적서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 마스터 공급자 설정 조회
    const supplierSetting = await prisma.masterSetting.findUnique({
      where: { key: 'SUPPLIER_INFO' },
    });

    let supplierInfo: CompanySupplierInfo = DEFAULT_SUPPLIER_INFO;
    if (supplierSetting && supplierSetting.value) {
      try {
        supplierInfo = JSON.parse(supplierSetting.value);
      } catch (e) {
        console.error('Failed to parse supplier info setting:', e);
      }
    }

    const excelBuffer = await generateEstimateExcel(estimate as unknown as EstimateType, supplierInfo);

    const filename = encodeURIComponent(
      `견적서_${estimate.estimateNumber}_v${estimate.version.toFixed(1)}_${estimate.project?.company?.name || '공급'}.xlsx`
    );

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${filename}`,
      },
    });
  } catch (error: any) {
    console.error('Error generating excel:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
