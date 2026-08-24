'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileSpreadsheet, 
  PlusCircle, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  GitBranch, 
  Trash2, 
  Edit3,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import { EstimateType } from '@/types/estimate';
import { formatCurrency } from '@/lib/calculator';
import { formatDate, getStatusBadge } from '@/lib/utils';
import VersionHistoryModal from '@/components/estimate/VersionHistoryModal';

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<EstimateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // 버전 복제/이력 모달 상태
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateType | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      let url = '/api/estimates';
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setEstimates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEstimates();
  };

  const handleDelete = async (id: string, number: string, ver: number) => {
    if (!confirm(`견적서 ${number} (v${ver.toFixed(1)})를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/estimates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEstimates(estimates.filter((e) => e.id !== id));
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    }
  };

  const handleOpenVersionModal = (est: EstimateType) => {
    setSelectedEstimate(est);
    setIsVersionModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">견적서 통합 관리</h1>
          <p className="text-sm text-slate-500 mt-1">
            프로젝트별, 고객사별 견적 버전 및 발행 이력을 조회하고 관리합니다.
          </p>
        </div>
        <Link
          href="/estimates/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          신규 견적서 작성
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="고객사, 프로젝트명, 견적번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            검색
          </button>
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" /> 상태:
          </span>
          {['ALL', 'DRAFT', 'REVIEW', 'SENT', 'WON', 'LOST'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st === 'ALL' ? '전체' : getStatusBadge(st).label}
            </button>
          ))}
        </div>
      </div>

      {/* Estimates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : estimates.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">등록된 견적서가 없습니다.</p>
            <p className="text-xs text-slate-400">새 견적서를 작성하여 시작해보세요.</p>
            <div className="pt-2">
              <Link
                href="/estimates/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                새 견적서 작성
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">견적번호 / 버전</th>
                  <th className="py-3 px-4">고객사 및 프로젝트</th>
                  <th className="py-3 px-4">견적서 제목</th>
                  <th className="py-3 px-4 text-right">총 공급가액</th>
                  <th className="py-3 px-4 text-right">최종합계 (VAT포함)</th>
                  <th className="py-3 px-4 text-center">진행상태</th>
                  <th className="py-3 px-4 text-center">발행일</th>
                  <th className="py-3 px-4 text-center w-44">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estimates.map((est) => {
                  const badge = getStatusBadge(est.status);
                  return (
                    <tr key={est.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/estimates/${est.id}/edit`}
                            className="font-mono text-xs font-bold text-blue-600 hover:underline"
                          >
                            {est.estimateNumber}
                          </Link>
                          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono border border-blue-200">
                            v{est.version.toFixed(1)}
                          </span>
                        </div>
                        {est.changeReason && (
                          <div className="text-[11px] text-slate-400 mt-0.5 max-w-[180px] truncate" title={est.changeReason}>
                            ↳ {est.changeReason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{est.project?.company?.name || '-'}</span>
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px] mt-0.5">
                          {est.project?.title}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/estimates/${est.id}/edit`}
                          className="font-medium text-slate-900 hover:text-blue-600 text-xs transition-colors"
                        >
                          {est.title}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600 font-medium">
                        ₩{formatCurrency(est.totalSupplyPrice)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-slate-900">
                        ₩{formatCurrency(est.grandTotal)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center text-xs text-slate-500 font-mono">
                        {formatDate(est.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/estimates/${est.id}/preview`}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="공식 견적서 인쇄/PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>

                          <a
                            href={`/api/estimates/${est.id}/excel`}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="엑셀(.xlsx) 다운로드"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleOpenVersionModal(est)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="버전 복제 분기 / 이력"
                          >
                            <GitBranch className="w-4 h-4" />
                          </button>

                          <Link
                            href={`/estimates/${est.id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="견적서 수정"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(est.id, est.estimateNumber, est.version)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="견적서 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Version History / Duplicate Modal */}
      {selectedEstimate && (
        <VersionHistoryModal
          estimate={selectedEstimate}
          isOpen={isVersionModalOpen}
          onClose={() => {
            setIsVersionModalOpen(false);
            fetchEstimates();
          }}
        />
      )}
    </div>
  );
}
