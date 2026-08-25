# [산출물-02] 요구사항 정의서 및 추적 매트릭스 (Requirements Specification & RTM)

---

## 1. 개요
본 문서는 IT/SW 통합 견적 관리 시스템 구축을 위한 **기능 요구사항(FR)** 및 **비기능 요구사항(NFR)**을 체계적으로 정의하고, 설계/구현/테스트 단계 간의 연계성을 보장하는 **요구사항 추적 매트릭스(RTM)**를 기술합니다.

---

## 2. 기능 요구사항 목록 (Functional Requirements)

| 요구사항 ID | 분류 | 요구사항 명칭 | 상세 요구사항 내용 | 중요도 |
| :--- | :--- | :--- | :--- | :---: |
| **FR-EST-01** | 견적 산출 | KOSA 표준 노임단가 및 기준일자 연동 | 2026년 공표 표준 노임단가(일단가/월단가) 및 공고번호, 발표일, 적용 기준일을 명시하고 직무별 자동 계산 지원 | **필수 (High)** |
| **FR-EST-02** | 견적 산출 | 4대 요율 및 할인 계산 엔진 | 제경비율(110%), 기술료율(20%), 이윤율(개발원가의 25% 이내), 부가가치세(10%), 특별할인액(원) 실시간 자동 연산 | **필수 (High)** |
| **FR-EST-03** | 견적 산출 | 물품 및 직접경비 실비 관리 | 패키지SW/하드웨어/라이선스 2줄 카드형 입력(수량/단가/할인) 및 직접경비(교통비/인쇄비/임차료) 실비 항목 합산 | **필수 (High)** |
| **FR-VER-01** | 버전 관리 | 견적서 버전 복제 및 사유 추적 | v1.0 $\rightarrow$ v1.1(Minor), v2.0(Major) 버전 복제 및 고객사 네고 사유 기록 및 이력 타임라인 조회 | **필수 (High)** |
| **FR-VER-02** | 버전 관리 | 작성자 소유권 및 타인 수정 자동 분기 | 원작성자만 직접 수정 가능하며, 타 사용자가 수정 시 **자동으로 v1.1 마이너 버전 분기 생성** 및 변경사유 기록 | **필수 (High)** |
| **FR-CRM-01** | 고객/프로젝트 | 고객사(거래처) 정보 관리 | 고객사 사업자등록번호, 대표자, 업태/종목, 주소, 대표 연락처 CRUD 관리 | **필수 (High)** |
| **FR-CRM-02** | 고객/프로젝트 | 프로젝트별 전담 연락망 관리 | 프로젝트별 고객사 담당부서, 담당자명, 직급/직책, 연락처, 이메일 개별 관리 | **필수 (High)** |
| **FR-AUTH-01**| 사용자/보안 | ID/PW 기반 사용자 인증 | JWT 기반 HttpOnly 쿠키 세션 발급, bcrypt 비밀번호 단방향 암호화, 초기 관리자 `admin` / `password` | **필수 (High)** |
| **FR-AUTH-02**| 사용자/보안 | 직원(User) 등록 및 권한 제어 | 관리자 전용 직원(성명, 부서, 직위, 전화, 이메일, Role: ADMIN/USER) CRUD 및 권한별 메뉴 분기 | **필수 (High)** |
| **FR-AUDIT-01**| 감사/보안 | 견적서 열람 및 감사 로그 | 견적서 열람(VIEW), 인쇄(PRINT), 엑셀(EXCEL), 수정분기(EDIT_ATTEMPT) 실시간 로깅 및 관리자 전용 대시보드 | **필수 (High)** |
| **FR-OUT-01** | 출력/보고서 | 공식 표준 A4 인쇄 / PDF 뷰 | 인쇄 전용 CSS 및 표준 서식(견적총괄표, SW인건비, 물품, 경비, 대금조건, 법적근거) 완비 | **필수 (High)** |
| **FR-OUT-02** | 출력/보고서 | ExcelJS 4개 시트 다중 엑셀 내보내기 | 견적 총괄표, SW 인건비 산출서, 물품 내역서, 직접경비 내역서 4개 탭 자동 생성 및 다운로드 | **필수 (High)** |
| **FR-UI-01**  | 사용자 UI | 반응형 사이드바 접기/펼치기 | 좌측 사이드바 접기/펼치기(Collapsible), 아이콘 툴팁, localStorage 상태 영속화 | **보통 (Medium)** |
| **FR-UI-02**  | 사용자 UI | 슬림 플로팅 요율 패널 | 스크롤 시 우측 요율/집계 패널 상단 플로팅 고정(Sticky) 및 좌측 작성영역 75% 확장 | **보통 (Medium)** |

---

## 3. 비기능 요구사항 목록 (Non-Functional Requirements)

