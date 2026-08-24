'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FolderKanban, 
  Building2, 
  Calendar, 
  FileSpreadsheet, 
  PlusCircle, 
  Printer, 
  Download, 
  GitBranch, 
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { ProjectType, EstimateType, CompanyType } from '@/types/estimate';
import { formatCurrency } from '@/lib/calculator';
import { formatDate, getStatusBadge } from '@/lib/utils';
import VersionHistoryModal from '@/components/estimate/VersionHistoryModal';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateType | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // 프로젝트 수정 모달
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('IN_PROGRESS');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formClientDept, setFormClientDept] = useState('');
  const [formClientManager, setFormClientManager] = useState('');
  const [formClientPosition, setFormClientPosition] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      const data = await res.json();
      setProject(data);
      if (data) {
        setFormCompanyId(data.companyId);
        setFormTitle(data.title);
        setFormDesc(data.description || '');
        setFormStatus(data.status);
        setFormStartDate(data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '');
        setFormEndDate(data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '');
        setFormClientDept(data.clientDept || '');
        setFormClientManager(data.clientManager || '');
        setFormClientPosition(data.clientPosition || '');
        setFormClientPhone(data.clientPhone || '');
        setFormClientEmail(data.clientEmail || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchCompanies();
  }, [params.id]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: formCompanyId,
          title: formTitle,
          description: formDesc,
          status: formStatus,
          startDate: formStartDate || null,
          endDate: formEndDate || null,
          clientDept: formClientDept,
          clientManager: formClientManager,
          clientPosition: formClientPosition,
          clientPhone: formClientPhone,
          clientEmail: formClientEmail,
        }),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchProject();
      } else {
        alert('프로젝트 수정 실패');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(`프로젝트 [${project?.title}]를 삭제하시겠습니까? 연결된 모든 견적서가 함께 삭제됩니다.`)) return;
    try {
      const res = await fetch(`/api/projects/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/projects');
      } else {
        alert('삭제 실패');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-semibold mb-4">프로젝트를 찾을 수 없습니다.</p>
        <Link href="/projects" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs">
          프로젝트 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const estimates = project.estimates || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.title}</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {project.status === 'IN_PROGRESS' ? '진행중' : project.status === 'PLANNING' ? '기획' : '완료'}
              </span>
            </div>
            <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
              <Building2 className="w-3.5 h-3.5" />
              발주 고객사: {project.company?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Edit className="w-4 h-4" />
            프로젝트 정보 수정
          </button>
          <button
            type="button"
            onClick={handleDeleteProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            프로젝트 삭제
          </button>
          <Link
            href={`/estimates/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            새 견적서 작성
          </Link>
        </div>
      </div>

      {/* Info Grid: Project Overview & Client Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Project Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4 text-blue-600" />
              프로젝트 기본 정보
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
              {project.description || '상세 설명이 등록되지 않았습니다.'}
            </p>
          </div>
          <div className="flex items-center gap-6 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              사업 기간: {project.startDate ? `${formatDate(project.startDate)} ~ ${formatDate(project.endDate)}` : '기간 미정'}
            </div>
            <div>
              발행 견적: <span className="font-bold text-slate-800">{estimates.length}건</span>
            </div>
          </div>
        </div>

        {/* Client Contact for this specific project */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue-900">
              <User className="w-4 h-4 text-blue-600" />
              프로젝트별 발주처(고객사) 전담 연락망
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[11px] text-blue-600 hover:underline font-semibold"
            >
              담당자 변경
            </button>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[11px] block">담당 부서</span>
                <span className="font-semibold text-slate-800">{project.clientDept || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">담당자명 / 직책</span>
                <span className="font-semibold text-slate-800">
                  {project.clientManager || '미지정'} {project.clientPosition ? `(${project.clientPosition})` : ''}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 text-[11px] block">담당자 연락처</span>
                <span className="font-mono text-slate-800 font-medium">{project.clientPhone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">담당자 이메일</span>
                <span className="text-blue-600 font-mono">{project.clientEmail || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              프로젝트 견적 버전 이력 (Version History)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              초기 견적(v1.0)부터 고객사 네고 및 범위 변경에 따른 버전별 상세 내역입니다.
            </p>
          </div>
        </div>

        {estimates.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            발행된 견적서가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-y border-slate-200">
                  <th className="py-2.5 px-4">버전</th>
                  <th className="py-2.5 px-4">견적서 제목 / 변경 사유</th>
                  <th className="py-2.5 px-4 text-right">직접인건비</th>
                  <th className="py-2.5 px-4 text-right">제경비/기술료/이윤</th>
                  <th className="py-2.5 px-4 text-right">총 공급가액</th>
                  <th className="py-2.5 px-4 text-right">최종합계 (VAT포함)</th>
                  <th className="py-2.5 px-4 text-center">상태</th>
                  <th className="py-2.5 px-4 text-center">발행일</th>
                  <th className="py-2.5 px-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estimates.map((est) => {
                  const badge = getStatusBadge(est.status);
                  return (
                    <tr key={est.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                          v{est.version.toFixed(1)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/estimates/${est.id}/edit`}
                          className="font-semibold text-slate-900 hover:text-blue-600 text-xs transition-colors block"
                        >
                          {est.title}
                        </Link>
                        {est.changeReason && (
                          <div className="text-[11px] text-purple-600 font-medium mt-0.5">
                            ↳ {est.changeReason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                        ₩{formatCurrency(est.totalLaborCost)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                        ₩{formatCurrency(est.totalOverheadCost + est.totalTechCost + (est.totalLaborCost + est.totalOverheadCost + est.totalTechCost) * (est.profitRate / 100))}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-800 font-medium">
                        ₩{formatCurrency(est.totalSupplyPrice)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-blue-900">
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
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/estimates/${est.id}/preview`}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded"
                            title="인쇄"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                          <a
                            href={`/api/estimates/${est.id}/excel`}
                            className="p-1 text-slate-500 hover:text-emerald-600 rounded"
                            title="엑셀"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEstimate(est);
                              setIsVersionModalOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-purple-600 rounded"
                            title="새 버전 분기"
                          >
                            <GitBranch className="w-4 h-4" />
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

      {/* 프로젝트 수정 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">프로젝트 정보 수정</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  고객사(발주처) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formCompanyId}
                  onChange={(e) => setFormCompanyId(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  프로젝트명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              {/* 프로젝트별 고객사 담당자 정보 그룹 */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 border-b border-blue-200/60 pb-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  프로젝트별 발주처(고객사) 담당자 연락망
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      담당 부서
                    </label>
                    <input
                      type="text"
                      value={formClientDept}
                      onChange={(e) => setFormClientDept(e.target.value)}
                      placeholder="예: 디지털혁신팀, IT기획부"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      담당자명 / 직책
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={formClientManager}
                        onChange={(e) => setFormClientManager(e.target.value)}
                        placeholder="홍길동"
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                      />
                      <input
                        type="text"
                        value={formClientPosition}
                        onChange={(e) => setFormClientPosition(e.target.value)}
                        placeholder="팀장/수석"
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      담당자 연락처
                    </label>
                    <input
                      type="text"
                      value={formClientPhone}
                      onChange={(e) => setFormClientPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      담당자 이메일
                    </label>
                    <input
                      type="email"
                      value={formClientEmail}
                      onChange={(e) => setFormClientEmail(e.target.value)}
                      placeholder="manager@company.com"
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  프로젝트 설명
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    시작일자
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    종료일자
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  진행 상태
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                >
                  <option value="PLANNING">기획 및 제안 (PLANNING)</option>
                  <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
                  <option value="COMPLETED">완료 (COMPLETED)</option>
                  <option value="ON_HOLD">보류 (ON_HOLD)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? '저장 중...' : '수정 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {selectedEstimate && (
        <VersionHistoryModal
          estimate={selectedEstimate}
          isOpen={isVersionModalOpen}
          onClose={() => {
            setIsVersionModalOpen(false);
            fetchProject();
          }}
        />
      )}
    </div>
  );
}
