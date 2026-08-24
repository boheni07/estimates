'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  Download, 
  GitBranch, 
  Building2, 
  FolderKanban, 
  Check, 
  Clock, 
  AlertCircle,
  FileText,
  HelpCircle,
  User,
  ShieldAlert
} from 'lucide-react';
import { EstimateType, StandardGradeRate, LaborItem, ProductItem, ExpenseItem, RateNoticeInfo } from '@/types/estimate';
import { calculateEstimate } from '@/lib/calculator';
import { useAuth } from '@/context/AuthContext';
import LaborSection from '@/components/estimate/LaborSection';
import ItemSection from '@/components/estimate/ItemSection';
import ExpenseSection from '@/components/estimate/ExpenseSection';
import CalculationSummaryCard from '@/components/estimate/CalculationSummaryCard';
import VersionHistoryModal from '@/components/estimate/VersionHistoryModal';
import { DEFAULT_STANDARD_RATES, DEFAULT_RATE_NOTICE_INFO } from '@/lib/defaultRates';

export default function EditEstimatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [estimate, setEstimate] = useState<EstimateType | null>(null);
  const [standardRates, setStandardRates] = useState<StandardGradeRate[]>(DEFAULT_STANDARD_RATES);
  const [rateNoticeInfo, setRateNoticeInfo] = useState<RateNoticeInfo>(DEFAULT_RATE_NOTICE_INFO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  // 폼 상태
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<any>('DRAFT');
  const [overheadRate, setOverheadRate] = useState(110.0);
  const [technicalRate, setTechnicalRate] = useState(20.0);
  const [profitRate, setProfitRate] = useState(0.0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatRate, setVatRate] = useState(10.0);
  const [validUntil, setValidUntil] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [remarks, setRemarks] = useState('');

  const [labors, setLabors] = useState<LaborItem[]>([]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  // 1. 기준 노임단가 및 견적서 데이터 로드
  useEffect(() => {
    // 노임단가 및 공고 정보 로드
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.standardRates) setStandardRates(data.standardRates);
        if (data.rateNoticeInfo) setRateNoticeInfo(data.rateNoticeInfo);
      })
      .catch(console.error);

    // 견적서 로드
    fetch(`/api/estimates/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('견적서를 찾을 수 없습니다.');
        return res.json();
      })
      .then((data: EstimateType) => {
        setEstimate(data);
        setTitle(data.title);
        setStatus(data.status);
        setOverheadRate(data.overheadRate);
        setTechnicalRate(data.technicalRate);
        setProfitRate(data.profitRate);
        setDiscountAmount(data.discountAmount);
        setVatRate(data.vatRate);
        setValidUntil(data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : '');
        setPaymentTerms(data.paymentTerms || '');
        setRemarks(data.remarks || '');
        setLabors(data.labors || []);
        setItems(data.items || []);
        setExpenses(data.expenses || []);
        setLoading(false);

        // 열람 감사 로그 기록
        fetch(`/api/estimates/${params.id}/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'VIEW' }),
        }).catch(() => {});
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  // 실시간 계산 결과 산출
  const calculation = calculateEstimate(labors, items, expenses, {
    overheadRate,
    technicalRate,
    profitRate,
    discountAmount,
    vatRate,
  });

  const handleRateChange = (field: string, value: number) => {
    if (field === 'overheadRate') setOverheadRate(value);
    if (field === 'technicalRate') setTechnicalRate(value);
    if (field === 'profitRate') setProfitRate(value);
    if (field === 'discountAmount') setDiscountAmount(value);
    if (field === 'vatRate') setVatRate(value);
  };

  const handleSave = async () => {
    setSaving(true);
    setToastMessage('');

    try {
      const res = await fetch(`/api/estimates/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          status,
          overheadRate,
          technicalRate,
          profitRate,
          discountAmount,
          vatRate,
          validUntil: validUntil || null,
          paymentTerms,
          remarks,
          labors,
          items,
          expenses,
        }),
      });

      if (!res.ok) throw new Error('저장 실패');

      const updated = await res.json();

      if (updated.branched) {
        alert(updated.branchMessage || '다른 사용자의 견적서이므로 새 버전으로 자동 분기 생성되었습니다.');
        router.push(`/estimates/${updated.id}/edit`);
        return;
      }

      setEstimate(updated);
      setToastMessage('견적서가 성공적으로 저장되었습니다.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-semibold mb-4">견적서 정보를 찾을 수 없습니다.</p>
        <Link href="/estimates" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3">
          <Link
            href="/estimates"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors mt-1 md:mt-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-500">{estimate.estimateNumber}</span>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                v{estimate.version.toFixed(1)}
              </span>
              {estimate.author && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                  <User className="w-3 h-3 text-slate-500" />
                  <span>작성자: {estimate.author.name} {estimate.author.position} ({estimate.author.department})</span>
                </span>
              )}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-50 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="DRAFT">작성중 (Draft)</option>
                <option value="REVIEW">내부검토 (Review)</option>
                <option value="SENT">제출완료 (Sent)</option>
                <option value="WON">수주확정 (Won)</option>
                <option value="LOST">실주 (Lost)</option>
                <option value="CANCELED">취소/보류</option>
              </select>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {estimate.project?.company?.name || '고객사'}
              </span>
              <span>/</span>
              <span className="flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                {estimate.project?.title}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsVersionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200 transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            버전 분기/이력
          </button>

          <Link
            href={`/estimates/${estimate.id}/preview`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            공식 견적서 인쇄
          </Link>

          <a
            href={`/api/estimates/${estimate.id}/excel`}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            엑셀 다운로드
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>

      {/* ⚠️ 타인 작성 견적서 자동 분기 안내 배너 */}
      {estimate.authorId && currentUser && estimate.authorId !== currentUser.id && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900 text-sm">
              <span>타 사용자 견적서 편집 안내 (자동 마이너 버전 분기)</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              본 견적서는 <strong className="font-semibold text-amber-950">{estimate.author?.name} {estimate.author?.position}</strong>님이 작성한 문서입니다.
              내용을 수정하여 저장하시면 기존 원본은 보존되며, <strong>v{(estimate.version + 0.1).toFixed(1)} 마이너 버전으로 자동 분기 생성</strong>되어 내 작성 문서로 등록됩니다.
            </p>
          </div>
        </div>
      )}

      {/* Main Form Body (2 Cols Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Items Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* 견적서 제목 수정 바 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              견적서 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Section 1: SW 개발 인건비 (직접인건비) */}
          <LaborSection
            labors={labors}
            onChange={setLabors}
            standardRates={standardRates}
            rateNoticeInfo={rateNoticeInfo}
          />

          {/* Section 2: 물품 및 라이선스 */}
          <ItemSection
            items={items}
            onChange={setItems}
          />

          {/* Section 3: 직접경비 (실비) */}
          <ExpenseSection
            expenses={expenses}
            onChange={setExpenses}
          />

          {/* Section 4: 결제조건 및 특이사항 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-base">결제조건 및 계약 메모</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  견적 유효기간
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  대금지급조건 (Payment Terms)
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="예: 계약체결 시 선금 40%, 잔금 60%"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                특이사항 및 비고 (Remarks)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="고객사 요구사항 및 특약사항을 기재하세요."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Rate & Summary Card */}
        <div className="lg:col-span-1">
          <CalculationSummaryCard
            calculation={calculation}
            overheadRate={overheadRate}
            technicalRate={technicalRate}
            profitRate={profitRate}
            discountAmount={discountAmount}
            vatRate={vatRate}
            onRateChange={handleRateChange}
          />
        </div>
      </div>

      {/* Version History Modal */}
      <VersionHistoryModal
        estimate={estimate}
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
      />
    </div>
  );
}
