import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 직원 목록 조회
export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        department: true,
        position: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { estimates: true },
        },
      },
      orderBy: [
        { role: 'asc' },
        { department: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 신규 직원 등록 (ADMIN 전용)
export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: '직원 등록은 시스템 관리자(ADMIN)만 가능합니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, name, department, position, phone, email, role } = body;

    if (!username || !password || !name || !department || !position) {
      return NextResponse.json({ error: '아이디, 비밀번호, 성명, 부서, 직위는 필수 입력 항목입니다.' }, { status: 400 });
    }

    // 아이디 중복 체크
    const existing = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        name: name.trim(),
        department: department.trim(),
        position: position.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        name: true,
        department: true,
        position: true,
        phone: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}