'use client';

import React from 'react';
import { Plus, Trash2, UserCheck, HelpCircle } from 'lucide-react';
import { LaborItem, StandardGradeRate, RateNoticeInfo } from '@/types/estimate';
import { formatCurrency } from '@/lib/calculator';
import FormattedNumberInput from '@/components/ui/FormattedNumberInput';
import { Calendar, Info } from 'lucide-react';

interface LaborSectionProps {
  labors: LaborItem[];
  onChange: (labors: LaborItem[]) => void;
  standardRates: StandardGradeRate[];
  rateNoticeInfo?: RateNoticeInfo;
}

export default function LaborSection({ labors, onChange, standardRates, rateNoticeInfo }: LaborSectionProps) {
  const handleAdd = () => {
    const defaultGrade = standardRates[2] || standardRates[0] || { grade: '중급기술자', monthlyRate: 6250000 };
    onChange([
      ...labors,
      {
        role: '백엔드 개발',
        grade: defaultGrade.grade,
        manMonths: 1.0,
        unitPrice: defaultGrade.monthlyRate,
        totalPrice: defaultGrade.monthlyRate,
        sortOrder: labors.length,
      },
    ]);
  };

  const handleRemove = (index: number) => {
    const updated = labors.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof LaborItem, value: any) => {
    const updated = [...labors];
    const item = { ...updated[index], [field]: value };

    // 등급 변경 시 해당 등급의 기준 노임단가 자동 채우기
    if (field === 'grade') {
      const found = standardRates.find((r) => r.grade === value);
      if (found) {
        item.unitPrice = found.monthlyRate;
      }
    }

    // 금액 재계산
    if (field === 'manMonths' || field === 'unitPrice' || field === 'grade') {
      const mm = Number(item.manMonths) || 0;
      const price = Number(item.unitPrice) || 0;
      item.totalPrice = Math.round(mm * price);
    }

    updated[index] = item;
    onChange(updated);
  };

  const totalLaborCost = labors.reduce((acc, cur) => acc + (cur.totalPrice || 0), 0);
  const totalMM = labors.reduce((acc, cur) => acc + (Number(cur.manMonths) || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base">SW 개발비 (직접인건비)</h3>
              {rateNoticeInfo && (
                <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  {rateNoticeInfo.noticeNumber || 'KOSA 표준 노임단가 적용'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {rateNoticeInfo?.announcedDate ? `공표/발표일: ${rateNoticeInfo.announcedDate} (${rateNoticeInfo.effectivePeriod || '기준'})` : '한국 SW사업 대가산정 투입공수(M/M) 방식 기준'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-semibold">
            총 {totalMM.toFixed(2)} M/M
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            인력 추가
          </button>
        </div>
      </div>

      {labors.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
          투입할 SW 개발 인력 정보가 없습니다. [인력 추가] 버튼을 눌러 추가하세요.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[660px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-y border-slate-200">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 min-w-[180px]">담당 역할 / 직무</th>
                <th className="py-2.5 px-3 w-36">기술 등급</th>
                <th className="py-2.5 px-2 w-20 text-right">공수(M/M)</th>
                <th className="py-2.5 px-2 w-28 text-right">월 노임단가(원)</th>
                <th className="py-2.5 px-3 w-32 text-right">직접인건비(원)</th>
                <th className="py-2.5 px-3 w-10 text-center">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {labors.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-center text-xs text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => handleChange(idx, 'role', e.target.value)}
                      placeholder="예: 프로젝트 총괄 PM, 백엔드 개발, UI 기획"
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={item.grade}
                      onChange={(e) => handleChange(idx, 'grade', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
                    >
                      {standardRates.map((r) => (
                        <option key={r.grade} value={r.grade}>
                          {r.grade}
                        </option>
                      ))}
                      {!standardRates.some((r) => r.grade === item.grade) && (
                        <option value={item.grade}>{item.grade}</option>
                      )}
                    </select>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={item.manMonths}
                      onChange={(e) => handleChange(idx, 'manMonths', parseFloat(e.target.value) || 0)}
                      className="w-full text-right px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <FormattedNumberInput
                      value={item.unitPrice}
                      onChange={(val) => handleChange(idx, 'unitPrice', val)}
                      placeholder="0"
                      className="w-full text-right px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono text-xs">
                    ₩{formatCurrency(item.totalPrice)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50/60 font-semibold text-slate-900 border-t border-indigo-100 text-xs">
                <td colSpan={3} className="py-3 px-4 text-left font-bold text-indigo-900">
                  직접인건비 소계
                </td>
                <td className="py-3 px-2 text-right font-mono font-bold text-indigo-700">
                  {totalMM.toFixed(2)} M/M
                </td>
                <td></td>
                <td className="py-3 px-3 text-right font-mono text-indigo-700 text-sm font-bold">
                  ₩{formatCurrency(totalLaborCost)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
