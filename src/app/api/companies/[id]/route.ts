import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        projects: {
          include: {
            estimates: {
              orderBy: [{ version: 'desc' }, { createdAt: 'desc' }],
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: '고객사를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, businessNumber, ceoName, address, contactPerson, contactEmail, contactPhone } = body;

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        name,
        businessNumber,
        ceoName,
        address,
        contactPerson,
        contactEmail,
        contactPhone,
      },
    });

    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.company.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
