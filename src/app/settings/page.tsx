'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building, 
  Coins, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  Percent,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { StandardGradeRate, CompanySupplierInfo, RateNoticeInfo } from '@/types/estimate';
import { DEFAULT_STANDARD_RATES, DEFAULT_SUPPLIER_INFO, DEFAULT_ESTIMATE_RATES, DEFAULT_RATE_NOTICE_INFO } from '@/lib/defaultRates';
import { formatCurrency } from '@/lib/calculator';
import FormattedNumberInput from '@/components/ui/FormattedNumberInput';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'rates' | 'supplier' | 'defaults'>('rates');
  const [standardRates, setStandardRates] = useState<StandardGradeRate[]>(DEFAULT_STANDARD_RATES);
  const [rateNoticeInfo, setRateNoticeInfo] = useState<RateNoticeInfo>(DEFAULT_RATE_NOTICE_INFO);
  const [supplierInfo, setSupplierInfo] = useState<CompanySupplierInfo>(DEFAULT_SUPPLIER_INFO);
  const [defaultRates, setDefaultRates] = useState(DEFAULT_ESTIMATE_RATES);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.standardRates) setStandardRates(data.standardRates);
        if (data.rateNoticeInfo) setRateNoticeInfo(data.rateNoticeInfo);
        if (data.supplierInfo) setSupplierInfo(data.supplierInfo);
        if (data.defaultRates) setDefaultRates(data.defaultRates);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setToastMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standardRates,
          rateNoticeInfo,
          supplierInfo,
          defaultRates,
        }),
      });

      if (!res.ok) throw new Error('설정 저장 실패');

      setToastMessage('설정이 성공적으로 저장되었습니다.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || '저장 중 오류 발생');
    } finally {
      setSaving(false);
    }
  };

  // 노임단가 조작
  const handleRateChange = (idx: number, field: keyof StandardGradeRate, val: any) => {
    const updated = [...standardRates];
    const item = { ...updated[idx], [field]: val };
    
    // 월단가 변경 시 일단가/시간단가 자동 연산
    if (field === 'monthlyRate') {
      const monthly = parseInt(val, 10) || 0;
      item.dailyRate = Math.round(monthly / 20.83);
      item.hourlyRate = Math.round(item.dailyRate / 8);
    }

    updated[idx] = item;
    setStandardRates(updated);
  };

  const handleAddRate = () => {
    setStandardRates([
      ...standardRates,
      {
        grade: '신규 기술등급',
        monthlyRate: 5000000,
        dailyRate: 240000,
        hourlyRate: 30000,
        description: '설명',
      },
    ]);
  };

  const handleRemoveRate = (idx: number) => {
    setStandardRates(standardRates.filter((_, i) => i !== idx));
  };

  const handleResetRates = () => {
    if (confirm('KOSA 표준 기본 노임단가표로 초기화하시겠습니까?')) {
      setStandardRates(DEFAULT_STANDARD_RATES);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">기준 정보 및 마스터 설정</h1>
          <p className="text-sm text-slate-500 mt-1">
            KOSA SW기술자 노임단가표, 자사 공급자 정보 및 기본 견적 요율을 설정합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? '저장 중...' : '전체 설정 저장'}
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-3 gap-6 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('rates')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'rates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          SW기술자 기준 노임단가표
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('supplier')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'supplier'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          자사(공급자) 공식 정보
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('defaults')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'defaults'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          기본 요율 설정 (제경비/기술료)
        </button>
      </div>

      {/* Tab 1: SW기술자 노임단가표 */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* 공고 기준 정보 배너 및 편집 영역 */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">공식 기준</span>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{rateNoticeInfo.noticeName}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {rateNoticeInfo.noticeNumber} | 통계승인: {rateNoticeInfo.approvalNumber}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-200">
                월평균 근무 {rateNoticeInfo.workDaysPerMonth || 20.83}일 기준
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  공표/발표일자
                </label>
                <input
                  type="date"
                  value={rateNoticeInfo.announcedDate}
                  onChange={(e) => setRateNoticeInfo({ ...rateNoticeInfo, announcedDate: e.target.value })}
                  className="w-full p-2 text-xs border border-blue-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  적용 기간 (기준일)
                </label>
                <input
                  type="text"
                  value={rateNoticeInfo.effectivePeriod}
                  onChange={(e) => setRateNoticeInfo({ ...rateNoticeInfo, effectivePeriod: e.target.value })}
                  placeholder="2024.01.01 ~ 차기 공표일까지"
                  className="w-full p-2 text-xs border border-blue-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  조사 기준 실적 기간
                </label>
                <input
                  type="text"
                  value={rateNoticeInfo.surveyPeriod || ''}
                  onChange={(e) => setRateNoticeInfo({ ...rateNoticeInfo, surveyPeriod: e.target.value })}
                  placeholder="2023년 5월 ~ 6월 실적 기준"
                  className="w-full p-2 text-xs border border-blue-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  공고명
                </label>
                <input
                  type="text"
                  value={rateNoticeInfo.noticeName}
                  onChange={(e) => setRateNoticeInfo({ ...rateNoticeInfo, noticeName: e.target.value })}
                  className="w-full p-2 text-xs border border-blue-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  공고 번호
                </label>
                <input
                  type="text"
                  value={rateNoticeInfo.noticeNumber}
                  onChange={(e) => setRateNoticeInfo({ ...rateNoticeInfo, noticeNumber: e.target.value })}
                  className="w-full p-2 text-xs border border-blue-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="font-bold text-slate-800 text-base">SW 기술자 등급별 월/일/시간 기준 노임단가</h3>
              <p className="text-xs text-slate-500">
                위 공고 기준에 따라 월단가 입력 시 일단가(월 20.83일 기준) 및 시간단가(1일 8시간 기준)가 자동 계산됩니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetRates}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                표준값으로 초기화
              </button>
              <button
                type="button"
                onClick={handleAddRate}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                등급 추가
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-y border-slate-200">
                  <th className="py-2.5 px-3 w-40">기술 등급명</th>
                  <th className="py-2.5 px-3 w-48 text-right">기준 월단가 (원/월)</th>
                  <th className="py-2.5 px-3 w-36 text-right">일 기준단가 (원/일)</th>
                  <th className="py-2.5 px-3 min-w-[200px]">직무 설명 / 참고사항</th>
                  <th className="py-2.5 px-3 w-12 text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {standardRates.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={r.grade}
                        onChange={(e) => handleRateChange(idx, 'grade', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <FormattedNumberInput
                        value={r.monthlyRate}
                        onChange={(val) => handleRateChange(idx, 'monthlyRate', val)}
                        placeholder="0"
                        className="w-full text-right px-2.5 py-1.5 text-xs font-mono font-bold text-blue-700 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-xs text-slate-500">
                      ₩{formatCurrency(r.dailyRate)}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={r.description || ''}
                        onChange={(e) => handleRateChange(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRate(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: 자사 공급자 정보 */}
      {activeTab === 'supplier' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-base">공식 견적서 발행용 자사(공급자) 정보</h3>
            <p className="text-xs text-slate-500">
              견적서 인쇄 및 PDF, 엑셀 출력 시 우측 상단 공급자 란에 표시될 정보입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                상호 (회사명) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={supplierInfo.companyName}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, companyName: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                사업자등록번호 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={supplierInfo.businessNumber}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, businessNumber: e.target.value })}
                placeholder="123-45-67890"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                대표자명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={supplierInfo.ceoName}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, ceoName: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                대표 전화번호
              </label>
              <input
                type="text"
                value={supplierInfo.tel}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, tel: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                업태
              </label>
              <input
                type="text"
                value={supplierInfo.businessType}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, businessType: e.target.value })}
                placeholder="서비스, 정보통신"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                종목
              </label>
              <input
                type="text"
                value={supplierInfo.businessItem}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, businessItem: e.target.value })}
                placeholder="소프트웨어 개발 및 공급"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                사업장 소재지 (주소) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={supplierInfo.address}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, address: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                대표 이메일
              </label>
              <input
                type="email"
                value={supplierInfo.email}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, email: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                팩스 번호
              </label>
              <input
                type="text"
                value={supplierInfo.fax || ''}
                onChange={(e) => setSupplierInfo({ ...supplierInfo, fax: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 기본 요율 설정 */}
      {activeTab === 'defaults' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 shadow-sm p-8 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-base">기본 견적 4대 요율 설정 (제경비, 기술료, 이윤, 부가가치세)</h3>
            <p className="text-xs text-slate-500">
              새 견적서 작성 시 기본으로 채워질 표준 요율입니다. 프로젝트별 견적서 작성 화면에서 개별 수정도 가능합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. 제경비율 */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded">1. 제경비</span>
                  <span className="text-[10px] text-slate-400">인건비 기준</span>
                </div>
                <label className="block text-sm font-bold text-slate-800">
                  제경비율 (%)
                </label>
                <p className="text-[11px] text-slate-500 leading-tight mt-1">
                  일반관리비 및 사무지원비 (통상 110%~120%)
                </p>
              </div>
              <div className="flex items-center gap-1.5 pt-3">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="300"
                  value={defaultRates.overheadRate}
                  onChange={(e) => setDefaultRates({ ...defaultRates, overheadRate: parseFloat(e.target.value) || 0 })}
                  className="w-full text-right p-2.5 text-base font-bold font-mono border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-sm font-bold text-slate-600">%</span>
              </div>
            </div>

            {/* 2. 기술료율 */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded">2. 기술료</span>
                  <span className="text-[10px] text-slate-400">(인건비+제경비) 기준</span>
                </div>
                <label className="block text-sm font-bold text-slate-800">
                  기술료율 (%)
                </label>
                <p className="text-[11px] text-slate-500 leading-tight mt-1">
                  기술축적 및 개발보상 (통상 20%~40%)
                </p>
              </div>
              <div className="flex items-center gap-1.5 pt-3">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={defaultRates.technicalRate}
                  onChange={(e) => setDefaultRates({ ...defaultRates, technicalRate: parseFloat(e.target.value) || 0 })}
                  className="w-full text-right p-2.5 text-base font-bold font-mono border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-sm font-bold text-slate-600">%</span>
              </div>
            </div>

            {/* 3. 이윤율 */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded">3. 이윤</span>
                  <span className="text-[10px] text-slate-400">개발원가 기준</span>
                </div>
                <label className="block text-sm font-bold text-slate-800">
                  이윤율 (%)
                </label>
                <p className="text-[11px] text-slate-500 leading-tight mt-1">
                  개발원가(인건비+제경비+기술료)의 25% 이내
                </p>
              </div>
              <div className="flex items-center gap-1.5 pt-3">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="25"
                  value={defaultRates.profitRate}
                  onChange={(e) => setDefaultRates({ ...defaultRates, profitRate: parseFloat(e.target.value) || 0 })}
                  className="w-full text-right p-2.5 text-base font-bold font-mono border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-sm font-bold text-slate-600">%</span>
              </div>
            </div>

            {/* 4. 부가가치세율 */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-purple-50/40 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded">4. 부가가치세</span>
                  <span className="text-[10px] text-slate-400">공급가액 기준</span>
                </div>
                <label className="block text-sm font-bold text-slate-800">
                  부가가치세 (VAT %)
                </label>
                <p className="text-[11px] text-slate-500 leading-tight mt-1">
                  대한민국 일반 과세 표준 10%
                </p>
              </div>
              <div className="flex items-center gap-1.5 pt-3">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="20"
                  value={defaultRates.vatRate}
                  onChange={(e) => setDefaultRates({ ...defaultRates, vatRate: parseFloat(e.target.value) || 0 })}
                  className="w-full text-right p-2.5 text-base font-bold font-mono border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <span className="text-sm font-bold text-slate-600">%</span>
              </div>
            </div>
          </div>

          {/* 추가: 기본 계약 조건 및 비고 설정 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 mt-6">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200/80 pb-2">
              기본 계약 조건 및 공통 안내사항
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  기본 대금 지급 조건 (결제조건)
                </label>
                <input
                  type="text"
                  value={defaultRates.paymentTerms || ''}
                  onChange={(e) => setDefaultRates({ ...defaultRates, paymentTerms: e.target.value })}
                  placeholder="예: 계약금 40%, 중도금 30%, 잔금 30% (검수완료 후)"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  기본 견적서 비고사항 / 유효기간 안내
                </label>
                <input
                  type="text"
                  value={defaultRates.remarks || ''}
                  onChange={(e) => setDefaultRates({ ...defaultRates, remarks: e.target.value })}
                  placeholder="예: 본 견적서는 발행일로부터 30일간 유효합니다."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
