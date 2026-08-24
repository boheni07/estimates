'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldAlert, 
  Search, 
  Eye, 
  Printer, 
  FileSpreadsheet, 
  GitBranch, 
  Clock, 
  User, 
  Building, 
  Calendar,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = actionFilter !== 'ALL' ? `/api/audit-logs?action=${actionFilter}` : '/api/audit-logs';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">접근 권한이 없습니다</h2>
        <p className="text-sm text-slate-500 mt-1">
          견적서 열람 이력 및 감사 로그는 시스템 관리자(ADMIN)만 열람할 수 있습니다.
        </p>
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'VIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
            <Eye className="w-3.5 h-3.5" />
            <span>화면 열람 (VIEW)</span>
          </span>
        );
      case 'PRINT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
            <Printer className="w-3.5 h-3.5" />
            <span>인쇄 / PDF (PRINT)</span>
          </span>
        );
      case 'EXCEL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>엑셀 다운로드 (EXCEL)</span>
          </span>
        );
      case 'EDIT_ATTEMPT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded-lg">
            <GitBranch className="w-3.5 h-3.5 text-amber-600" />
            <span>타인 수정 분기 (BRANCH)</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-600">{action}</span>;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const estNum = log.estimate?.estimateNumber?.toLowerCase() || '';
    const estTitle = log.estimate?.title?.toLowerCase() || '';
    const projTitle = log.estimate?.project?.title?.toLowerCase() || '';
    const compName = log.estimate?.project?.company?.name?.toLowerCase() || '';
    const userName = log.userName?.toLowerCase() || '';
    const userDept = log.userDept?.toLowerCase() || '';

    return (
      estNum.includes(q) ||
      estTitle.includes(q) ||
      projTitle.includes(q) ||
      compName.includes(q) ||
      userName.includes(q) ||
      userDept.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">견적서 열람 이력 & 감사 로그</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-full">
              보안 감사 전용
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            모든 견적서의 화면 조회, 인쇄(PDF), 엑셀 다운로드, 타인 수정 시 자동 분기 이력을 실시간으로 추적합니다.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 md:col-span-2">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="견적서 번호, 제목, 프로젝트명, 고객사, 열람자명으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-slate-800 focus:outline-none placeholder-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              초기화
            </button>
          )}
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <span className="text-xs font-semibold text-slate-500">행동 유형:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none font-medium"
          >
            <option value="ALL">전체 행동</option>
            <option value="VIEW">화면 열람 (VIEW)</option>
            <option value="PRINT">인쇄 / PDF (PRINT)</option>
            <option value="EXCEL">엑셀 다운로드 (EXCEL)</option>
            <option value="EDIT_ATTEMPT">타인 수정 분기 (BRANCH)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">기록된 열람 감사 이력이 없습니다.</p>
            <p className="text-xs text-slate-400 mt-1">견적서 조회, 인쇄, 엑셀 다운로드 시 자동으로 기록됩니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">열람/작업 일시</th>
                  <th className="px-6 py-3.5 font-semibold">열람자 (직원 정보)</th>
                  <th className="px-6 py-3.5 font-semibold">수행 행동</th>
                  <th className="px-6 py-3.5 font-semibold">대상 견적서 정보</th>
                  <th className="px-6 py-3.5 font-semibold">고객사 / 프로젝트</th>
                  <th className="px-6 py-3.5 font-semibold text-right">상세 이동</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-xs">
                {filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.createdAt).toLocaleString('ko-KR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                          {log.userName?.slice(0, 1) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{log.userName}</div>
                          <div className="text-[11px] text-slate-400">{log.userDept || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4">
                      {log.estimate ? (
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{log.estimate.title}</span>
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                              v{log.estimate.version?.toFixed(1)}
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                            {log.estimate.estimateNumber}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">삭제된 견적서</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.estimate?.project ? (
                        <div>
                          <div className="text-slate-700 font-medium">
                            {log.estimate.project.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {log.estimate.project.company?.name || '-'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.estimate && (
                        <Link
                          href={`/estimates/${log.estimateId}/preview`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <span>견적서 보기</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}