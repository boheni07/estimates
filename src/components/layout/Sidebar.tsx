'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Building2, 
  FolderKanban, 
  Settings, 
  FilePlus2,
  Calculator,
  Users,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 로컬 스토리지에서 접힘 상태 복원
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const navItems = [
    { href: '/', label: '대시보드', icon: LayoutDashboard },
    { href: '/estimates', label: '견적서 관리', icon: FileSpreadsheet },
    { href: '/estimates/new', label: '새 견적서 작성', icon: FilePlus2 },
    { href: '/projects', label: '프로젝트 관리', icon: FolderKanban },
    { href: '/companies', label: '고객사(거래처)', icon: Building2 },
    { href: '/settings', label: '기준단가 / 공급자설정', icon: Settings },
  ];

  const adminNavItems = [
    { href: '/users', label: '직원(사용자) 관리', icon: Users },
    { href: '/audit-logs', label: '열람 감사 로그', icon: ShieldAlert },
  ];

  return (
    <aside
      className={cn(
        'bg-slate-900 text-slate-200 min-h-screen flex flex-col flex-shrink-0 border-r border-slate-800 no-print transition-all duration-300 ease-in-out relative select-none',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60 overflow-hidden">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="transition-opacity duration-200">
              <h1 className="font-bold text-base text-white tracking-tight whitespace-nowrap">통합 견적 관리</h1>
              <p className="text-[11px] text-slate-400 whitespace-nowrap">Estimate Management</p>
            </div>
          )}
        </Link>

        {/* Top Collapse Toggle Button (펼침 상태일 때) */}
        {!isCollapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            title="메뉴 접기"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 접힌 상태일 때 상단 토글 확장 버튼 */}
      {isCollapsed && (
        <div className="py-2 px-3 border-b border-slate-800/60 flex justify-center">
          <button
            type="button"
            onClick={toggleCollapse}
            title="메뉴 펼치기"
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer w-full flex justify-center"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '/estimates/new');
          const isExact = pathname === item.href;
          const active = item.href === '/' ? isExact : isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-xl text-sm font-medium transition-all group relative',
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5',
                active
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {/* Tooltip on Collapsed Hover */}
              {isCollapsed && (
                <span className="absolute left-full ml-3.5 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-800 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* 시스템 관리자 전용 섹션 */}
        {user?.role === 'ADMIN' && (
          <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1.5">
            {!isCollapsed ? (
              <div className="px-3 pb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>시스템 관리자 전용</span>
              </div>
            ) : (
              <div className="flex justify-center pb-1" title="시스템 관리자 전용 메뉴">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            )}

            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center rounded-xl text-sm font-medium transition-all group relative',
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  )}
                >
                  <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {/* Tooltip on Collapsed Hover */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3.5 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-800 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom Footer Area */}
      <div className="p-3 border-t border-slate-800 text-xs text-slate-500 bg-slate-950/40">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-400 text-[11px] truncate">SW 대가산정 엔진</p>
              <p className="text-[10px] text-slate-500 truncate">KOSA 표준 노임단가</p>
            </div>
            <button
              type="button"
              onClick={toggleCollapse}
              title="사이드바 접기"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={toggleCollapse}
            title="사이드바 펼치기"
            className="w-full flex justify-center py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
