import ExcelJS from 'exceljs';
import { EstimateType, CompanySupplierInfo } from '@/types/estimate';
import { numberToKoreanWon, formatCurrency } from './calculator';

export async function generateEstimateExcel(
  estimate: EstimateType,
  supplier: CompanySupplierInfo
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = supplier.companyName || '견적관리시스템';
  workbook.created = new Date();

  // -------------------------------------------------------------
  // Sheet 1: 견적서 총괄 (Cover & Summary)
  // -------------------------------------------------------------
  const summarySheet = workbook.addWorksheet('견적서 총괄', {
    views: [{ showGridLines: true }],
  });

  // 열 너비 설정
  summarySheet.columns = [
    { width: 14 },
    { width: 22 },
    { width: 16 },
    { width: 16 },
    { width: 18 },
    { width: 18 },
  ];

  // 타이틀
  summarySheet.mergeCells('A1:F2');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = '견  적  서 (ESTIMATE)';
  titleCell.font = { name: '맑은 고딕', size: 18, bold: true, color: { argb: 'FF1E293B' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };

  // 견적 번호 & 발행일
  summarySheet.getCell('A4').value = '견적번호:';
  summarySheet.getCell('B4').value = `${estimate.estimateNumber} (v${estimate.version.toFixed(1)})`;
  summarySheet.getCell('E4').value = '발행일자:';
  summarySheet.getCell('F4').value = new Date(estimate.createdAt).toISOString().split('T')[0];

  summarySheet.getCell('A5').value = '프로젝트:';
  summarySheet.getCell('B5').value = estimate.project?.title || estimate.title;
  summarySheet.getCell('E5').value = '유효기간:';
  summarySheet.getCell('F5').value = estimate.validUntil ? new Date(estimate.validUntil).toISOString().split('T')[0] : '발행일로부터 30일';

  ['A4', 'E4', 'A5', 'E5'].forEach(key => {
    summarySheet.getCell(key).font = { name: '맑은 고딕', bold: true, color: { argb: 'FF475569' } };
  });

  // 공급받는자 / 공급자 영역 구분
  summarySheet.mergeCells('A7:C7');
  summarySheet.getCell('A7').value = '공급받는 자 (고객사)';
  summarySheet.getCell('A7').font = { name: '맑은 고딕', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('A7').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  summarySheet.getCell('A7').alignment = { horizontal: 'center' };

  summarySheet.mergeCells('D7:F7');
  summarySheet.getCell('D7').value = '공 급 자';
  summarySheet.getCell('D7').font = { name: '맑은 고딕', bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  summarySheet.getCell('D7').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  summarySheet.getCell('D7').alignment = { horizontal: 'center' };

  // 공급받는자 정보
  const clientCompany = estimate.project?.company;
  const projectManager = estimate.project?.clientManager 
    ? `${estimate.project.clientDept ? `[${estimate.project.clientDept}] ` : ''}${estimate.project.clientManager} ${estimate.project.clientPosition || '담당'}`
    : (clientCompany?.contactPerson || '-');
  const projectPhoneEmail = `${estimate.project?.clientPhone || clientCompany?.contactPhone || '-'} / ${estimate.project?.clientEmail || clientCompany?.contactEmail || '-'}`;

  summarySheet.getCell('A8').value = '상 호';
  summarySheet.mergeCells('B8:C8');
  summarySheet.getCell('B8').value = clientCompany?.name || '-';

  summarySheet.getCell('A9').value = '사업자번호';
  summarySheet.mergeCells('B9:C9');
  summarySheet.getCell('B9').value = clientCompany?.businessNumber || '-';

  summarySheet.getCell('A10').value = '프로젝트';
  summarySheet.mergeCells('B10:C10');
  summarySheet.getCell('B10').value = estimate.project?.title || estimate.title;

  summarySheet.getCell('A11').value = '담당자/연락처';
  summarySheet.mergeCells('B11:C11');
  summarySheet.getCell('B11').value = `${projectManager} (${projectPhoneEmail})`;

  // 공급자 정보
  summarySheet.getCell('D8').value = '상 호';
  summarySheet.mergeCells('E8:F8');
  summarySheet.getCell('E8').value = supplier.companyName;

  summarySheet.getCell('D9').value = '사업자번호';
  summarySheet.mergeCells('E9:F9');
  summarySheet.getCell('E9').value = supplier.businessNumber;

  summarySheet.getCell('D10').value = '대 표 자';
  summarySheet.mergeCells('E10:F10');
  summarySheet.getCell('E10').value = supplier.ceoName;

  summarySheet.getCell('D11').value = '담당/연락처';
  summarySheet.mergeCells('E11:F11');
  summarySheet.getCell('E11').value = `${supplier.tel} / ${supplier.email}`;

  // 견적 총액 배너
  summarySheet.mergeCells('A13:F14');
  const totalBanner = summarySheet.getCell('A13');
  totalBanner.value = `견적 총액: ${numberToKoreanWon(estimate.grandTotal)}`;
  totalBanner.font = { name: '맑은 고딕', size: 13, bold: true, color: { argb: 'FF1E3A8A' } };
  totalBanner.alignment = { vertical: 'middle', horizontal: 'center' };
  totalBanner.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDBEAFE' },
  };

  // 견적 집계 요약 테이블
  summarySheet.getCell('A16').value = '구분';
  summarySheet.mergeCells('B16:C16');
  summarySheet.getCell('B16').value = '내역 및 산출근거';
  summarySheet.getCell('D16').value = '요율/비율';
  summarySheet.mergeCells('E16:F16');
  summarySheet.getCell('E16').value = '금액 (원)';

  ['A16', 'B16', 'D16', 'E16'].forEach(key => {
    const c = summarySheet.getCell(key);
    c.font = { name: '맑은 고딕', bold: true, color: { argb: 'FF334155' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    c.alignment = { horizontal: 'center' };
  });

  const totalProfit = estimate.profitRate > 0 
    ? Math.round((estimate.totalLaborCost + estimate.totalOverheadCost + estimate.totalTechCost) * (estimate.profitRate / 100))
    : 0;

  const summaryRows = [
    { cat: '1. 직접인건비', desc: `SW개발 투입인력 ${estimate.labors?.length || 0}개 직무`, rate: '-', amount: estimate.totalLaborCost },
    { cat: '2. 제경비', desc: '일반관리비 및 사무지원비', rate: `${estimate.overheadRate}%`, amount: estimate.totalOverheadCost },
    { cat: '3. 기술료', desc: '기술개발 및 연구축적비용', rate: `${estimate.technicalRate}%`, amount: estimate.totalTechCost },
    { cat: '4. 이윤', desc: '용역 수행 영업 이윤 (개발원가의 25% 이내)', rate: `${estimate.profitRate || 0}%`, amount: totalProfit },
    { cat: '5. 직접경비', desc: `실비 항목 ${estimate.expenses?.length || 0}건`, rate: '-', amount: estimate.totalExpenseCost },
    { cat: '6. 물품/솔루션', desc: `하드웨어/소프트웨어 ${estimate.items?.length || 0}건`, rate: '-', amount: estimate.totalItemsCost },
    { cat: '7. 특별할인', desc: '프로젝트 프로모션 할인', rate: '-', amount: -estimate.discountAmount },
    { cat: '총 공급가액', desc: '소계 (1+2+3+4+5+6-7)', rate: '-', amount: estimate.totalSupplyPrice, isBold: true },
    { cat: '부가가치세(VAT)', desc: '공급가액의 10%', rate: `${estimate.vatRate}%`, amount: estimate.totalVat },
    { cat: '최종 견적합계', desc: '공급가액 + 부가가치세', rate: '-', amount: estimate.grandTotal, isGrand: true },
  ];

  let rIdx = 17;
  summaryRows.forEach(row => {
    summarySheet.getCell(`A${rIdx}`).value = row.cat;
    summarySheet.mergeCells(`B${rIdx}:C${rIdx}`);
    summarySheet.getCell(`B${rIdx}`).value = row.desc;
    summarySheet.getCell(`D${rIdx}`).value = row.rate;
    summarySheet.getCell(`D${rIdx}`).alignment = { horizontal: 'center' };
    
    summarySheet.mergeCells(`E${rIdx}:F${rIdx}`);
    const amtCell = summarySheet.getCell(`E${rIdx}`);
    amtCell.value = row.amount;
    amtCell.numFmt = '#,##0';
    amtCell.alignment = { horizontal: 'right' };

    if (row.isBold || row.isGrand) {
      summarySheet.getRow(rIdx).font = { name: '맑은 고딕', bold: true };
    }
    if (row.isGrand) {
      summarySheet.getRow(rIdx).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFF6FF' },
      };
    }
    rIdx++;
  });

  // 비고란
  rIdx++;
  summarySheet.getCell(`A${rIdx}`).value = '특이사항 / 결제조건:';
  summarySheet.getCell(`A${rIdx}`).font = { name: '맑은 고딕', bold: true };
  rIdx++;
  summarySheet.mergeCells(`A${rIdx}:F${rIdx + 2}`);
  const remarkCell = summarySheet.getCell(`A${rIdx}`);
  remarkCell.value = `${estimate.paymentTerms ? `[결제조건] ${estimate.paymentTerms}\n` : ''}${estimate.remarks || '특이사항 없음'}`;
  remarkCell.alignment = { vertical: 'top', wrapText: true };

  // -------------------------------------------------------------
  // Sheet 2: SW 인건비 산출내역
  // -------------------------------------------------------------
  const laborSheet = workbook.addWorksheet('SW 인건비 산출내역', {
    views: [{ showGridLines: true }],
  });
  laborSheet.columns = [
    { header: 'No', key: 'no', width: 8 },
    { header: '담당 역할/직무', key: 'role', width: 25 },
    { header: '기술 등급', key: 'grade', width: 16 },
    { header: '투입공수(M/M)', key: 'mm', width: 16 },
    { header: '기준 월단가(원)', key: 'unitPrice', width: 18 },
    { header: '직접인건비 합계(원)', key: 'total', width: 22 },
  ];
  laborSheet.getRow(1).font = { name: '맑은 고딕', bold: true };
  laborSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

  (estimate.labors || []).forEach((l, idx) => {
    const row = laborSheet.addRow({
      no: idx + 1,
      role: l.role,
      grade: l.grade,
      mm: l.manMonths,
      unitPrice: l.unitPrice,
      total: l.totalPrice,
    });
    row.getCell('no').alignment = { horizontal: 'center' };
    row.getCell('grade').alignment = { horizontal: 'center' };
    row.getCell('mm').numFmt = '0.00';
    row.getCell('unitPrice').numFmt = '#,##0';
    row.getCell('total').numFmt = '#,##0';
  });

  // 인건비 합계 행
  const laborTotalRow = laborSheet.addRow({
    no: '',
    role: '합계 (Total)',
    grade: '',
    mm: (estimate.labors || []).reduce((s, c) => s + c.manMonths, 0),
    unitPrice: '',
    total: estimate.totalLaborCost,
  });
  laborTotalRow.font = { name: '맑은 고딕', bold: true };
  laborTotalRow.getCell('mm').numFmt = '0.00';
  laborTotalRow.getCell('total').numFmt = '#,##0';

  // -------------------------------------------------------------
  // Sheet 3: 물품 및 라이선스 내역
  // -------------------------------------------------------------
  if (estimate.items && estimate.items.length > 0) {
    const itemSheet = workbook.addWorksheet('물품 및 라이선스', {
      views: [{ showGridLines: true }],
    });
    itemSheet.columns = [
      { header: 'No', key: 'no', width: 8 },
      { header: '구분', key: 'cat', width: 14 },
      { header: '품목명', key: 'name', width: 28 },
      { header: '규격/사양', key: 'spec', width: 22 },
      { header: '단위', key: 'unit', width: 10 },
      { header: '수량', key: 'qty', width: 10 },
      { header: '단가(원)', key: 'price', width: 16 },
      { header: '할인율(%)', key: 'discount', width: 12 },
      { header: '공급금액(원)', key: 'total', width: 20 },
    ];
    itemSheet.getRow(1).font = { name: '맑은 고딕', bold: true };
    itemSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

    estimate.items.forEach((item, idx) => {
      const row = itemSheet.addRow({
        no: idx + 1,
        cat: item.category,
        name: item.name,
        spec: item.spec || '-',
        unit: item.unit,
        qty: item.quantity,
        price: item.unitPrice,
        discount: `${item.discountRate}%`,
        total: item.totalPrice,
      });
      row.getCell('no').alignment = { horizontal: 'center' };
      row.getCell('cat').alignment = { horizontal: 'center' };
      row.getCell('unit').alignment = { horizontal: 'center' };
      row.getCell('discount').alignment = { horizontal: 'center' };
      row.getCell('qty').numFmt = '#,##0';
      row.getCell('price').numFmt = '#,##0';
      row.getCell('total').numFmt = '#,##0';
    });

    const itemTotalRow = itemSheet.addRow({
      no: '',
      cat: '',
      name: '물품 공급가 합계',
      spec: '',
      unit: '',
      qty: '',
      price: '',
      discount: '',
      total: estimate.totalItemsCost,
    });
    itemTotalRow.font = { name: '맑은 고딕', bold: true };
    itemTotalRow.getCell('total').numFmt = '#,##0';
  }

  // -------------------------------------------------------------
  // Sheet 4: 직접경비 내역
  // -------------------------------------------------------------
  if (estimate.expenses && estimate.expenses.length > 0) {
    const expSheet = workbook.addWorksheet('직접경비 내역', {
      views: [{ showGridLines: true }],
    });
    expSheet.columns = [
      { header: 'No', key: 'no', width: 8 },
      { header: '경비 구분', key: 'cat', width: 20 },
      { header: '산출 내역 및 적요', key: 'desc', width: 35 },
      { header: '금액(원)', key: 'amount', width: 20 },
    ];
    expSheet.getRow(1).font = { name: '맑은 고딕', bold: true };
    expSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

    estimate.expenses.forEach((exp, idx) => {
      const row = expSheet.addRow({
        no: idx + 1,
        cat: exp.category,
        desc: exp.description,
        amount: exp.amount,
      });
      row.getCell('no').alignment = { horizontal: 'center' };
      row.getCell('amount').numFmt = '#,##0';
    });

    const expTotalRow = expSheet.addRow({
      no: '',
      cat: '직접경비 합계',
      desc: '',
      amount: estimate.totalExpenseCost,
    });
    expTotalRow.font = { name: '맑은 고딕', bold: true };
    expTotalRow.getCell('amount').numFmt = '#,##0';
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
