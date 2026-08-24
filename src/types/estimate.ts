export type EstimateStatus = 'DRAFT' | 'REVIEW' | 'SENT' | 'WON' | 'LOST' | 'CANCELED';
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
export type UserRole = 'ADMIN' | 'USER';

export interface UserType {
  id: string;
  username: string;
  name: string;
  department: string;
  position: string;
  phone?: string | null;
  email?: string | null;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface EstimateViewLogType {
  id: string;
  estimateId: string;
  userId?: string | null;
  user?: UserType | null;
  userName: string;
  userDept?: string | null;
  action: 'VIEW' | 'PRINT' | 'EXCEL' | 'EDIT_ATTEMPT';
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string | Date;
  estimate?: EstimateType;
}

export interface CompanyType {
  id: string;
  name: string;
  businessNumber?: string | null;
  ceoName?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  projects?: ProjectType[];
}

export interface ProjectType {
  id: string;
  companyId: string;
  company?: CompanyType;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  
  // 프로젝트별 고객사 담당자 정보
  clientDept?: string | null;
  clientManager?: string | null;
  clientPosition?: string | null;
  clientPhone?: string | null;
  clientEmail?: string | null;

  createdAt: string | Date;
  updatedAt: string | Date;
  estimates?: EstimateType[];
}

export interface LaborItem {
  id?: string;
  role: string;
  grade: string; // 특급기술자, 고급기술자, 중급기술자, 초급기술자, 프로젝트매니저 등
  manMonths: number;
  unitPrice: number;
  totalPrice: number;
  sortOrder?: number;
}

export interface ProductItem {
  id?: string;
  category: string; // 하드웨어, 소프트웨어, 라이선스, 기타
  name: string;
  spec?: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  totalPrice: number;
  sortOrder?: number;
}

export interface ExpenseItem {
  id?: string;
  category: string; // 여비교통비, 장비임차료, 인쇄제본비, 회선통신비 등
  description: string;
  amount: number;
  sortOrder?: number;
}

export interface EstimateHistoryType {
  id: string;
  estimateId: string;
  action: string;
  description: string;
  createdAt: string | Date;
}

export interface EstimateType {
  id: string;
  projectId: string;
  project?: ProjectType;
  authorId?: string | null;
  author?: UserType | null;
  estimateNumber: string;
  version: number;
  parentEstimateId?: string | null;
  title: string;
  status: EstimateStatus;
  
  overheadRate: number; // 제경비율 (%)
  technicalRate: number; // 기술료율 (%)
  profitRate: number; // 이윤율 (%)
  discountAmount: number; // 할인금액
  vatRate: number; // 부가세율 (%)
  
  totalLaborCost: number; // 직접인건비 합계
  totalOverheadCost: number; // 제경비 합계
  totalTechCost: number; // 기술료 합계
  totalExpenseCost: number; // 직접경비 합계
  totalDevService: number; // SW용역 소계
  totalItemsCost: number; // 물품 소계
  totalSupplyPrice: number; // 총 공급가액
  totalVat: number; // 총 부가세
  grandTotal: number; // 총 견적합계
  
  validUntil?: string | Date | null;
  paymentTerms?: string | null;
  remarks?: string | null;
  changeReason?: string | null;
  
  createdAt: string | Date;
  updatedAt: string | Date;
  
  labors: LaborItem[];
  items: ProductItem[];
  expenses: ExpenseItem[];
  histories?: EstimateHistoryType[];
}

export interface CompanySupplierInfo {
  companyName: string;
  businessNumber: string;
  ceoName: string;
  address: string;
  businessType: string; // 업태
  businessItem: string; // 종목
  tel: string;
  email: string;
  fax?: string;
  stampUrl?: string; // 직인 이미지 URL / Base64
}

export interface StandardGradeRate {
  grade: string;
  monthlyRate: number;
  dailyRate: number;
  hourlyRate: number;
  description?: string;
}

export interface RateNoticeInfo {
  noticeName: string; // 공고명 (예: 2024년 적용 SW기술자 평균임금 공표)
  noticeNumber: string; // 공고번호 (예: 한국소프트웨어산업협회 공고 제2023-01호)
  announcedDate: string; // 공표일 / 발표일 (예: 2023-12-15)
  effectivePeriod: string; // 적용 기간 및 기준 (예: 2024년 1월 1일 ~ 차기 공표일까지)
  surveyPeriod?: string; // 조사 기준일 / 조사 기간 (예: 2023년 5월 ~ 6월 실적 기준)
  approvalNumber?: string; // 통계승인번호 (예: 통계청 승인 제375001호)
  workDaysPerMonth?: number; // 월평균 근무일수 (기본 20.83일)
}

