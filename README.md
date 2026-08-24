# 💼 SW 개발비 및 물품 통합 견적 관리 시스템 (Estimate Management System)

한국소프트웨어산업협회(KOSA) SW기술자 노임단가 기준과 한국 SW 대가산정 가이드라인(제경비, 기술료, 이윤율 25% 이내, VAT)을 완벽하게 지원하는 통합 견적서 작성 및 프로젝트/고객사 이력 관리 솔루션입니다.

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

### 2. 🔀 견적서 버전 브랜칭 & 이력 관리 (Version History)
- v1.0 $\rightarrow$ v1.1(Minor), v2.0(Major) 버전 복제 및 사유 추적
- 고객사 네고 및 범위 변경에 따른 버전별 변경 로그 및 타임라인

### 3. 🏢 프로젝트별 발주처(고객사) 전담 연락망 & 거래처 관리
- 고객사별 다중 프로젝트 및 프로젝트별 담당부서, 담당자명, 직책, 연락처, 이메일 개별 관리
- 거래처 및 프로젝트의 신규 등록, 수정, 삭제(Cascade) 기능 완비

### 4. 🖨️ 표준 A4 견적서 인쇄/PDF 및 다중 시트 엑셀(ExcelJS)
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
