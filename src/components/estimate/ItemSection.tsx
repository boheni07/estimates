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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          품목 추가
        </button>
      </div>

      {/* Items List (2-Line Spacious Card Rows) */}
      {items.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
          등록된 물품 및 라이선스 품목이 없습니다. (필요 시 [품목 추가] 클릭)
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 hover:border-emerald-300 rounded-xl transition-all shadow-xs space-y-3"
            >
              {/* Line 1: No + 구분 + 품목명 + 규격/사양 + 삭제버튼 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* No Badge */}
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <span className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 text-slate-600 font-mono text-xs font-bold rounded-lg shadow-2xs flex-shrink-0">
                    {idx + 1}
                  </span>
                  {/* Category Dropdown */}
                  <select
                    value={item.category}
                    onChange={(e) => handleChange(idx, 'category', e.target.value)}
                    className="w-36 sm:w-40 px-2.5 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700 flex-shrink-0"
                  >
                    {DEFAULT_ITEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Name (Wide) */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleChange(idx, 'name', e.target.value)}
                    placeholder="품목명 입력 (예: DBMS Enterprise Edition, 보안 솔루션 라이선스)"
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-800"
                  />
                </div>

                {/* Spec / Version (Wide) */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={item.spec || ''}
                    onChange={(e) => handleChange(idx, 'spec', e.target.value)}
                    placeholder="규격 / 사양 / 버전 (예: v19c, 32 Core License)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-600"
                  />
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-end sm:self-center flex-shrink-0"
                  title="품목 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Line 2: 단위 + 수량 + 단가 + 할인율 + 계산된 공급금액 */}
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-12 gap-2.5 items-center">
                {/* Unit */}
                <div className="col-span-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex-shrink-0">단위:</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleChange(idx, 'unit', e.target.value)}
                      placeholder="EA"
                      className="w-full text-center px-2 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex-shrink-0">수량:</label>
                    <FormattedNumberInput
                      value={item.quantity}
                      onChange={(val) => handleChange(idx, 'quantity', val)}
                      placeholder="1"
                      allowDecimal={false}
                      className="w-full text-right px-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono bg-white"
                    />
                  </div>
                </div>

                {/* Unit Price */}
                <div className="col-span-1 sm:col-span-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex-shrink-0">단가:</label>
                    <div className="relative w-full">
                      <FormattedNumberInput
                        value={item.unitPrice}
                        onChange={(val) => handleChange(idx, 'unitPrice', val)}
                        placeholder="0"
                        className="w-full text-right pr-6 pl-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono bg-white"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium pointer-events-none">원</span>
                    </div>
                  </div>
                </div>

                {/* Discount Rate */}
                <div className="col-span-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 flex-shrink-0">할인:</label>
                    <div className="relative w-full">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountRate}
                        onChange={(e) => handleChange(idx, 'discountRate', parseFloat(e.target.value) || 0)}
                        className="w-full text-right pr-5 pl-2 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono bg-white"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-medium pointer-events-none">%</span>
                    </div>
                  </div>
                </div>

                {/* Calculated Total Price */}
                <div className="col-span-2 sm:col-span-3 bg-white px-3 py-1.5 rounded-lg border border-emerald-200/80 flex items-center justify-between sm:justify-end gap-2">
                  <span className="text-[11px] font-bold text-emerald-800 flex-shrink-0">공급금액:</span>
                  <span className="font-mono text-xs font-extrabold text-emerald-700">
                    ₩{formatCurrency(item.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Subtotal Banner */}
          <div className="flex items-center justify-between bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80">
            <span className="text-xs font-bold text-emerald-900">
              물품 및 솔루션 공급가 합계 ({items.length}개 품목)
            </span>
            <span className="font-mono text-base font-extrabold text-emerald-700">
              ₩{formatCurrency(totalItemsCost)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
