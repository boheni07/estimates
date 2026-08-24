'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  User, 
  MapPin, 
  FolderKanban, 
  FileSpreadsheet, 
  PlusCircle,
  Printer,
  Download,
  Calendar,
  Layers,
  ChevronRight,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { CompanyType } from '@/types/estimate';
import { formatCurrency } from '@/lib/calculator';
import { formatDate, getStatusBadge } from '@/lib/utils';

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [company, setCompany] = useState<CompanyType | null>(null);
  const [loading, setLoading] = useState(true);

  // 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formBizNum, setFormBizNum] = useState('');
  const [formCeo, setFormCeo] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCompany = async () => {
    try {
      const res = await fetch(`/api/companies/${params.id}`);
      const data = await res.json();
      setCompany(data);
      if (data) {
        setFormName(data.name);
        setFormBizNum(data.businessNumber || '');
        setFormCeo(data.ceoName || '');
        setFormAddress(data.address || '');
        setFormContactPerson(data.contactPerson || '');
        setFormContactEmail(data.contactEmail || '');
        setFormContactPhone(data.contactPhone || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [params.id]);

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/companies/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          businessNumber: formBizNum,
          ceoName: formCeo,
          address: formAddress,
          contactPerson: formContactPerson,
          contactEmail: formContactEmail,
          contactPhone: formContactPhone,
        }),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchCompany();
      } else {
        alert('수정에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!confirm(`고객사 [${company?.name}]를 삭제하시겠습니까? 연결된 모든 프로젝트와 견적서가 함께 삭제됩니다.`)) return;
    try {
      const res = await fetch(`/api/companies/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/companies');
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

  if (!company) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-semibold mb-4">고객사를 찾을 수 없습니다.</p>
        <Link href="/companies" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs">
          고객사 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const allEstimates = company.projects?.flatMap((p: any) => p.estimates?.map((e: any) => ({ ...e, projectName: p.title })) || []) || [];
  const totalAmount = allEstimates.reduce((s: number, c: any) => s + (c.grandTotal || 0), 0);
  const wonAmount = allEstimates.filter((e: any) => e.status === 'WON').reduce((s: number, c: any) => s + (c.grandTotal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/companies"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{company.name}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              사업자번호: {company.businessNumber || '-'} | 대표: {company.ceoName || '-'}
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
            고객사 정보 수정
          </button>
          <button
            type="button"
            onClick={handleDeleteCompany}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            고객사 삭제
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

      {/* Info & Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 space-y-3">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
            고객사(거래처) 대표 정보
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">대표 담당자</span>
              <span className="font-semibold text-slate-800">{company.contactPerson || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">대표 전화번호</span>
              <span className="font-mono font-medium text-slate-800">{company.contactPhone || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">대표 이메일 주소</span>
              <span className="text-blue-600 font-mono">{company.contactEmail || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block mb-0.5">사업장 소재지</span>
              <span className="text-slate-800">{company.address || '-'}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">해당 고객사 누적 견적</div>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">
              ₩{formatCurrency(totalAmount)}
            </div>
            <div className="text-xs text-emerald-400 mt-2 font-medium">
              수주 체결: ₩{formatCurrency(wonAmount)}
            </div>
          </div>
          <div className="text-xs text-slate-400 border-t border-slate-800 pt-3 mt-4">
            총 {company.projects?.length || 0}개 프로젝트 / {allEstimates.length}개 견적 발행
          </div>
        </div>
      </div>

      {/* Projects List with specific client contact for each project */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-blue-600" />
          고객사 진행 프로젝트 및 프로젝트별 담당자 연락처
        </h3>

        {(!company.projects || company.projects.length === 0) ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            등록된 프로젝트가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.projects.map((p: any) => (
              <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {p.status === 'IN_PROGRESS' ? '진행중' : p.status === 'PLANNING' ? '기획' : '완료'}
                    </span>
                    <span className="text-xs text-slate-400">
                      견적 {p.estimates?.length || 0}건
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">{p.title}</h4>
                  
                  {/* 프로젝트별 담당자 배너 */}
                  <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-slate-200/70 text-xs space-y-1">
                    <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{p.clientDept ? `[${p.clientDept}] ` : ''}{p.clientManager || '담당자 미지정'} {p.clientPosition || ''}</span>
                    </div>
                    {p.clientPhone && (
                      <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{p.clientPhone}</span>
                      </div>
                    )}
                    {p.clientEmail && (
                      <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{p.clientEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-xs text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    프로젝트 상세 및 버전 보기 <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estimates Timeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          고객사 견적 발행 및 버전 이력 타임라인
        </h3>

        {allEstimates.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            발행된 견적 이력이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-y border-slate-200">
                  <th className="py-2.5 px-4">견적번호 / 버전</th>
                  <th className="py-2.5 px-4">프로젝트명</th>
                  <th className="py-2.5 px-4">견적서 제목</th>
                  <th className="py-2.5 px-4 text-right">견적 총액 (VAT포함)</th>
                  <th className="py-2.5 px-4 text-center">상태</th>
                  <th className="py-2.5 px-4 text-center">발행일자</th>
                  <th className="py-2.5 px-4 text-center">바로가기</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allEstimates.map((est) => {
                  const badge = getStatusBadge(est.status);
                  return (
                    <tr key={est.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/estimates/${est.id}/edit`} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                            {est.estimateNumber}
                          </Link>
                          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono border border-blue-200">
                            v{est.version.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-700">
                        {est.projectName}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-800">
                        {est.title}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-xs">
                        ₩{formatCurrency(est.grandTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-xs text-slate-500 font-mono">
                        {formatDate(est.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-center">
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

      {/* 고객사 수정 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">고객사 정보 수정</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCompany} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  고객사(회사명) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    사업자등록번호
                  </label>
                  <input
                    type="text"
                    value={formBizNum}
                    onChange={(e) => setFormBizNum(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표자명
                  </label>
                  <input
                    type="text"
                    value={formCeo}
                    onChange={(e) => setFormCeo(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  사업장 주소
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표 담당자
                  </label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표 전화
                  </label>
                  <input
                    type="text"
                    value={formContactPhone}
                    onChange={(e) => setFormContactPhone(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    대표 이메일
                  </label>
                  <input
                    type="email"
                    value={formContactEmail}
                    onChange={(e) => setFormContactEmail(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
    </div>
  );
}
