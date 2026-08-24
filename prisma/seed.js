const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial master data...');

  // 1. KOSA 표준 노임단가 설정
  const standardRates = [
    { grade: '총괄관리자(PM)', monthlyRate: 11500000, dailyRate: 552000, hourlyRate: 69000, description: '프로젝트 총괄 디렉팅 및 PM, 아키텍트' },
    { grade: '특급기술자', monthlyRate: 9850000, dailyRate: 472800, hourlyRate: 59100, description: '핵심 아키텍처 설계, 수석 엔지니어, 데이터 엔지니어링' },
    { grade: '고급기술자', monthlyRate: 7980000, dailyRate: 383100, hourlyRate: 47880, description: '핵심 백엔드/프론트엔드 리드 개발, 보안 및 시스템 구축' },
    { grade: '중급기술자', monthlyRate: 6250000, dailyRate: 300000, hourlyRate: 37500, description: '풀스택 기능 개발, API 연동, UI 컴포넌트 개발' },
    { grade: '초급기술자', monthlyRate: 4850000, dailyRate: 232800, hourlyRate: 29100, description: '단위 기능 개발, 테스트 및 QA 지원, 퍼블리싱' },
  ];

  await prisma.masterSetting.upsert({
    where: { key: 'STANDARD_RATES' },
    update: { value: JSON.stringify(standardRates) },
    create: { key: 'STANDARD_RATES', value: JSON.stringify(standardRates), description: 'KOSA 표준 노임단가' },
  });

  // 2. KOSA 노임단가 공고 정보 메타데이터
  const rateNoticeInfo = {
    noticeName: '2024년 적용 SW기술자 평균임금 공표 (SW엔지니어링 노임단가)',
    noticeNumber: '한국소프트웨어산업협회 공고 제2023-01호',
    announcedDate: '2023-12-15',
    effectivePeriod: '2024년 1월 1일 ~ 차기 공표일까지',
    surveyPeriod: '2023년 5월 ~ 6월 실적 기준',
    approvalNumber: '통계청 국가승인통계 제375001호',
    workDaysPerMonth: 20.83,
  };

  await prisma.masterSetting.upsert({
    where: { key: 'RATE_NOTICE_INFO' },
    update: { value: JSON.stringify(rateNoticeInfo) },
    create: { key: 'RATE_NOTICE_INFO', value: JSON.stringify(rateNoticeInfo), description: 'SW기술자 노임단가 공고 메타데이터' },
  });

  // 3. 4대 기본 견적 요율 설정 (제경비 110%, 기술료 20%, 이윤 25%, VAT 10%)
  const defaultRates = {
    overheadRate: 110.0,
    technicalRate: 20.0,
    profitRate: 25.0,
    vatRate: 10.0,
  };

  await prisma.masterSetting.upsert({
    where: { key: 'DEFAULT_RATES' },
    update: { value: JSON.stringify(defaultRates) },
    create: { key: 'DEFAULT_RATES', value: JSON.stringify(defaultRates), description: '기본 견적 4대 요율' },
  });

  // 4. 자사 공급자 정보 설정
  const supplierInfo = {
    companyName: '(주)안티그래비티소프트웨어',
    businessNumber: '123-86-45678',
    ceoName: '이소프트',
    address: '서울특별시 강남구 테헤란로 427 위워크타워 12층',
    businessType: '서비스, 정보통신업',
    businessItem: '소프트웨어 개발 및 공급, 인공지능 솔루션',
    tel: '02-555-7890',
    email: 'estimate@antigravity.co.kr',
    fax: '02-555-7891',
  };

  await prisma.masterSetting.upsert({
    where: { key: 'SUPPLIER_INFO' },
    update: { value: JSON.stringify(supplierInfo) },
    create: { key: 'SUPPLIER_INFO', value: JSON.stringify(supplierInfo), description: '자사 공급자 정보' },
  });

  // 기존에 회사가 이미 있으면 샘플 생성 스킵
  const existingCompanyCount = await prisma.company.count();
  if (existingCompanyCount > 0) {
    console.log('Master settings updated and existing companies preserved.');
    return;
  }

  // 5. 샘플 고객사 생성
  const company1 = await prisma.company.create({
    data: {
      name: '(주)한국글로벌파이낸스',
      businessNumber: '214-88-12345',
      ceoName: '김대표',
      address: '서울특별시 영등포구 여의대로 56 국제금융타워',
      contactPerson: '박팀장 (디지털혁신팀)',
      contactEmail: 'park@kgfinance.co.kr',
      contactPhone: '010-9876-5432',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: '(주)넥스트리테일커머스',
      businessNumber: '110-81-99887',
      ceoName: '최유통',
      address: '경기도 성남시 분당구 판교역로 235 에이치스퀘어',
      contactPerson: '이지은 수석 (IT기획)',
      contactEmail: 'jieun@nextretail.com',
      contactPhone: '010-1234-5678',
    },
  });

  // 6. 샘플 프로젝트 생성 (프로젝트별 담당부서 및 담당자 포함)
  const project1 = await prisma.project.create({
    data: {
      companyId: company1.id,
      title: '차세대 실시간 이상금융거래탐지(FDS) 및 대시보드 구축',
      description: '실시간 스트리밍 데이터 기반 이상 금융거래 모니터링 시스템 및 관리자 웹 콘솔 구축',
      status: 'IN_PROGRESS',
      clientDept: '디지털혁신팀',
      clientManager: '박상혁',
      clientPosition: '팀장',
      clientPhone: '010-9876-5432',
      clientEmail: 'park@kgfinance.co.kr',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      companyId: company2.id,
      title: 'AI 기반 개인화 상품 추천 엔진 & 모바일 쇼핑몰 고도화',
      description: 'LLM 및 벡터 검색 기반 추천 시스템과 모바일 웹앱 리뉴얼 개발',
      status: 'PLANNING',
      clientDept: 'IT기획부',
      clientManager: '이지은',
      clientPosition: '수석',
      clientPhone: '010-1234-5678',
      clientEmail: 'jieun@nextretail.com',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2027-02-28'),
    },
  });

  // 5. 샘플 견적서 생성 (v1.0 & v1.1)
  // v1.0
  const estimate1 = await prisma.estimate.create({
    data: {
      projectId: project1.id,
      estimateNumber: 'EST-20260824-001',
      version: 1.0,
      title: '차세대 FDS 및 대시보드 구축 초기 견적서 (초안)',
      status: 'SENT',
      overheadRate: 110.0,
      technicalRate: 20.0,
      profitRate: 0.0,
      discountAmount: 0.0,
      vatRate: 10.0,
      totalLaborCost: 45780000,
      totalOverheadCost: 50358000,
      totalTechCost: 19227600,
      totalExpenseCost: 4500000,
      totalDevService: 119865600,
      totalItemsCost: 18500000,
      totalSupplyPrice: 138365600,
      totalVat: 13836560,
      grandTotal: 152202160,
      validUntil: new Date('2026-09-30'),
      paymentTerms: '계약체결 시 선금 40%, 중간검수 시 중도금 30%, 최종검수 완료 후 잔금 30%',
      remarks: '클라우드 인프라 라이선스 및 시험평가 비용 포함. 개발기간 4개월 기준.',
      labors: {
        create: [
          { role: '프로젝트 매니저(PM)', grade: '총괄관리자(PM)', manMonths: 1.0, unitPrice: 11500000, totalPrice: 11500000, sortOrder: 0 },
          { role: '시스템 아키텍트/리드', grade: '특급기술자', manMonths: 1.5, unitPrice: 9850000, totalPrice: 14775000, sortOrder: 1 },
          { role: '백엔드/데이터 엔지니어', grade: '고급기술자', manMonths: 1.5, unitPrice: 7980000, totalPrice: 11970000, sortOrder: 2 },
          { role: '프론트엔드 대시보드 개발', grade: '중급기술자', manMonths: 1.2, unitPrice: 6250000, totalPrice: 7500000, sortOrder: 3 },
        ],
      },
      items: {
        create: [
          { category: '솔루션 라이선스', name: '실시간 스트리밍 분석 엔진 라이선스', spec: 'Enterprise 1 Core', unit: 'Copy', quantity: 1, unitPrice: 15000000, discountRate: 0, totalPrice: 15000000, sortOrder: 0 },
          { category: '서버 및 네트워크 하드웨어', name: '고성능 GPU 개발/테스트 장비', spec: 'RTX 4090 24GB Set', unit: 'Set', quantity: 1, unitPrice: 3500000, discountRate: 0, totalPrice: 3500000, sortOrder: 1 },
        ],
      },
      expenses: {
        create: [
          { category: '클라우드/서버 인프라 비용', description: '개발 및 스테이징 AWS 클라우드 사용료 (4개월)', amount: 3000000, sortOrder: 0 },
          { category: '인쇄/제본비', description: '산출물 및 감리 보고서 제본', amount: 500000, sortOrder: 1 },
          { category: '여비교통비/출장비', description: '고객사 금융센터 온사이트 파견 실비', amount: 1000000, sortOrder: 2 },
        ],
      },
      histories: {
        create: [
          { action: 'CREATED', description: 'FDS 프로젝트 초기 견적서 v1.0 발행' },
          { action: 'STATUS_CHANGE', description: '상태 변경: DRAFT -> SENT (고객사 송부 완료)' },
        ],
      },
    },
  });

  // v1.1 협의 변경 견적서
  await prisma.estimate.create({
    data: {
      projectId: project1.id,
      parentEstimateId: estimate1.id,
      estimateNumber: 'EST-20260824-001',
      version: 1.1,
      title: '차세대 FDS 및 대시보드 구축 견적서 (고객사 네고 반영)',
      status: 'WON',
      overheadRate: 110.0,
      technicalRate: 20.0,
      profitRate: 0.0,
      discountAmount: 5000000.0,
      vatRate: 10.0,
      totalLaborCost: 45780000,
      totalOverheadCost: 50358000,
      totalTechCost: 19227600,
      totalExpenseCost: 4500000,
      totalDevService: 119865600,
      totalItemsCost: 18500000,
      totalSupplyPrice: 133365600,
      totalVat: 13336560,
      grandTotal: 146702160,
      validUntil: new Date('2026-09-30'),
      paymentTerms: '선금 40%, 중도금 30%, 잔금 30%',
      remarks: '고객사 예산 협의에 따른 프로모션 할인 500만원 특별 반영',
      changeReason: '고객사 임원 미팅 후 수주 확정을 위한 500만원 할인 승인',
      labors: {
        create: [
          { role: '프로젝트 매니저(PM)', grade: '총괄관리자(PM)', manMonths: 1.0, unitPrice: 11500000, totalPrice: 11500000, sortOrder: 0 },
          { role: '시스템 아키텍트/리드', grade: '특급기술자', manMonths: 1.5, unitPrice: 9850000, totalPrice: 14775000, sortOrder: 1 },
          { role: '백엔드/데이터 엔지니어', grade: '고급기술자', manMonths: 1.5, unitPrice: 7980000, totalPrice: 11970000, sortOrder: 2 },
          { role: '프론트엔드 대시보드 개발', grade: '중급기술자', manMonths: 1.2, unitPrice: 6250000, totalPrice: 7500000, sortOrder: 3 },
        ],
      },
      items: {
        create: [
          { category: '솔루션 라이선스', name: '실시간 스트리밍 분석 엔진 라이선스', spec: 'Enterprise 1 Core', unit: 'Copy', quantity: 1, unitPrice: 15000000, discountRate: 0, totalPrice: 15000000, sortOrder: 0 },
          { category: '서버 및 네트워크 하드웨어', name: '고성능 GPU 개발/테스트 장비', spec: 'RTX 4090 24GB Set', unit: 'Set', quantity: 1, unitPrice: 3500000, discountRate: 0, totalPrice: 3500000, sortOrder: 1 },
        ],
      },
      expenses: {
        create: [
          { category: '클라우드/서버 인프라 비용', description: '개발 및 스테이징 AWS 클라우드 사용료 (4개월)', amount: 3000000, sortOrder: 0 },
          { category: '인쇄/제본비', description: '산출물 및 감리 보고서 제본', amount: 500000, sortOrder: 1 },
          { category: '여비교통비/출장비', description: '고객사 금융센터 온사이트 파견 실비', amount: 1000000, sortOrder: 2 },
        ],
      },
      histories: {
        create: [
          { action: 'VERSION_UP', description: 'v1.0에서 v1.1로 분기 생성 (특별할인 500만원 반영)' },
          { action: 'STATUS_CHANGE', description: '상태 변경: DRAFT -> WON (계약 체결 확정)' },
        ],
      },
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
