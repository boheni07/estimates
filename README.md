# 💼 SW 개발비 및 물품 통합 견적 관리 시스템 (Estimate Management System)

한국소프트웨어산업협회(KOSA) SW기술자 노임단가 기준과 한국 SW 대가산정 가이드라인(제경비, 기술료, 이윤율 25% 이내, VAT)을 완벽하게 지원하는 통합 견적서 작성 및 프로젝트/고객사 이력 관리 솔루션입니다.

## 📚 SW 개발방법론 표준 산출물 문서 (SDLC Deliverables)

본 프로젝트는 전자정부 및 엔터프라이즈 SW공학 표준 개발방법론에 입각하여 전 수명주기 산출물을 작성하여 관리하고 있습니다:

| 산출물 | 문서명 | 주요 내용 |
| :---: | :--- | :--- |
| **[산출물-01]** | [사업수행계획서 및 프로젝트 헌장](docs/01_PROJECT_CHARTER.md) | 프로젝트 개요, 추진 배경 및 목적, 추진 조직 및 R&R, 개발 환경, 마일스톤 |
| **[산출물-02]** | [요구사항 정의서 및 추적 매트릭스](docs/02_REQUIREMENTS_SPECIFICATION.md) | 기능/비기능 요구사항 정의, 요구사항 추적 매트릭스 (RTM) |
| **[산출물-03]** | [시스템 아키텍처 및 소프트웨어 설계서](docs/03_SYSTEM_ARCHITECTURE.md) | 3-Tier 아키텍처, Docker 컨테이너 구성, JWT 인증/버전분기 시퀀스, 수식 모델 |
| **[산출물-04]** | [데이터베이스 설계서 및 ERD](docs/04_DATABASE_DESIGN.md) | ER 다이어그램(ERD), 10개 핵심 테이블 상세 데이터 사전 (Data Dictionary) |
| **[산출물-05]** | [REST API 인터페이스 명세서](docs/05_API_SPECIFICATION.md) | 25개 RESTful 엔드포인트 명세, Request/Response 스키마, 상태 코드 |
| **[산출물-06]** | [화면 설계서 및 UI/UX 스토리보드](docs/06_UI_SPECIFICATION.md) | 사이트맵, 접기/펼치기 사이드바, 2줄 카드형 품목, 슬림 플로팅 요율 패널 |
| **[산출물-07]** | [테스트 계획서 및 시험 결과서](docs/07_TEST_REPORT.md) | 32개 테스트 케이스 시험 결과표, 단위/통합/보안 검증 (100% Pass) |
| **[산출물-08]** | [시스템 설치 및 배포/운영자 가이드](docs/08_DEPLOYMENT_GUIDE.md) | 시스템 사양, Docker Compose 원클릭 실행, 백업/복구 절차, 운영 가이드 |
| **[산출물-09]** | [시스템 사용자 매뉴얼](docs/09_USER_MANUAL.md) | 일반 직원 및 관리자용 전체 기능 스크린샷 및 단계별 활용 가이드 |
| **[총괄인덱스]**| [산출물 패키지 총괄 인덱스](docs/README.md) | 개발 수명주기 매핑 및 전체 산출물 디렉토리 |

---

## ✨ 핵심 주요 기능

### 1. 🧮 SW 대가산정 및 복합 견적 엔진
- **직접인건비**: SW 기술자 등급별(PM, 특급, 고급, 중급, 초급 등) 투입공수(M/M) 및 월단가 자동 연산
- **KOSA 공고 정보 연동**: 기준 노임단가 공고명, 공고번호, 공표일, 적용기준일(월 20.83일) 자동 표기 및 마스터 관리
- **4대 요율 체계 완비**:
  - **제경비**: 직접인건비의 110% (110%~120%)
  - **기술료**: (직접인건비 + 제경비)의 20% (20%~40%)
  - **이윤**: 개발원가(인건비+제경비+기술료)의 25% (법적 상한 25% 이내)
  - **부가가치세 (VAT)**: 공급가액의 10%
- **물품/패키지 & 직접경비 & 특별할인**: 수량별 할인율 및 비목별 실비 경비 자동 합산
- **실시간 콤마 입력**: 세 자릿수 천 단위 구분 기호(,) 실시간 포맷팅

