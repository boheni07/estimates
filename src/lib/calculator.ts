import { LaborItem, ProductItem, ExpenseItem } from '@/types/estimate';

export interface CalculationRates {
  overheadRate: number; // % (e.g. 110)
  technicalRate: number; // % (e.g. 20)
  profitRate?: number; // % (e.g. 10)
  discountAmount?: number; // 원
  vatRate?: number; // % (e.g. 10)
}

export interface CalculationResult {
  totalLaborCost: number;       // (1) 직접인건비
  totalOverheadCost: number;    // (2) 제경비 = 직접인건비 * overheadRate%
  totalTechCost: number;        // (3) 기술료 = (직접인건비 + 제경비) * technicalRate%
  totalProfitCost: number;      // (4) 이윤 = (직접인건비 + 제경비 + 기술료) * profitRate%
  totalExpenseCost: number;     // (5) 직접경비
  totalDevService: number;      // (6) SW개발용역 소계 = (1) + (2) + (3) + (4) + (5)
  totalItemsCost: number;       // (7) 물품/라이선스 소계
  rawSupplyPrice: number;       // (8) 할인 전 공급가 = (6) + (7)
  discountAmount: number;       // (9) 특별할인
  totalSupplyPrice: number;     // (10) 총 공급가액 = (8) - (9)
  totalVat: number;             // (11) 부가가치세 = (10) * vatRate% (1원 단위 절사)
  grandTotal: number;           // (12) 최종 합계금액 = (10) + (11)
}

/**
 * 견적 금액 정밀 계산 엔진 (제경비, 기술료, 이윤, 부가가치세)
 */
export function calculateEstimate(
  labors: LaborItem[] = [],
  items: ProductItem[] = [],
  expenses: ExpenseItem[] = [],
  rates: CalculationRates
): CalculationResult {
  // 1. 직접인건비 계산
  const totalLaborCost = labors.reduce((acc, cur) => {
    const cost = Math.round((cur.manMonths || 0) * (cur.unitPrice || 0));
    return acc + cost;
  }, 0);

  // 2. 제경비 계산 (직접인건비 * 제경비율)
  const overheadRate = Number(rates.overheadRate) || 0;
  const totalOverheadCost = Math.round(totalLaborCost * (overheadRate / 100));

  // 3. 기술료 계산 ((직접인건비 + 제경비) * 기술료율)
  const technicalRate = Number(rates.technicalRate) || 0;
  const totalTechCost = Math.round((totalLaborCost + totalOverheadCost) * (technicalRate / 100));

  // 4. 이윤 계산 ((직접인건비 + 제경비 + 기술료) * 이윤율)
  const profitRate = Number(rates.profitRate) || 0;
  const totalProfitCost = Math.round((totalLaborCost + totalOverheadCost + totalTechCost) * (profitRate / 100));

  // 5. 직접경비 합산
  const totalExpenseCost = expenses.reduce((acc, cur) => {
    return acc + Math.round(cur.amount || 0);
  }, 0);

  // 6. SW개발용역 소계 (직접인건비 + 제경비 + 기술료 + 이윤 + 직접경비)
  const totalDevService = totalLaborCost + totalOverheadCost + totalTechCost + totalProfitCost + totalExpenseCost;

  // 7. 물품 및 패키지 합산
  const totalItemsCost = items.reduce((acc, cur) => {
    const qty = cur.quantity || 0;
    const price = cur.unitPrice || 0;
    const discount = cur.discountRate || 0;
    const lineTotal = Math.round(qty * price * (1 - discount / 100));
    return acc + lineTotal;
  }, 0);

  // 8. 할인 전 공급가액
  const rawSupplyPrice = totalDevService + totalItemsCost;

  // 9. 할인 적용 후 최종 공급가액
  const discountAmount = Math.max(0, Math.round(Number(rates.discountAmount) || 0));
  const totalSupplyPrice = Math.max(0, rawSupplyPrice - discountAmount);

  // 10. 부가가치세 (1원 단위 절사)
  const vatRate = rates.vatRate !== undefined ? Number(rates.vatRate) : 10;
  const totalVat = Math.floor(totalSupplyPrice * (vatRate / 100));

  // 11. 최종 총합
  const grandTotal = totalSupplyPrice + totalVat;

  return {
    totalLaborCost,
    totalOverheadCost,
    totalTechCost,
    totalProfitCost,
    totalExpenseCost,
    totalDevService,
    totalItemsCost,
    rawSupplyPrice,
    discountAmount,
    totalSupplyPrice,
    totalVat,
    grandTotal,
  };
}

/**
 * 숫자를 한국어 금액 읽기로 변환 (예: 12,345,000 -> 일천이백삼십사만오천 원정)
 */
export function numberToKoreanWon(amount: number): string {
  if (!amount || amount === 0) return '영 원정';
  
  const units = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const smallUnits = ['', '십', '백', '천'];
  const bigUnits = ['', '만', '억', '조', '경'];

  let numStr = Math.floor(amount).toString();
  let result = '';
  const length = numStr.length;
  const chunkCount = Math.ceil(length / 4);

  for (let i = 0; i < chunkCount; i++) {
    const start = Math.max(0, length - (i + 1) * 4);
    const end = length - i * 4;
    const chunk = numStr.substring(start, end);
    let chunkResult = '';

    for (let j = 0; j < chunk.length; j++) {
      const digit = parseInt(chunk[j]);
      const unitIndex = chunk.length - 1 - j;
      if (digit > 0) {
        if (digit === 1 && unitIndex > 0) {
          chunkResult += smallUnits[unitIndex];
        } else {
          chunkResult += units[digit] + smallUnits[unitIndex];
        }
      }
    }

    if (chunkResult.length > 0) {
      result = chunkResult + bigUnits[i] + ' ' + result;
    }
  }

  return '일금 ' + result.trim() + '원정 (₩' + amount.toLocaleString('ko-KR') + ')';
}

/**
 * 콤마가 포함된 통화 포맷 문자열 반환
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  return Math.round(amount).toLocaleString('ko-KR');
}
