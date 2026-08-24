'use client';

import React, { useState, useEffect } from 'react';
import { EstimateType, CompanySupplierInfo, RateNoticeInfo } from '@/types/estimate';
import EstimatePdfView from '@/components/estimate/EstimatePdfView';
import { DEFAULT_SUPPLIER_INFO, DEFAULT_RATE_NOTICE_INFO } from '@/lib/defaultRates';
import Link from 'next/link';

export default function EstimatePreviewPage({ params }: { params: { id: string } }) {
  const [estimate, setEstimate] = useState<EstimateType | null>(null);
  const [supplier, setSupplier] = useState<CompanySupplierInfo>(DEFAULT_SUPPLIER_INFO);
  const [rateNoticeInfo, setRateNoticeInfo] = useState<RateNoticeInfo>(DEFAULT_RATE_NOTICE_INFO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/estimates/${params.id}`).then((res) => res.json()),
      fetch(`/api/settings`).then((res) => res.json()),
    ])
      .then(([estData, settingsData]) => {
        setEstimate(estData);
        if (settingsData?.supplierInfo) {
          setSupplier(settingsData.supplierInfo);
        }
        if (settingsData?.rateNoticeInfo) {
          setRateNoticeInfo(settingsData.rateNoticeInfo);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

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

  return <EstimatePdfView estimate={estimate} supplier={supplier} rateNoticeInfo={rateNoticeInfo} />;
}
