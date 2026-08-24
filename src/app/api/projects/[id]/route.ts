import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        estimates: {
          include: {
            labors: true,
            items: true,
            expenses: true,
          },
          orderBy: [{ version: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(project);
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
    const { 
      title, 
      description, 
      status, 
      startDate, 
      endDate, 
      companyId,
      clientDept,
      clientManager,
      clientPosition,
      clientPhone,
      clientEmail
    } = body;

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        title,
        description,
        status,
        companyId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        clientDept,
        clientManager,
        clientPosition,
        clientPhone,
        clientEmail,
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
