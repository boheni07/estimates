'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  FolderKanban, 
  FileSpreadsheet, 
  PlusCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Send, 
  XCircle,
  Download,
  Printer
} from 'lucide-react';
import { formatCurrency, numberToKoreanWon } from '@/lib/calculator';
import { formatDate, getStatusBadge } from '@/lib/utils';
import { EstimateType } from '@/types/estimate';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const statusCounts = data?.statusCounts || {};
  const statusAmounts = data?.statusAmounts || {};
  const recentEstimates: EstimateType[] = data?.recentEstimates || [];
  const topCompanies = data?.topCompanies || [];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">견적 관리 대시보드</h1>
          <p className="text-sm text-slate-500 mt-1">
            SW 대가산정, 물품 및 직접경비 통합 견적 현황과 고객사별 파이프라인
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/estimates/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            새 견적서 작성
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 누적 견적 금액 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">총 견적 발행액</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              ₩{formatCurrency(summary.totalAmount)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              총 <span className="font-semibold text-slate-700">{summary.totalCount}건</span>의 견적서 발행
            </p>
          </div>
        </div>

        {/* 수주 확정 금액 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">수주 체결 총액</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-emerald-600">
              ₩{formatCurrency(summary.wonAmount)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              수주 성공률 <span className="font-bold text-emerald-600">{summary.winRate}%</span>
            </p>
          </div>
        </div>

        {/* 관리 고객사 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">등록 고객사(거래처)</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              {summary.companyCount} <span className="text-sm font-normal text-slate-500">개사</span>
            </div>
            <Link href="/companies" className="text-xs text-purple-600 hover:text-purple-700 mt-1 inline-flex items-center gap-1 font-medium">
              고객사 목록 바로가기 <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 진행 프로젝트 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">관리 프로젝트</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              {summary.projectCount} <span className="text-sm font-normal text-slate-500">개</span>
            </div>
            <Link href="/projects" className="text-xs text-amber-600 hover:text-amber-700 mt-1 inline-flex items-center gap-1 font-medium">
              프로젝트 목록 바로가기 <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 상태별 파이프라인 Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-4">견적 진행 파이프라인 현황</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>작성중 (Draft)</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg font-bold text-slate-800 font-mono">{statusCounts.DRAFT || 0}건</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">₩{formatCurrency(statusAmounts.DRAFT || 0)}</div>
          </div>

          <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
              <span>제출완료 (Sent)</span>
              <Send className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-blue-900 font-mono">{statusCounts.SENT || 0}건</div>
            <div className="text-[11px] text-blue-700 font-mono mt-0.5">₩{formatCurrency(statusAmounts.SENT || 0)}</div>
          </div>

          <div className="p-3.5 bg-yellow-50/50 border border-yellow-200 rounded-xl">
            <div className="flex items-center justify-between text-xs text-yellow-800 mb-1">
              <span>내부검토 (Review)</span>
              <Clock className="w-3.5 h-3.5 text-yellow-600" />
            </div>
            <div className="text-lg font-bold text-yellow-900 font-mono">{statusCounts.REVIEW || 0}건</div>
            <div className="text-[11px] text-yellow-700 font-mono mt-0.5">₩{formatCurrency(statusAmounts.REVIEW || 0)}</div>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
              <span>수주확정 (Won)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-emerald-800 font-mono">{statusCounts.WON || 0}건</div>
            <div className="text-[11px] text-emerald-700 font-mono mt-0.5">₩{formatCurrency(statusAmounts.WON || 0)}</div>
          </div>

          <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl">
            <div className="flex items-center justify-between text-xs text-rose-700 mb-1">
              <span>실주 (Lost)</span>
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-lg font-bold text-rose-900 font-mono">{statusCounts.LOST || 0}건</div>
            <div className="text-[11px] text-rose-600 font-mono mt-0.5">₩{formatCurrency(statusAmounts.LOST || 0)}</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Estimates & Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 최근 견적서 목록 (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">최근 발행 견적서</h3>
              <p className="text-xs text-slate-500">최근 등록 및 변경된 견적서 목록입니다.</p>
            </div>
            <Link
              href="/estimates"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
            >
              전체보기 <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEstimates.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              발행된 견적서가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-y border-slate-200">
                    <th className="py-2.5 px-3">견적번호/버전</th>
                    <th className="py-2.5 px-3">고객사 / 프로젝트</th>
                    <th className="py-2.5 px-3 text-right">견적금액 (VAT포함)</th>
                    <th className="py-2.5 px-3 text-center">상태</th>
                    <th className="py-2.5 px-3 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentEstimates.map((est) => {
                    const badge = getStatusBadge(est.status);
                    return (
                      <tr key={est.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <Link href={`/estimates/${est.id}/edit`} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                            {est.estimateNumber}
                          </Link>
                          <span className="ml-1.5 text-[11px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                            v{est.version.toFixed(1)}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(est.createdAt)}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 text-xs truncate max-w-[200px]">
                            {est.project?.company?.name || '-'}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[220px]">
                            {est.title}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          ₩{formatCurrency(est.grandTotal)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link
                              href={`/estimates/${est.id}/preview`}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="견적서 인쇄/PDF"
                            >
                              <Printer className="w-4 h-4" />
                            </Link>
                            <a
                              href={`/api/estimates/${est.id}/excel`}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="엑셀 다운로드"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 상위 고객사 Top 5 (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">주요 고객사별 견적 현황</h3>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          {topCompanies.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              고객사 견적 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {topCompanies.map((c: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {c.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      견적 {c.count}건 (수주 {c.wonCount}건)
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-slate-900">
                    ₩{formatCurrency(c.totalAmount)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/companies"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              고객사 전체 관리 <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
