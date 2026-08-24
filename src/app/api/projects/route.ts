import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        company: true,
        estimates: {
          orderBy: { version: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      companyId, 
      title, 
      description, 
      status, 
      startDate, 
      endDate,
      clientDept,
      clientManager,
      clientPosition,
      clientPhone,
      clientEmail
    } = body;

    if (!companyId || !title) {
      return NextResponse.json({ error: '고객사와 프로젝트명을 입력해주세요.' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        companyId,
        title,
        description,
        status: status || 'IN_PROGRESS',
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

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
