'use client';

import React from 'react';
import { EstimateType, CompanySupplierInfo, RateNoticeInfo } from '@/types/estimate';
import { numberToKoreanWon, formatCurrency } from '@/lib/calculator';
import { formatDate } from '@/lib/utils';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EstimatePdfViewProps {
  estimate: EstimateType;
  supplier: CompanySupplierInfo;
  rateNoticeInfo?: RateNoticeInfo;
}

export default function EstimatePdfView({ estimate, supplier, rateNoticeInfo }: EstimatePdfViewProps) {
  const clientCompany = estimate.project?.company;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header - Hide on Print */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/estimates`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {estimate.title} (v{estimate.version.toFixed(1)})
            </h2>
            <p className="text-xs text-slate-500">
              인쇄 시 표준 A4 견적서 서식으로 자동 최적화됩니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`/api/estimates/${estimate.id}/excel`}
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            엑셀(.xlsx) 다운로드
          </a>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            견적서 인쇄 / PDF 저장
          </button>
        </div>
      </div>

      {/* Printable Sheet (A4 Container) */}
      <div className="bg-white mx-auto p-8 md:p-12 rounded-xl border border-slate-300 shadow-md max-w-4xl text-slate-900 font-sans text-xs print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Title */}
        <div className="text-center pb-6 border-b-2 border-slate-900">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-widest text-slate-900">
            견 &nbsp; 적 &nbsp; 서
          </h1>
          <p className="text-xs text-slate-500 tracking-wider mt-1">ESTIMATE SHEET</p>
        </div>

        {/* Info Header: Client & Supplier Grid */}
        <div className="grid grid-cols-2 gap-4 py-6 border-b border-slate-200">
          {/* 공급받는 자 (고객사 및 프로젝트 담당자) */}
          <div className="border border-slate-300 rounded-md overflow-hidden flex flex-col justify-between">
            <div className="bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-300 text-slate-800 text-[13px] flex items-center justify-between">
              <span>공급받는 자 (귀하)</span>
              <span className="text-xs font-normal text-slate-500">
                {estimate.project?.clientManager ? `${estimate.project.clientManager} ${estimate.project.clientPosition || '담당'}` : (clientCompany?.contactPerson ? `${clientCompany.contactPerson} 귀하` : '귀하')}
              </span>
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-200 text-xs">
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 w-24 text-slate-600 font-medium">상 호 (고객사)</th>
                  <td className="py-1.5 px-3 font-semibold text-slate-900">{clientCompany?.name || '-'}</td>
                </tr>
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium">사업자등록번호</th>
                  <td className="py-1.5 px-3 font-mono">{clientCompany?.businessNumber || '-'}</td>
                </tr>
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium">프로젝트명</th>
                  <td className="py-1.5 px-3 font-medium text-blue-700">{estimate.project?.title || estimate.title}</td>
                </tr>
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium">담당부서/담당자</th>
                  <td className="py-1.5 px-3">
                    {estimate.project?.clientDept ? `[${estimate.project.clientDept}] ` : ''}
                    {estimate.project?.clientManager || clientCompany?.contactPerson || '-'} {estimate.project?.clientPosition || ''}
                  </td>
                </tr>
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium">전화 / 이메일</th>
                  <td className="py-1.5 px-3 text-[11px]">
                    {estimate.project?.clientPhone || clientCompany?.contactPhone || '-'} / {estimate.project?.clientEmail || clientCompany?.contactEmail || '-'}
                  </td>
                </tr>
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium">사업장 소재지</th>
                  <td className="py-1.5 px-3 text-[11px] leading-tight">{clientCompany?.address || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 공급자 (자사) */}
          <div className="border border-slate-300 rounded-md overflow-hidden relative flex flex-col justify-between">
            <div className="bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-300 text-slate-800 text-[13px]">
              공 급 자 (당사)
            </div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-200 text-xs">
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 w-24 text-slate-600 font-medium">등록번호</th>
                  <td className="py-1.5 px-3 font-mono font-semibold">{supplier.businessNumber}</td>
                </tr>
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium">상 호 (회사명)</th>
                  <td className="py-1.5 px-3 font-semibold">
                    {supplier.companyName}
                    <span className="ml-2 font-normal text-slate-500">(인)</span>
                  </td>
                </tr>
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium">대 표 자</th>
                  <td className="py-1.5 px-3">{supplier.ceoName}</td>
                </tr>
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium">사업장 소재지</th>
                  <td className="py-1.5 px-3 text-[11px] leading-tight">{supplier.address}</td>
                </tr>
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium">업태 / 종목</th>
                  <td className="py-1.5 px-3">{supplier.businessType} / {supplier.businessItem}</td>
                </tr>
                <tr>
                  <th className="py-1.5 px-3 bg-slate-50 text-slate-600 font-medium">전화 / 이메일</th>
                  <td className="py-1.5 px-3">{supplier.tel} / {supplier.email}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Date & Ref Info */}
        <div className="flex justify-between items-center py-3 text-xs text-slate-600 font-medium border-b border-slate-200">
          <div>견적번호: <span className="font-mono font-semibold text-slate-800">{estimate.estimateNumber} (v{estimate.version.toFixed(1)})</span></div>
          <div>견적일자: <span className="font-semibold text-slate-800">{formatDate(estimate.createdAt)}</span></div>
          <div>유효기간: <span className="font-semibold text-slate-800">{estimate.validUntil ? formatDate(estimate.validUntil) : '발행일로부터 30일'}</span></div>
        </div>

        {/* Grand Total Banner */}
        <div className="my-6 bg-slate-100 border-2 border-slate-800 p-4 text-center rounded">
          <div className="text-xs text-slate-600 font-semibold mb-1">
            아래와 같이 견적합니다.
          </div>
          <div className="text-lg md:text-xl font-extrabold text-blue-900 tracking-tight">
            합계금액: {numberToKoreanWon(estimate.grandTotal)}
          </div>
        </div>

        {/* Section 1: 견적 총괄표 */}
        <div className="mb-8">
          <h3 className="font-bold text-sm text-slate-900 mb-2 border-l-4 border-slate-800 pl-2">
            1. 견적 총괄표
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold text-center">
                <th className="border border-slate-300 py-2 px-3 w-12">No</th>
                <th className="border border-slate-300 py-2 px-3 w-40 text-left">구분</th>
                <th className="border border-slate-300 py-2 px-3 text-left">산출 근거 및 적요</th>
                <th className="border border-slate-300 py-2 px-3 w-24">적용 요율</th>
                <th className="border border-slate-300 py-2 px-3 w-40 text-right">금액 (원)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 py-2 px-3 text-center">1</td>
                <td className="border border-slate-300 py-2 px-3 font-semibold">직접인건비</td>
                <td className="border border-slate-300 py-2 px-3">SW개발 투입인력 ({estimate.labors?.length || 0}개 직무)</td>
                <td className="border border-slate-300 py-2 px-3 text-center">-</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono font-medium">₩{formatCurrency(estimate.totalLaborCost)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 py-2 px-3 text-center">2</td>
                <td className="border border-slate-300 py-2 px-3 font-semibold">제경비</td>
                <td className="border border-slate-300 py-2 px-3">일반관리 및 사무지원비 (직접인건비 기준)</td>
                <td className="border border-slate-300 py-2 px-3 text-center font-mono">{estimate.overheadRate}%</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono font-medium">₩{formatCurrency(estimate.totalOverheadCost)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 py-2 px-3 text-center">3</td>
                <td className="border border-slate-300 py-2 px-3 font-semibold">기술료</td>
                <td className="border border-slate-300 py-2 px-3">기술축적 및 이윤 보상 ((인건비+제경비) 기준)</td>
                <td className="border border-slate-300 py-2 px-3 text-center font-mono">{estimate.technicalRate}%</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono font-medium">₩{formatCurrency(estimate.totalTechCost)}</td>
              </tr>
              {estimate.profitRate > 0 && (
                <tr>
                  <td className="border border-slate-300 py-2 px-3 text-center">4</td>
                  <td className="border border-slate-300 py-2 px-3 font-semibold text-emerald-800">이윤</td>
                  <td className="border border-slate-300 py-2 px-3 text-emerald-800">용역 수행 영업 이윤 (개발원가의 25% 이내)</td>
                  <td className="border border-slate-300 py-2 px-3 text-center font-mono text-emerald-800">{estimate.profitRate}%</td>
                  <td className="border border-slate-300 py-2 px-3 text-right font-mono font-medium text-emerald-800">
                    ₩{formatCurrency(Math.round((estimate.totalLaborCost + estimate.totalOverheadCost + estimate.totalTechCost) * (estimate.profitRate / 100)))}
                  </td>
                </tr>
              )}
              <tr>
                <td className="border border-slate-300 py-2 px-3 text-center">{estimate.profitRate > 0 ? '5' : '4'}</td>
                <td className="border border-slate-300 py-2 px-3 font-semibold">직접경비</td>
                <td className="border border-slate-300 py-2 px-3">프로젝트 실비 항목 ({estimate.expenses?.length || 0}건)</td>
                <td className="border border-slate-300 py-2 px-3 text-center">-</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono font-medium">₩{formatCurrency(estimate.totalExpenseCost)}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 py-2 px-3 text-center">{estimate.profitRate > 0 ? '6' : '5'}</td>
                <td className="border border-slate-300 py-2 px-3 font-semibold">물품 및 솔루션</td>
                <td className="border border-slate-300 py-2 px-3">하드웨어/소프트웨어 패키지 ({estimate.items?.length || 0}건)</td>
                <td className="border border-slate-300 py-2 px-3 text-center">-</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono font-medium">₩{formatCurrency(estimate.totalItemsCost)}</td>
              </tr>
              {estimate.discountAmount > 0 && (
                <tr className="text-rose-700 bg-rose-50/50">
                  <td className="border border-slate-300 py-2 px-3 text-center">{estimate.profitRate > 0 ? '7' : '6'}</td>
                  <td className="border border-slate-300 py-2 px-3 font-semibold">특별 할인액</td>
                  <td className="border border-slate-300 py-2 px-3">프로젝트 프로모션 할인 차감</td>
                  <td className="border border-slate-300 py-2 px-3 text-center">-</td>
                  <td className="border border-slate-300 py-2 px-3 text-right font-mono font-semibold">- ₩{formatCurrency(estimate.discountAmount)}</td>
                </tr>
              )}
              <tr className="bg-slate-50 font-bold">
                <td colSpan={3} className="border border-slate-300 py-2.5 px-3 text-left">
                  총 공급가액 (Subtotal)
                </td>
                <td className="border border-slate-300 py-2.5 px-3 text-center">-</td>
                <td className="border border-slate-300 py-2.5 px-3 text-right font-mono text-slate-900">
                  ₩{formatCurrency(estimate.totalSupplyPrice)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="border border-slate-300 py-2 px-3 text-left text-slate-700 font-semibold">
                  부가가치세 (VAT)
                </td>
                <td className="border border-slate-300 py-2 px-3 text-center font-mono">{estimate.vatRate}%</td>
                <td className="border border-slate-300 py-2 px-3 text-right font-mono font-medium">
                  ₩{formatCurrency(estimate.totalVat)}
                </td>
              </tr>
              <tr className="bg-slate-200 font-extrabold text-[13px]">
                <td colSpan={3} className="border border-slate-400 py-3 px-3 text-left text-slate-900">
                  최종 견적 총액 (Grand Total)
                </td>
                <td className="border border-slate-400 py-3 px-3 text-center">-</td>
                <td className="border border-slate-400 py-3 px-3 text-right font-mono text-blue-950">
                  ₩{formatCurrency(estimate.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: SW개발 인건비 산출내역서 */}
        {estimate.labors && estimate.labors.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-sm text-slate-900 mb-2 border-l-4 border-slate-800 pl-2">
              2. SW 개발비 인건비 산출내역
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold text-center">
                  <th className="border border-slate-300 py-2 px-2 w-10">No</th>
                  <th className="border border-slate-300 py-2 px-3 text-left">담당 업무/역할</th>
                  <th className="border border-slate-300 py-2 px-3 w-28">기술 등급</th>
                  <th className="border border-slate-300 py-2 px-3 w-24 text-right">투입공수(M/M)</th>
                  <th className="border border-slate-300 py-2 px-3 w-32 text-right">월 기준단가(원)</th>
                  <th className="border border-slate-300 py-2 px-3 w-36 text-right">직접인건비(원)</th>
                </tr>
              </thead>
              <tbody>
                {estimate.labors.map((l, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 py-1.5 px-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="border border-slate-300 py-1.5 px-3 font-medium">{l.role}</td>
                    <td className="border border-slate-300 py-1.5 px-3 text-center">{l.grade}</td>
                    <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">{l.manMonths.toFixed(2)}</td>
                    <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">₩{formatCurrency(l.unitPrice)}</td>
                    <td className="border border-slate-300 py-1.5 px-3 text-right font-mono font-medium">₩{formatCurrency(l.totalPrice)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="border border-slate-300 py-2 px-3 text-left">합계 (Total)</td>
                  <td className="border border-slate-300 py-2 px-3 text-right font-mono text-indigo-700">
                    {estimate.labors.reduce((s, c) => s + c.manMonths, 0).toFixed(2)} M/M
                  </td>
                  <td className="border border-slate-300 py-2 px-3 text-center">-</td>
                  <td className="border border-slate-300 py-2 px-3 text-right font-mono text-indigo-900">
                    ₩{formatCurrency(estimate.totalLaborCost)}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
              ※ 직접인건비 산출 근거: {rateNoticeInfo?.noticeName || '한국소프트웨어산업협회(KOSA) SW기술자 평균임금'} 
              {rateNoticeInfo?.noticeNumber ? ` (${rateNoticeInfo.noticeNumber}` : ''}
              {rateNoticeInfo?.announcedDate ? `, 공표일: ${rateNoticeInfo.announcedDate}` : ''}
              {rateNoticeInfo?.effectivePeriod ? `, 적용기준: ${rateNoticeInfo.effectivePeriod}` : ''}
              {rateNoticeInfo?.workDaysPerMonth ? `, 월평균 ${rateNoticeInfo.workDaysPerMonth}일 기준)` : ')'}
            </div>
          </div>
        )}

        {/* Section 3: 물품/솔루션 내역서 */}
        {estimate.items && estimate.items.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-sm text-slate-900 mb-2 border-l-4 border-slate-800 pl-2">
              3. 물품 및 패키지 SW 내역서
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold text-center">
                  <th className="border border-slate-300 py-2 px-2 w-10">No</th>
                  <th className="border border-slate-300 py-2 px-3 w-28">구분</th>
                  <th className="border border-slate-300 py-2 px-3 text-left">품목명</th>
                  <th className="border border-slate-300 py-2 px-3 w-28">규격</th>
                  <th className="border border-slate-300 py-2 px-2 w-12">단위</th>
                  <th className="border border-slate-300 py-2 px-2 w-16 text-right">수량</th>
                  <th className="border border-slate-300 py-2 px-3 w-28 text-right">단가(원)</th>
                  <th className="border border-slate-300 py-2 px-2 w-16 text-right">할인율</th>
                  <th className="border border-slate-300 py-2 px-3 w-32 text-right">공급금액(원)</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 py-1.5 px-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="border border-slate-300 py-1.5 px-3 text-center">{item.category}</td>
                    <td className="border border-slate-300 py-1.5 px-3 font-medium">{item.name}</td>
                    <td className="border border-slate-300 py-1.5 px-3 text-slate-600">{item.spec || '-'}</td>
                    <td className="border border-slate-300 py-1.5 px-2 text-center">{item.unit}</td>
                    <td className="border border-slate-300 py-1.5 px-2 text-right font-mono">{item.quantity}</td>
                    <td className="border border-slate-300 py-1.5 px-3 text-right font-mono">₩{formatCurrency(item.unitPrice)}</td>
                    <td className="border border-slate-300 py-1.5 px-2 text-right font-mono">{item.discountRate}%</td>
                    <td className="border border-slate-300 py-1.5 px-3 text-right font-mono font-medium">₩{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={8} className="border border-slate-300 py-2 px-3 text-left">물품 공급가 합계</td>
                  <td className="border border-slate-300 py-2 px-3 text-right font-mono text-emerald-900">
                    ₩{formatCurrency(estimate.totalItemsCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Section 4: 직접경비 내역서 */}
        {estimate.expenses && estimate.expenses.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-sm text-slate-900 mb-2 border-l-4 border-slate-800 pl-2">
              4. 직접경비 산출내역
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold text-center">
                  <th className="border border-slate-300 py-2 px-2 w-10">No</th>
                  <th className="border border-slate-300 py-2 px-3 w-40 text-left">경비 구분</th>
                  <th className="border border-slate-300 py-2 px-3 text-left">산출 내역 및 적요</th>
                  <th className="border border-slate-300 py-2 px-3 w-40 text-right">금액(원)</th>
                </tr>
              </thead>
              <tbody>
                {estimate.expenses.map((exp, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 py-1.5 px-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="border border-slate-300 py-1.5 px-3 font-medium">{exp.category}</td>
                    <td className="border border-slate-300 py-1.5 px-3 text-slate-700">{exp.description}</td>
                    <td className="border border-slate-300 py-1.5 px-3 text-right font-mono font-medium">₩{formatCurrency(exp.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="border border-slate-300 py-2 px-3 text-left">직접경비 합계</td>
                  <td className="border border-slate-300 py-2 px-3 text-right font-mono text-amber-900">
                    ₩{formatCurrency(estimate.totalExpenseCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Section 5: 특이사항 및 결제조건 */}
        <div className="border border-slate-300 rounded-md p-4 bg-slate-50/50">
          <h4 className="font-bold text-xs text-slate-900 mb-2">특이사항 및 결제조건 (Terms & Notes)</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs leading-relaxed">
            {estimate.paymentTerms && (
              <li><span className="font-semibold">대금지급조건:</span> {estimate.paymentTerms}</li>
            )}
            {estimate.validUntil && (
              <li><span className="font-semibold">견적 유효기간:</span> {formatDate(estimate.validUntil)}까지</li>
            )}
            <li><span className="font-semibold">납품 및 개발 범위:</span> 협의된 요구사항 정의서 및 산출내역서 기준</li>
            {estimate.remarks && (
              <li className="whitespace-pre-wrap"><span className="font-semibold">비고사항:</span> {estimate.remarks}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