### 2. 🔐 사용자 인증 & 직원(사용자) 관리 (User & Role Management)
- **ID/PW 로그인**: JWT 기반 HttpOnly 쿠키 인증 및 세션 관리
- **초기 시스템 관리자 계정**: `admin` / `password` (ADMIN 권한)
- **직원 등록/수정/삭제**: 성명, 소속 부서, 직위, 전화번호, 이메일, 시스템 권한(ADMIN / USER) 관리
- **사이드바 및 상단 프로필**: 로그인 사용자 정보 실시간 표시 및 권한별 메뉴 분기

### 3. 🔀 견적서 작성자 소유권 & 타인 수정 시 자동 마이너 버전(+0.1) 분기
- 견적서 생성 시 작성자(담당 직원) 자동 등록 및 목록/상세 화면 표출
- **작성자 본인**: 해당 견적서 직접 수정 가능
- **타 사용자 수정 시**:
  - 기존 원본을 덮어쓰지 않고 **v1.0 $\rightarrow$ v1.1 마이너 버전으로 자동 분기 생성**
  - 수정자가 새로운 작성자로 등록되고 변경 사유 자동 기록

### 4. 🛡️ 견적서 열람(조회) 이력 & 보안 감사 로그 (Audit Log - 관리자 전용)
- 견적서 화면 열람(`VIEW`), 공식 인쇄/PDF(`PRINT`), 엑셀 다운로드(`EXCEL`), 타인 수정 시도(`EDIT_ATTEMPT`) 실시간 로깅
- **시스템 관리자(`ADMIN`)만 조회 가능**한 전용 감사 대시보드 (`/audit-logs`) 제공

### 5. 🏢 프로젝트별 발주처(고객사) 전담 연락망 & 거래처 관리
- 고객사별 다중 프로젝트 및 프로젝트별 담당부서, 담당자명, 직책, 연락처, 이메일 개별 관리
- 거래처 및 프로젝트의 신규 등록, 수정, 삭제(Cascade) 기능 완비

### 6. 🖨️ 표준 A4 견적서 인쇄/PDF 및 다중 시트 엑셀(ExcelJS)
- 공식 표준 A4 출력 및 PDF 인쇄 뷰 (공인 견적 총괄표 + SW인건비 산출내역 + 물품/경비 내역 + 대금조건 + 법적 근거 각주)
- 4개 시트 자동 구성 Excel 내보내기 (견적 총괄표, SW인건비 산출서, 물품 내역서, 직접경비 내역서)

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Next.js Route Handlers (REST API), Prisma ORM
- **Database**: PostgreSQL 16 (도커 컨테이너 및 볼륨 영속화)
- **Container / Infra**: Docker Multi-stage Standalone Build, Docker Compose
- **Document / Export**: ExcelJS (다중 시트 스타일링 엑셀), CSS Print Media Query (표준 A4 인쇄)

---

## 🐳 Docker로 원클릭 실행하기 (Recommended)

Docker와 Docker Compose만 설치되어 있으면 PostgreSQL DB와 Next.js 서버가 한 번에 빌드 및 구동됩니다.

```bash
# 1. 컨테이너 빌드 및 백그라운드 실행
docker compose up -d --build

# 2. 컨테이너 상태 및 로그 확인
docker compose ps
docker compose logs -f app
```

- **웹 애플리케이션 접속**: `http://localhost:3300` (견적 관리 시스템 메인)
- **웹 DB 관리자 (Prisma Studio)**: `http://localhost:5555` (브라우저에서 DB 테이블 조회/수정/삭제 GUI)
- **PostgreSQL 접속**: `localhost:5432` (User: `estimate_user`, Password: `estimate_password`, DB: `estimate_db`)

---

## 💻 로컬 개발 환경에서 실행하기 (Local Development)

### 1. 패키지 설치
```bash
npm install
```

### 2. 데이터베이스 설정 (.env)
```env
DATABASE_URL="postgresql://estimate_user:estimate_password@localhost:5432/estimate_db?schema=public"
```

### 3. 스키마 동기화 & 시드 데이터 주입
```bash
npx prisma db push
node prisma/seed.js
```

### 4. 개발 서버 실행
```bash
npm run dev
```
