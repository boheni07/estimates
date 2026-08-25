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
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm tracking-tight">견적 산출 및 요율</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            자동계산
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 4대 요율 및 할인 1줄씩 (Row-by-Row) 컴팩트 구성 */}
        <div className="space-y-2">
          {/* 1. 제경비율 */}
          <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800">제경비율</div>
              <div className="text-[10px] text-slate-400 truncate">직접인건비 기준</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number"
                step="1"
                min="0"
                max="300"
                value={overheadRate}
                onChange={(e) => onRateChange('overheadRate', parseFloat(e.target.value) || 0)}
                className="w-16 text-right px-2 py-1 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
          </div>

          {/* 2. 기술료율 */}
          <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800">기술료율</div>
              <div className="text-[10px] text-slate-400 truncate">(인건+제경) 기준</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={technicalRate}
                onChange={(e) => onRateChange('technicalRate', parseFloat(e.target.value) || 0)}
                className="w-16 text-right px-2 py-1 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
          </div>

          {/* 3. 이윤율 */}
          <div className="bg-emerald-50/50 px-3 py-2 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-800">이윤율</div>
              <div className="text-[10px] text-emerald-600 truncate">개발원가 기준 (25% 이내)</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number"
                step="1"
                min="0"
                max="25"
                value={profitRate}
                onChange={(e) => onRateChange('profitRate', parseFloat(e.target.value) || 0)}
                className="w-16 text-right px-2 py-1 text-xs font-bold text-emerald-700 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-mono"
              />
              <span className="text-xs font-bold text-emerald-700">%</span>
            </div>
          </div>

          {/* 4. 특별할인 */}
          <div className="bg-rose-50/50 px-3 py-2 rounded-xl border border-rose-200/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-bold text-rose-800">특별 할인액</div>
              <div className="text-[10px] text-rose-600 truncate">네고/프로모션 차감</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <FormattedNumberInput
                value={discountAmount}
                onChange={(val) => onRateChange('discountAmount', val)}
                placeholder="0"
                className="w-24 text-right px-2 py-1 text-xs font-bold text-rose-600 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white font-mono"
              />
              <span className="text-xs font-bold text-rose-700">원</span>
            </div>
          </div>

          {/* 5. 부가가치세 */}
          <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800">부가가치세</div>
              <div className="text-[10px] text-slate-400 truncate">공급가액 기준</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                type="number"
                step="1"
                min="0"
                max="20"
                value={vatRate}
                onChange={(e) => onRateChange('vatRate', parseFloat(e.target.value) || 0)}
                className="w-16 text-right px-2 py-1 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-mono"
              />
              <span className="text-xs font-bold text-slate-500">%</span>
            </div>
          </div>
        </div>

        {/* 세부 산출 내역 리스트 */}
        <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span className="truncate">① 직접인건비</span>
            <span className="font-mono font-medium text-slate-800 flex-shrink-0">₩{formatCurrency(calculation.totalLaborCost)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span className="truncate">② 제경비 ({overheadRate}%)</span>
            <span className="font-mono font-medium text-slate-800 flex-shrink-0">₩{formatCurrency(calculation.totalOverheadCost)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span className="truncate">③ 기술료 ({technicalRate}%)</span>
            <span className="font-mono font-medium text-slate-800 flex-shrink-0">₩{formatCurrency(calculation.totalTechCost)}</span>
          </div>

          {calculation.totalProfitCost > 0 && (
            <div className="flex justify-between items-center text-emerald-700 py-0.5 font-medium">
              <span className="truncate">④ 이윤 ({profitRate}%)</span>
              <span className="font-mono flex-shrink-0">₩{formatCurrency(calculation.totalProfitCost)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span className="truncate">⑤ 직접경비 (실비)</span>
            <span className="font-mono font-medium text-slate-800 flex-shrink-0">₩{formatCurrency(calculation.totalExpenseCost)}</span>
          </div>

          <div className="flex justify-between items-center font-bold text-indigo-700 pt-1.5 pb-1 border-t border-dashed border-slate-200">
            <span className="truncate">용역소계 (①~⑤)</span>
            <span className="font-mono flex-shrink-0">₩{formatCurrency(calculation.totalDevService)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span className="truncate">⑥ 물품/솔루션</span>
            <span className="font-mono font-medium text-slate-800 flex-shrink-0">₩{formatCurrency(calculation.totalItemsCost)}</span>
          </div>

          {calculation.discountAmount > 0 && (
            <div className="flex justify-between items-center text-rose-600 py-0.5 font-medium">
              <span className="truncate">⑦ 특별할인 차감</span>
              <span className="font-mono flex-shrink-0">- ₩{formatCurrency(calculation.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center font-bold text-slate-900 pt-2 pb-1 border-t border-slate-200">
            <span className="truncate">총 공급가액</span>
            <span className="font-mono flex-shrink-0">₩{formatCurrency(calculation.totalSupplyPrice)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600 py-0.5">
            <span className="truncate">부가가치세 ({vatRate}%)</span>
            <span className="font-mono font-medium text-slate-800 flex-shrink-0">₩{formatCurrency(calculation.totalVat)}</span>
          </div>
        </div>

        {/* 최종 견적 총액 배너 */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-3.5 text-white shadow-md shadow-indigo-500/20">
          <div className="text-[11px] text-indigo-200 font-medium mb-0.5">최종 견적 합계 (VAT 포함)</div>
          <div className="text-xl font-extrabold font-mono tracking-tight text-white mb-1">
            ₩{formatCurrency(calculation.grandTotal)}
          </div>
          <div className="text-[10px] text-indigo-100 bg-white/10 px-2 py-0.5 rounded-md truncate">
            {numberToKoreanWon(calculation.grandTotal)}
          </div>
        </div>
      </div>
    </div>
  );
}
