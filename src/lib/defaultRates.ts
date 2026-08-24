import { StandardGradeRate, CompanySupplierInfo, RateNoticeInfo } from '@/types/estimate';

/**
 * SW기술자 평균임금 공고 메타데이터 (한국소프트웨어산업협회 공표 기준)
 */
export const DEFAULT_RATE_NOTICE_INFO: RateNoticeInfo = {
  noticeName: '2024년 적용 SW기술자 평균임금 공표 (SW엔지니어링 노임단가)',
  noticeNumber: '한국소프트웨어산업협회 공고 제2023-01호',
  announcedDate: '2023-12-15',
  effectivePeriod: '2024년 1월 1일 ~ 2024년 12월 31일 (차기 공표일까지)',
  surveyPeriod: '2023년 5월 ~ 6월 소프트웨어 기술자 급여 실적 기준',
  approvalNumber: '통계청 국가승인통계 제375001호',
  workDaysPerMonth: 20.83,
};

/**
 * 한국소프트웨어산업협회(KOSA) 공표 SW기술자 평균임금 (월 20.83일 기준 산정)
 */
export const DEFAULT_STANDARD_RATES: StandardGradeRate[] = [
  {
    grade: '총괄관리자(PM)',
    monthlyRate: 11500000,
    dailyRate: 552000,
    hourlyRate: 69000,
    description: '프로젝트 총괄 디렉팅 및 PM, 아키텍트'
  },
  {
    grade: '특급기술자',
    monthlyRate: 9850000,
    dailyRate: 472800,
    hourlyRate: 59100,
    description: '핵심 아키텍처 설계, 수석 엔지니어, 데이터 엔지니어링'
  },
  {
    grade: '고급기술자',
    monthlyRate: 7980000,
    dailyRate: 383100,
    hourlyRate: 47880,
    description: '핵심 백엔드/프론트엔드 리드 개발, 보안 및 시스템 구축'
  },
  {
    grade: '중급기술자',
    monthlyRate: 6250000,
    dailyRate: 300000,
    hourlyRate: 37500,
    description: '풀스택 기능 개발, API 연동, UI 컴포넌트 개발'
  },
  {
    grade: '초급기술자',
    monthlyRate: 4850000,
    dailyRate: 232800,
    hourlyRate: 29100,
    description: '단위 기능 개발, 테스트 및 QA 지원, 퍼블리싱'
  },
];

/**
 * 기본 자사(공급자) 정보 템플릿
 */
export const DEFAULT_SUPPLIER_INFO: CompanySupplierInfo = {
  companyName: '(주)소프트웨어솔루션스',
  businessNumber: '123-45-67890',
  ceoName: '홍길동',
  address: '서울특별시 강남구 테헤란로 123 소프트웨어타워 10층',
  businessType: '서비스, 정보통신',
  businessItem: '소프트웨어 개발 및 공급, IT 컨설팅',
  tel: '02-1234-5678',
  email: 'contact@swsolutions.co.kr',
  fax: '02-1234-5679',
};

/**
 * 기본 견적 4대 요율 설정값 (제경비, 기술료, 이윤, 부가가치세)
 */
export const DEFAULT_ESTIMATE_RATES = {
  overheadRate: 110.0,  // (1) 제경비율: 직접인건비의 110% (110%~120%)
  technicalRate: 20.0,  // (2) 기술료율: (직접인건비 + 제경비)의 20% (20%~40%)
  profitRate: 25.0,     // (3) 이윤율: 개발원가(인건비+제경비+기술료)의 25% (25% 이내)
  vatRate: 10.0,        // (4) 부가가치세율: 공급가액의 10%
};

/**
 * 직접경비 추천 카테고리
 */
export const DEFAULT_EXPENSE_CATEGORIES = [
  '여비교통비/출장비',
  '인쇄/제본비',
  '클라우드/서버 인프라 비용',
  '소프트웨어/도메인 라이선스비',
  '시험평가/인증비',
  '자문비/회의비',
  '기타 직접경비'
];

/**
 * 물품/패키지 추천 카테고리
 */
export const DEFAULT_ITEM_CATEGORIES = [
  '패키지 소프트웨어',
  '서버 및 네트워크 하드웨어',
  '솔루션 라이선스',
  '스토리지/보안장비',
  '기타 물품'
];
