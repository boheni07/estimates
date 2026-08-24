'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, Search, FileText } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 no-print">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-800">통합 견적 관리 시스템</span>
          <span>/</span>
          <span>스마트 SW 대가 및 물품 견적</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/estimates/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>신규 견적서 작성</span>
        </Link>
      </div>
    </header>
  );
}
