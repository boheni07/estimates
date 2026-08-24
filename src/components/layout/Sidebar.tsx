'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Building2, 
  FolderKanban, 
  Settings, 
  FilePlus2,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '대시보드', icon: LayoutDashboard },
    { href: '/estimates', label: '견적서 관리', icon: FileSpreadsheet },
    { href: '/estimates/new', label: '새 견적서 작성', icon: FilePlus2 },
    { href: '/projects', label: '프로젝트 관리', icon: FolderKanban },
    { href: '/companies', label: '고객사(거래처)', icon: Building2 },
    { href: '/settings', label: '기준단가 / 공급자설정', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-screen flex flex-col flex-shrink-0 border-r border-slate-800 no-print">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950/60">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/20">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-white tracking-tight">통합 견적 관리</h1>
          <p className="text-xs text-slate-400">Estimate Management</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '/estimates/new');
          const isExact = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all',
                (item.href === '/' ? isExact : isActive)
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              )}
            >
              <Icon className={cn('w-4 h-4', (item.href === '/' ? isExact : isActive) ? 'text-white' : 'text-slate-400')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 bg-slate-950/40">
        <p className="font-semibold text-slate-400">SW 대가산정 & 견적 엔진</p>
        <p className="mt-0.5">KOSA 표준 노임단가 연동</p>
      </div>
    </aside>
  );
}
