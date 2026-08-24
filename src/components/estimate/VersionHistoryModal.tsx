'use client';

import React, { useState } from 'react';
import { GitBranch, History, Clock, X, Check } from 'lucide-react';
import { EstimateType, EstimateHistoryType } from '@/types/estimate';
import { formatDateTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface VersionHistoryModalProps {
  estimate: EstimateType;
  isOpen: boolean;
  onClose: () => void;
  onVersionCreated?: (newEstimateId: string) => void;
}

export default function VersionHistoryModal({
  estimate,
  isOpen,
  onClose,
  onVersionCreated,
}: VersionHistoryModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'branch' | 'history'>('branch');
  const [versionType, setVersionType] = useState<'minor' | 'major'>('minor');
  const [changeReason, setChangeReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentVer = estimate.version;
  const nextMinorVer = (Math.round((currentVer + 0.1) * 10) / 10).toFixed(1);
  const nextMajorVer = (Math.floor(currentVer) + 1.0).toFixed(1);

  const handleDuplicate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/estimates/${estimate.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionType,
          changeReason: changeReason || (versionType === 'major' ? '대규모 스코프 변경' : '고객사 단가 및 공수 협의'),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '새 버전 생성 실패');
      }

      const created = await res.json();
      onClose();
      if (onVersionCreated) {
        onVersionCreated(created.id);
      } else {
        router.push(`/estimates/${created.id}/edit`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">버전 관리 및 이력</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('branch')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'branch'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            새 버전 생성 (복제 분기)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            변경 이력 타임라인 ({estimate.histories?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {activeTab === 'branch' ? (
            <form onSubmit={handleDuplicate} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  생성할 버전 유형 선택
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVersionType('minor')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      versionType === 'minor'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">마이너 버전 (+0.1)</span>
                      <span className="text-xs font-mono font-bold text-blue-600">v{nextMinorVer}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      고객사 네고, 단가 소폭 조정, 할인 등 일반적 변경
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVersionType('major')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      versionType === 'major'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">메이저 버전 (+1.0)</span>
                      <span className="text-xs font-mono font-bold text-indigo-600">v{nextMajorVer}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      개발 범위(Scope) 대폭 확대, 기능 전면 개편
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  버전 변경 사유 / 메모
                </label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="예: 고객사 미팅 후 초급개발자 1명 추가 및 5% 할인 반영"
                  rows={3}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800">
                💡 기존 견적서(v{currentVer.toFixed(1)})는 그대로 보존되며, 모든 품목과 인건비가 복사된 새로운 견적서가 생성됩니다.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <GitBranch className="w-4 h-4" />
                  {loading ? '생성 중...' : `v${versionType === 'minor' ? nextMinorVer : nextMajorVer} 버전으로 분기 생성`}
                </button>
              </div>
            </form>
          ) : (
            <div className="max-h-80 overflow-y-auto pr-1 space-y-3">
              {(!estimate.histories || estimate.histories.length === 0) ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  기록된 변경 이력이 없습니다.
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                  {estimate.histories.map((h, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{h.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDateTime(h.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{h.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
