import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 단일 직원 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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

    if (!user) {
      return NextResponse.json({ error: '직원을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 직원 정보 수정 (관리자 또는 본인)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const isSelf = sessionUser.id === params.id;
    const isAdmin = sessionUser.role === 'ADMIN';

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, department, position, phone, email, role, password, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (department !== undefined) updateData.department = department.trim();
    if (position !== undefined) updateData.position = position.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (email !== undefined) updateData.email = email ? email.trim() : null;

    // 관리자만 권한(Role) 및 활성 상태(isActive) 수정 가능
    if (isAdmin) {
      if (role !== undefined) updateData.role = role === 'ADMIN' ? 'ADMIN' : 'USER';
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    }

    // 비밀번호 변경 요청이 있는 경우
    if (password && password.trim().length > 0) {
      updateData.password = await hashPassword(password.trim());
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 직원 삭제 (관리자 전용, 본인 삭제 불가)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: '직원 삭제는 시스템 관리자(ADMIN)만 가능합니다.' }, { status: 403 });
    }

    if (sessionUser.id === params.id) {
      return NextResponse.json({ error: '현재 로그인된 관리자 계정은 삭제할 수 없습니다.' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: '직원 계정이 삭제되었습니다.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}