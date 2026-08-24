'use client';

import React from 'react';
import { Plus, Trash2, Package, Layers } from 'lucide-react';
import { ProductItem } from '@/types/estimate';
import { formatCurrency } from '@/lib/calculator';
import { DEFAULT_ITEM_CATEGORIES } from '@/lib/defaultRates';
import FormattedNumberInput from '@/components/ui/FormattedNumberInput';

interface ItemSectionProps {
  items: ProductItem[];
  onChange: (items: ProductItem[]) => void;
}

export default function ItemSection({ items, onChange }: ItemSectionProps) {
  const handleAdd = () => {
    onChange([
      ...items,
      {
        category: '패키지 소프트웨어',
        name: '',
        spec: '',
        unit: 'EA',
        quantity: 1,
        unitPrice: 0,
        discountRate: 0,
        totalPrice: 0,
        sortOrder: items.length,
      },
    ]);
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof ProductItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // 금액 재계산: qty * unitPrice * (1 - discountRate/100)
    if (field === 'quantity' || field === 'unitPrice' || field === 'discountRate') {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const discount = Number(item.discountRate) || 0;
      item.totalPrice = Math.round(qty * price * (1 - discount / 100));
    }

    updated[index] = item;
    onChange(updated);
  };

  const totalItemsCost = items.reduce((acc, cur) => acc + (cur.totalPrice || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">물품 및 솔루션 / 라이선스</h3>
            <p className="text-xs text-slate-500">서버, 패키지SW, 클라우드 라이선스 등 납품 품목</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          품목 추가
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
          등록된 물품 및 라이선스 품목이 없습니다. (선택사항)
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold border-y border-slate-200">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3 w-32">구분</th>
                <th className="py-2.5 px-3 min-w-[140px]">품목명</th>
                <th className="py-2.5 px-3 min-w-[120px]">규격/사양</th>
                <th className="py-2.5 px-3 w-16 text-center">단위</th>
                <th className="py-2.5 px-3 w-20 text-right">수량</th>
                <th className="py-2.5 px-3 w-32 text-right">단가 (원)</th>
                <th className="py-2.5 px-3 w-20 text-right">할인율(%)</th>
                <th className="py-2.5 px-3 w-36 text-right">공급금액 (원)</th>
                <th className="py-2.5 px-3 w-10 text-center">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-center text-xs text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <select
                      value={item.category}
                      onChange={(e) => handleChange(idx, 'category', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {DEFAULT_ITEM_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleChange(idx, 'name', e.target.value)}
                      placeholder="품목명 입력"
                      className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.spec || ''}
                      onChange={(e) => handleChange(idx, 'spec', e.target.value)}
                      placeholder="규격 또는 버전"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleChange(idx, 'unit', e.target.value)}
                      className="w-full text-center px-1.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <FormattedNumberInput
                      value={item.quantity}
                      onChange={(val) => handleChange(idx, 'quantity', val)}
                      placeholder="1"
                      allowDecimal={false}
                      className="w-full text-right px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <FormattedNumberInput
                      value={item.unitPrice}
                      onChange={(val) => handleChange(idx, 'unitPrice', val)}
                      placeholder="0"
                      className="w-full text-right px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discountRate}
                      onChange={(e) => handleChange(idx, 'discountRate', parseFloat(e.target.value) || 0)}
                      className="w-full text-right px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-white"
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
              <tr className="bg-emerald-50/60 font-semibold text-slate-900 border-t border-emerald-100 text-xs">
                <td colSpan={8} className="py-3 px-4 text-left font-bold text-emerald-900">
                  물품 및 솔루션 공급가 합계
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm font-bold">
                  ₩{formatCurrency(totalItemsCost)}
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
