'use client';

import React from 'react';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { ExpenseItem } from '@/types/estimate';
import { formatCurrency } from '@/lib/calculator';
import { DEFAULT_EXPENSE_CATEGORIES } from '@/lib/defaultRates';
import FormattedNumberInput from '@/components/ui/FormattedNumberInput';

interface ExpenseSectionProps {
  expenses: ExpenseItem[];
  onChange: (expenses: ExpenseItem[]) => void;
}

export default function ExpenseSection({ expenses, onChange }: ExpenseSectionProps) {
  const handleAdd = () => {
    onChange([
      ...expenses,
      {
        category: '여비교통비/출장비',
        description: '',
        amount: 0,
        sortOrder: expenses.length,
      },
    ]);
  };

  const handleRemove = (index: number) => {
    const updated = expenses.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof ExpenseItem, value: any) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const totalExpenseCost = expenses.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">직접경비 (실비 항목)</h3>
            <p className="text-xs text-slate-500">여비교통비, 인쇄비, 장비/클라우드 임차료, 시험인증비 등 실비</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          경비 추가
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
          등록된 직접경비 실비 항목이 없습니다. (선택사항)
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-y border-slate-200">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 w-44">경비 구분</th>
                <th className="py-2.5 px-3 min-w-[200px]">산출 내역 및 적요</th>
                <th className="py-2.5 px-3 w-36 text-right">금액 (원)</th>
                <th className="py-2.5 px-3 w-10 text-center">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {expenses.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-center text-xs text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <select
                      value={item.category}
                      onChange={(e) => handleChange(idx, 'category', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleChange(idx, 'description', e.target.value)}
                      placeholder="산출 근거 (예: 지방 출장 4회, 보고서 인쇄 10부)"
                      className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <FormattedNumberInput
                      value={item.amount}
                      onChange={(val) => handleChange(idx, 'amount', val)}
                      placeholder="0"
                      className="w-full text-right px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono bg-white"
                    />
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
              <tr className="bg-amber-50/60 font-semibold text-slate-900 border-t border-amber-100 text-xs">
                <td colSpan={3} className="py-3 px-4 text-left font-bold text-amber-900">
                  직접경비 합계
                </td>
                <td className="py-3 px-3 text-right font-mono text-amber-700 text-sm font-bold">
                  ₩{formatCurrency(totalExpenseCost)}
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