| 요구사항 ID | 분류 | 상세 요구사항 내용 |
| :--- | :--- | :--- |
| **NFR-PERF-01** | 성능 | 견적서 수치 변경 시 실시간(100ms 이내) 클라이언트 자동 계산 수행 |
| **NFR-SEC-01** | 보안 | 비밀번호 단방향 Salt 해싱(Bcrypt 10 rounds), HttpOnly/SameSite 보안 쿠키, 감사 로그 비인가자 접근 403 차단 |
| **NFR-REL-01** | 신뢰성/정합성 | 금액 연산 시 자바스크립트 부동소수점 오차 방지(정수 단위 반올림 및 천단위 쉼표 완벽 포맷팅) |
| **NFR-USAB-01** | 사용성 | 반응형 웹(데스크톱, 태블릿, 모바일), 인쇄 시 불필요한 UI(사이드바/버튼) 자동 제거(`no-print`) |
| **NFR-PORT-01** | 이식성/운영 | Docker & Docker Compose 컨테이너화를 통해 OS 독립적 구동 및 Prisma Studio 웹 DB GUI 제공 |

---

## 4. 요구사항 추적 매트릭스 (RTM: Requirements Traceability Matrix)

| 요구사항 ID | 요구사항 명칭 | 설계 산출물 (SDD / DB / API) | 소스코드 구현 모듈 | 테스트 케이스 ID | 검증 결과 |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **FR-EST-01** | KOSA 노임단가 연동 | `03_SDD`, `04_DB (StandardGradeRate)` | `src/lib/defaultRates.ts`, `LaborSection.tsx` | TC-EST-01 | **PASS** |
| **FR-EST-02** | 4대 요율 자동 계산 | `03_SDD`, `src/lib/calculator.ts` | `src/lib/calculator.ts`, `CalculationSummaryCard.tsx` | TC-EST-02 | **PASS** |
| **FR-EST-03** | 물품/직접경비 2줄 카드 | `03_SDD`, `04_DB (ProductItem, ExpenseItem)` | `ItemSection.tsx`, `ExpenseSection.tsx` | TC-EST-03 | **PASS** |
| **FR-VER-01** | 버전 복제 및 사유추적 | `03_SDD`, `05_API (/api/estimates/[id]/duplicate)` | `VersionHistoryModal.tsx`, `api/estimates/[id]/duplicate` | TC-VER-01 | **PASS** |
| **FR-VER-02** | 타인수정 자동분기(+0.1) | `03_SDD`, `05_API (/api/estimates/[id] PUT)` | `api/estimates/[id]/route.ts` | TC-VER-02 | **PASS** |
| **FR-CRM-01** | 고객사 관리 (CRUD) | `04_DB (Company)`, `05_API (/api/companies)` | `src/app/companies/page.tsx`, `api/companies` | TC-CRM-01 | **PASS** |
| **FR-CRM-02** | 프로젝트 전담 연락망 | `04_DB (Project)`, `05_API (/api/projects)` | `src/app/projects/page.tsx`, `api/projects` | TC-CRM-02 | **PASS** |
| **FR-AUTH-01**| JWT ID/PW 로그인 | `03_SDD (Auth)`, `05_API (/api/auth/login)` | `src/lib/auth.ts`, `AuthContext.tsx`, `app/login` | TC-AUTH-01 | **PASS** |
| **FR-AUTH-02**| 직원 관리 & 권한제어 | `04_DB (User)`, `05_API (/api/users)` | `src/app/users/page.tsx`, `api/users` | TC-AUTH-02 | **PASS** |
| **FR-AUDIT-01**| 열람 감사 로그 대시보드| `04_DB (EstimateViewLog)`, `05_API (/api/audit-logs)`| `src/app/audit-logs/page.tsx`, `api/audit-logs` | TC-AUD-01 | **PASS** |
| **FR-OUT-01** | 표준 A4 인쇄 / PDF | `06_UI (Preview)`, CSS `@media print` | `src/app/estimates/[id]/preview/page.tsx` | TC-OUT-01 | **PASS** |
| **FR-OUT-02** | 엑셀 다중시트 내보내기 | `05_API (/api/estimates/[id]/excel)` | `src/lib/excelExport.ts`, `api/estimates/[id]/excel` | TC-OUT-02 | **PASS** |
| **FR-UI-01**  | 접기/펼치기 사이드바 | `06_UI (Sidebar)` | `src/components/layout/Sidebar.tsx` | TC-UI-01 | **PASS** |
| **FR-UI-02**  | 슬림 플로팅 요율 패널 | `06_UI (Edit Page)` | `src/app/estimates/[id]/edit/page.tsx` | TC-UI-02 | **PASS** |
