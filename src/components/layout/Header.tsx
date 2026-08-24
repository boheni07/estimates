'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 no-print">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-800">통합 견적 관리 시스템</span>
          <span>/</span>
          <span>스마트 SW 대가 및 물품 견적</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/estimates/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>신규 견적서 작성</span>
        </Link>

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xs font-bold text-slate-800">{user.name}</span>
                  <span className="text-[11px] text-slate-500">{user.position}</span>
                  {user.role === 'ADMIN' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{user.department}</div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="로그아웃"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
