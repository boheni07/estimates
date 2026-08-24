import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        projects: {
          include: {
            estimates: {
              select: {
                id: true,
                estimateNumber: true,
                version: true,
                title: true,
                status: true,
                grandTotal: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(companies);
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, businessNumber, ceoName, address, contactPerson, contactEmail, contactPhone } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: '고객사명을 입력해주세요.' }, { status: 400 });
    }

    const company = await prisma.company.create({
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

    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
