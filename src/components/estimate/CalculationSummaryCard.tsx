'use client';

import React from 'react';
import { Calculator, Percent, Tag, ShieldCheck, ArrowDownRight } from 'lucide-react';
import { CalculationResult, numberToKoreanWon, formatCurrency } from '@/lib/calculator';
import FormattedNumberInput from '@/components/ui/FormattedNumberInput';

interface CalculationSummaryCardProps {
  calculation: CalculationResult;
  overheadRate: number;
  technicalRate: number;
  profitRate: number;
  discountAmount: number;
  vatRate: number;
  onRateChange: (field: string, value: number) => void;
}

export default function CalculationSummaryCard({
  calculation,
  overheadRate,
  technicalRate,
  profitRate,
  discountAmount,
  vatRate,
  onRateChange,
}: CalculationSummaryCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-20">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base tracking-tight">견적 산출 및 요율 설정</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            실시간 자동계산
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          직접인건비 기준으로 제경비와 기술료가 자동 산정됩니다.
        </p>
      </div>

      <div className="p-5 space-y-6">
        {/* 4대 요율 및 할인 입력 컨트롤 */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. 제경비율 */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">제경비율</label>
              <span className="text-[10px] text-slate-400">인건비 기준</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="1"
                min="0"
                max="300"
                value={overheadRate}
                onChange={(e) => onRateChange('overheadRate', parseFloat(e.target.value) || 0)}
                className="w-full text-right px-2 py-1 text-sm font-bold border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <span className="text-xs font-semibold text-slate-500">%</span>
            </div>
          </div>

          {/* 2. 기술료율 */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">기술료율</label>
              <span className="text-[10px] text-slate-400">(인건+제경) 기준</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={technicalRate}
                onChange={(e) => onRateChange('technicalRate', parseFloat(e.target.value) || 0)}
                className="w-full text-right px-2 py-1 text-sm font-bold border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <span className="text-xs font-semibold text-slate-500">%</span>
            </div>
          </div>

          {/* 3. 이윤율 */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-emerald-700">이윤율</label>
              <span className="text-[10px] text-slate-400">개발원가 기준 (25% 이내)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="1"
                min="0"
                max="25"
                value={profitRate}
                onChange={(e) => onRateChange('profitRate', parseFloat(e.target.value) || 0)}
                className="w-full text-right px-2 py-1 text-sm font-bold text-emerald-700 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
              />
              <span className="text-xs font-semibold text-slate-500">%</span>
            </div>
          </div>

          {/* 4. 부가세율 */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">부가가치세</label>
              <span className="text-[10px] text-slate-400">공급가액 기준</span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="1"
                min="0"
                max="20"
                value={vatRate}
                onChange={(e) => onRateChange('vatRate', parseFloat(e.target.value) || 0)}
                className="w-full text-right px-2 py-1 text-sm font-bold border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <span className="text-xs font-semibold text-slate-500">%</span>
            </div>
          </div>

          {/* 특별 할인액 (전체 2칸 차지) */}
          <div className="col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-rose-700">특별 할인액 (네고/프로모션 차감)</label>
            </div>
            <div className="flex items-center gap-1.5">
              <FormattedNumberInput
                value={discountAmount}
                onChange={(val) => onRateChange('discountAmount', val)}
                placeholder="0"
                className="w-full text-right px-2.5 py-1 text-sm font-bold text-rose-600 border border-slate-300 rounded focus:ring-1 focus:ring-rose-500 bg-white font-mono"
              />
              <span className="text-xs font-semibold text-slate-500">원</span>
            </div>
          </div>
        </div>

        {/* 세부 산출 내역 리스트 */}
        <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span>① 직접인건비</span>
            <span className="font-mono font-medium text-slate-800">₩{formatCurrency(calculation.totalLaborCost)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span>② 제경비 ({overheadRate}%)</span>
            <span className="font-mono font-medium text-slate-800">₩{formatCurrency(calculation.totalOverheadCost)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span>③ 기술료 ({technicalRate}%)</span>
            <span className="font-mono font-medium text-slate-800">₩{formatCurrency(calculation.totalTechCost)}</span>
          </div>

          {calculation.totalProfitCost > 0 && (
            <div className="flex justify-between items-center text-emerald-700 py-0.5 font-medium">
              <span>④ 이윤 ({profitRate}%)</span>
              <span className="font-mono">₩{formatCurrency(calculation.totalProfitCost)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span>⑤ 직접경비 (실비)</span>
            <span className="font-mono font-medium text-slate-800">₩{formatCurrency(calculation.totalExpenseCost)}</span>
          </div>

          <div className="flex justify-between items-center font-semibold text-indigo-700 pt-1 pb-1 border-t border-dashed border-slate-200">
            <span>SW개발용역 소계 (①+②+③+④+⑤)</span>
            <span className="font-mono">₩{formatCurrency(calculation.totalDevService)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span>⑥ 물품 및 솔루션 소계</span>
            <span className="font-mono font-medium text-slate-800">₩{formatCurrency(calculation.totalItemsCost)}</span>
          </div>

          {calculation.discountAmount > 0 && (
            <div className="flex justify-between items-center text-rose-600 py-0.5">
              <span>⑦ 특별할인 차감</span>
              <span className="font-mono font-medium">- ₩{formatCurrency(calculation.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center font-bold text-slate-900 pt-2 pb-1 border-t border-slate-200 text-sm">
            <span>총 공급가액</span>
            <span className="font-mono">₩{formatCurrency(calculation.totalSupplyPrice)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span>부가가치세 (VAT {vatRate}%)</span>
            <span className="font-mono font-medium text-slate-800">₩{formatCurrency(calculation.totalVat)}</span>
          </div>
        </div>

        {/* 최종 견적 총액 배너 */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-md shadow-blue-500/20">
          <div className="text-xs text-blue-200 font-medium mb-1">최종 견적 합계 (VAT 포함)</div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-white mb-1.5">
            ₩{formatCurrency(calculation.grandTotal)}
          </div>
          <div className="text-[11px] text-blue-100 bg-white/10 px-2.5 py-1 rounded-md">
            {numberToKoreanWon(calculation.grandTotal)}
          </div>
        </div>
      </div>
    </div>
  );
}
