'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, FolderKanban, FilePlus, Sparkles, Plus } from 'lucide-react';
import { CompanyType, ProjectType } from '@/types/estimate';

export default function NewEstimatePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  // 빠른 프로젝트 생성 모드
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectClientDept, setNewProjectClientDept] = useState('');
  const [newProjectClientManager, setNewProjectClientManager] = useState('');
  const [newProjectClientPosition, setNewProjectClientPosition] = useState('');
  const [newProjectClientPhone, setNewProjectClientPhone] = useState('');
  const [newProjectClientEmail, setNewProjectClientEmail] = useState('');

  const [title, setTitle] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('계약금 40%, 중도금 30%, 잔금 30% (검수완료 후)');
  const [remarks, setRemarks] = useState('본 견적서는 발행일로부터 30일간 유효합니다.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. 고객사 목록 로드
  useEffect(() => {
    fetch('/api/companies')
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data);
        if (data.length > 0) {
          setSelectedCompanyId(data[0].id);
        }
      });
  }, []);

  // 2. 고객사 선택 시 해당 고객사의 프로젝트 목록 로드
  useEffect(() => {
    if (!selectedCompanyId) {
      setProjects([]);
      return;
    }
    fetch(`/api/projects?companyId=${selectedCompanyId}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        } else {
          setSelectedProjectId('');
        }
      });
  }, [selectedCompanyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let targetProjectId = selectedProjectId;

      // 새 프로젝트 직접 생성인 경우
      if (isCreatingProject) {
        if (!newProjectTitle.trim()) {
          throw new Error('새 프로젝트 제목을 입력해주세요.');
        }
        const projRes = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId: selectedCompanyId,
            title: newProjectTitle,
            description: newProjectDesc,
            clientDept: newProjectClientDept,
            clientManager: newProjectClientManager,
            clientPosition: newProjectClientPosition,
            clientPhone: newProjectClientPhone,
            clientEmail: newProjectClientEmail,
            status: 'IN_PROGRESS',
          }),
        });
        if (!projRes.ok) throw new Error('프로젝트 생성에 실패했습니다.');
        const createdProj = await projRes.json();
        targetProjectId = createdProj.id;
      }

      if (!targetProjectId) {
        throw new Error('프로젝트를 선택하거나 새로 생성해주세요.');
      }

      if (!title.trim()) {
        throw new Error('견적서 제목을 입력해주세요.');
      }

      // 견적서 생성 API 호출 (기본 SW인력 템플릿 포함)
      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: targetProjectId,
          title,
          paymentTerms,
          remarks,
          overheadRate: 110.0,
          technicalRate: 20.0,
          vatRate: 10.0,
          labors: [
            { role: '프로젝트 총괄/PM', grade: '총괄관리자(PM)', manMonths: 1.0, unitPrice: 11500000, totalPrice: 11500000 },
            { role: '백엔드/시스템 개발', grade: '고급기술자', manMonths: 1.0, unitPrice: 7980000, totalPrice: 7980000 },
            { role: '프론트엔드/UI 개발', grade: '중급기술자', manMonths: 1.0, unitPrice: 6250000, totalPrice: 6250000 },
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '견적서 생성 실패');
      }

      const estimate = await res.json();
      router.push(`/estimates/${estimate.id}/edit`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/estimates"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">새 견적서 작성 시작</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            견적 대상 고객사 및 프로젝트를 지정하고 견적서를 생성합니다.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 고객사 선택 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              1. 대상 고객사(거래처) 선택 <span className="text-rose-500">*</span>
            </label>
            {companies.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <p className="text-xs text-slate-600 mb-2">등록된 고객사가 없습니다.</p>
                <Link
                  href="/companies"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> 먼저 고객사를 등록해주세요
                </Link>
              </div>
            ) : (
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.contactPerson ? `(담당: ${c.contactPerson})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. 프로젝트 선택 또는 생성 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4 text-indigo-600" />
                2. 프로젝트 선택 <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingProject(!isCreatingProject)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
              >
                {isCreatingProject ? '기존 프로젝트에서 선택' : '+ 새 프로젝트 직접 입력'}
              </button>
            </div>

            {isCreatingProject ? (
              <div className="p-4 bg-indigo-50/40 border border-indigo-200 rounded-xl space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                    신규 프로젝트명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: 2026년 차세대 고객포털 구축"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="w-full p-2.5 text-xs border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                      고객사 담당부서
                    </label>
                    <input
                      type="text"
                      placeholder="디지털혁신팀"
                      value={newProjectClientDept}
                      onChange={(e) => setNewProjectClientDept(e.target.value)}
                      className="w-full p-2 text-xs border border-indigo-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                      담당자명 / 직책
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        placeholder="홍길동"
                        value={newProjectClientManager}
                        onChange={(e) => setNewProjectClientManager(e.target.value)}
                        className="w-full p-2 text-xs border border-indigo-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                      <input
                        type="text"
                        placeholder="팀장"
                        value={newProjectClientPosition}
                        onChange={(e) => setNewProjectClientPosition(e.target.value)}
                        className="w-full p-2 text-xs border border-indigo-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                      담당자 연락처
                    </label>
                    <input
                      type="text"
                      placeholder="010-1234-5678"
                      value={newProjectClientPhone}
                      onChange={(e) => setNewProjectClientPhone(e.target.value)}
                      className="w-full p-2 text-xs border border-indigo-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                      담당자 이메일
                    </label>
                    <input
                      type="email"
                      placeholder="manager@company.com"
                      value={newProjectClientEmail}
                      onChange={(e) => setNewProjectClientEmail(e.target.value)}
                      className="w-full p-2 text-xs border border-indigo-200 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                    프로젝트 개요
                  </label>
                  <textarea
                    placeholder="사업 범위 및 주요 개요"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    rows={2}
                    className="w-full p-2 text-xs border border-indigo-200 rounded-lg focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <p className="text-xs text-slate-600 mb-2">해당 고객사에 등록된 프로젝트가 없습니다.</p>
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(true)}
                  className="text-xs text-indigo-600 font-bold hover:underline"
                >
                  + 새 프로젝트 생성하기
                </button>
              </div>
            ) : (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3. 견적서 제목 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <FilePlus className="w-4 h-4 text-emerald-600" />
              3. 견적서 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="예: 시스템 구축 개발 용역 견적서 (초안)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              required
            />
          </div>

          {/* 4. 결제조건 및 비고 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                대금지급조건
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                비고사항 / 특이사항
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>스마트 견적서가 생성됩니다:</strong> 견적서 생성 즉시 인터랙티브 작성기로 이동하여 물품, SW기술등급별 공수(M/M), 직접경비, 제경비율(110%), 기술료율(20%)을 실시간으로 산출하고 수정할 수 있습니다.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/estimates"
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <FilePlus className="w-4 h-4" />
              {loading ? '견적서 생성 중...' : '견적서 생성 및 작성 시작'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
