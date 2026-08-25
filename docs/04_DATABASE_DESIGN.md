# [산출물-04] 데이터베이스 설계서 및 ERD (Database Design & Data Dictionary)

---

## 1. 데이터베이스 개요

* **DBMS**: PostgreSQL 16 (Relational Database)
* **인코딩**: UTF-8
* **ORM**: Prisma ORM 5.22.0
* **스키마 파일**: `prisma/schema.prisma`
* **주요 엔티티**: 사용자/직원(`User`), 감사로그(`EstimateViewLog`), 고객사(`Company`), 프로젝트(`Project`), 견적서(`Estimate`), 인건비(`LaborItem`), 물품(`ProductItem`), 직접경비(`ExpenseItem`), 마스터설정(`MasterSetting`), 기준노임단가(`StandardGradeRate`)

---

## 2. 개체-관계 다이어그램 (ERD: Entity-Relationship Diagram)

```mermaid
erDiagram
    USER ||--o{ ESTIMATE : "writes (author)"
    USER ||--o{ ESTIMATE_VIEW_LOG : "logs access"
    COMPANY ||--o{ PROJECT : "owns"
    PROJECT ||--o{ ESTIMATE : "contains"
    ESTIMATE ||--o{ ESTIMATE : "parent/child version"
    ESTIMATE ||--o{ LABOR_ITEM : "includes"
    ESTIMATE ||--o{ PRODUCT_ITEM : "includes"
    ESTIMATE ||--o{ EXPENSE_ITEM : "includes"
    ESTIMATE ||--o{ ESTIMATE_VIEW_LOG : "audits"

    USER {
        string id PK "cuid"
        string username UK "로그인 ID"
        string password "bcrypt 해시"
        string name "직원 성명"
        string department "소속 부서"
        string position "직위/직급"
        string phone "연락처"
        string email "이메일"
        string role "ADMIN | USER"
        boolean isActive "활성 상태"
        datetime createdAt
        datetime updatedAt
    }

    ESTIMATE_VIEW_LOG {
        string id PK "cuid"
        string estimateId FK
        string userId FK
        string userName "열람자 성명"
        string userDept "열람자 부서"
        string action "VIEW | PRINT | EXCEL | EDIT_ATTEMPT"
        string ipAddress "접속 IP"
        string userAgent "브라우저 정보"
        datetime createdAt
    }

    COMPANY {
        string id PK "cuid"
        string name "고객사 상호"
        string bizNumber "사업자등록번호"
        string ceoName "대표자명"
        string address "사업장 주소"
        string phone "대표 전화번호"
        string email "대표 이메일"
        datetime createdAt
        datetime updatedAt
    }

    PROJECT {
        string id PK "cuid"
        string companyId FK
        string title "프로젝트명"
        string description "프로젝트 개요"
        string clientDept "고객사 담당부서"
        string clientManager "고객사 담당자명"
        string clientPosition "고객사 담당자 직급"
        string clientPhone "담당자 연락처"
        string clientEmail "담당자 이메일"
        string status "IN_PROGRESS | COMPLETED | HOLD"
        datetime createdAt
        datetime updatedAt
    }

    ESTIMATE {
        string id PK "cuid"
        string projectId FK
        string authorId FK "작성자 ID"
        string parentEstimateId FK "원본 견적서 ID"
        string estimateNumber "EST-YYYYMMDD-XXX"
        float version "1.0, 1.1, 2.0"
        string title "견적서 제목"
        string status "DRAFT | REVIEW | SENT | WON | LOST"
        float overheadRate "제경비율 (110%)"
        float technicalRate "기술료율 (20%)"
        float profitRate "이윤율 (25% 이내)"
        float vatRate "부가가치세율 (10%)"
        bigint discountAmount "특별할인액"
        bigint totalLaborCost "직접인건비 소계"
        bigint totalOverheadCost "제경비 소계"
        bigint totalTechCost "기술료 소계"
        bigint totalProfitCost "이윤 소계"
        bigint totalExpenseCost "직접경비 소계"
        bigint totalDevService "SW용역 합계"
        bigint totalItemsCost "물품 합계"
        bigint totalSupplyPrice "총 공급가액"
        bigint totalVat "부가가치세"
        bigint grandTotal "최종 견적 합계"
        string changeReason "버전 변경 사유"
        string paymentTerms "대금지급조건"
        string remarks "특이사항/비고"
        datetime validUntil "유효기간"
        datetime createdAt
        datetime updatedAt
    }

    LABOR_ITEM {
        string id PK "cuid"
        string estimateId FK
        string role "담당 역할/직무"
        string grade "기술 등급"
        float manMonths "투입공수 M/M"
        bigint unitPrice "월 노임단가"
        bigint totalPrice "인건비 합계"
        int sortOrder "정렬 순서"
    }

    PRODUCT_ITEM {
        string id PK "cuid"
        string estimateId FK
        string category "품목 구분"
        string name "품목명"
        string spec "규격/사양"
        string unit "단위 (EA)"
        int quantity "수량"
        bigint unitPrice "단가"
        float discountRate "할인율(%)"
        bigint totalPrice "공급금액"
        int sortOrder "정렬 순서"
    }

    EXPENSE_ITEM {
        string id PK "cuid"
        string estimateId FK
        string category "경비 구분"
        string description "산출 내역/적요"
        bigint amount "금액"
        int sortOrder "정렬 순서"
    }
```

---

## 3. 상세 테이블 정의서 (Data Dictionary)

### 3.1 사용자/직원 테이블 (`User`)

| 컬럼명 | 물리 타입 | NULL | 기본값 | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- |
| `id` | VARCHAR(30) | N | cuid() | 기본키 (Primary Key) |
| `username` | VARCHAR(50) | N | - | 로그인 ID (Unique) |
| `password` | VARCHAR(255) | N | - | 단방향 해시 비밀번호 (Bcrypt) |
| `name` | VARCHAR(50) | N | - | 직원 성명 |
| `department` | VARCHAR(50) | N | - | 소속 부서 |
| `position` | VARCHAR(50) | N | - | 직위 / 직급 |
| `phone` | VARCHAR(30) | Y | NULL | 전화번호 |
| `email` | VARCHAR(100) | Y | NULL | 이메일 주소 |
| `role` | VARCHAR(20) | N | 'USER' | 권한 (`ADMIN` \| `USER`) |
| `isActive` | BOOLEAN | N | true | 계정 활성화 여부 |
| `createdAt` | TIMESTAMP | N | now() | 등록일시 |
| `updatedAt` | TIMESTAMP | N | now() | 수정일시 |

---

### 3.2 열람 감사 로그 테이블 (`EstimateViewLog`)

| 컬럼명 | 물리 타입 | NULL | 기본값 | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- |
| `id` | VARCHAR(30) | N | cuid() | 기본키 (Primary Key) |
| `estimateId`| VARCHAR(30) | N | - | 대상 견적서 ID (FK $\rightarrow$ `Estimate.id`, Cascade) |
| `userId` | VARCHAR(30) | Y | NULL | 열람자 사용자 ID (FK $\rightarrow$ `User.id`) |
| `userName` | VARCHAR(50) | N | - | 열람 당시 사용자 성명 |
| `userDept` | VARCHAR(50) | Y | NULL | 열람 당시 소속 부서 |
| `action` | VARCHAR(30) | N | 'VIEW'| 행동 구분 (`VIEW` \| `PRINT` \| `EXCEL` \| `EDIT_ATTEMPT`) |
| `ipAddress` | VARCHAR(50) | Y | NULL | 접속 IP 주소 |
| `userAgent` | TEXT | Y | NULL | 브라우저 및 디바이스 환경 |
| `createdAt` | TIMESTAMP | N | now() | 로그 발생 일시 |

---

### 3.3 고객사(거래처) 테이블 (`Company`)

| 컬럼명 | 물리 타입 | NULL | 기본값 | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- |
| `id` | VARCHAR(30) | N | cuid() | 기본키 (Primary Key) |
| `name` | VARCHAR(100) | N | - | 고객사 상호/법인명 |
| `bizNumber` | VARCHAR(30) | Y | NULL | 사업자등록번호 |
| `ceoName` | VARCHAR(50) | Y | NULL | 대표자 성명 |
| `address` | VARCHAR(255) | Y | NULL | 사업장 주소지 |
| `phone` | VARCHAR(30) | Y | NULL | 대표 전화번호 |
| `email` | VARCHAR(100) | Y | NULL | 대표 이메일 |
| `createdAt` | TIMESTAMP | N | now() | 등록일시 |
| `updatedAt` | TIMESTAMP | N | now() | 수정일시 |

---

### 3.4 프로젝트 테이블 (`Project`)

| 컬럼명 | 물리 타입 | NULL | 기본값 | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- |
| `id` | VARCHAR(30) | N | cuid() | 기본키 (Primary Key) |
| `companyId` | VARCHAR(30) | N | - | 소속 고객사 ID (FK $\rightarrow$ `Company.id`, Cascade) |
| `title` | VARCHAR(150) | N | - | 프로젝트 사업명 |
| `description`| TEXT | Y | NULL | 프로젝트 사업 개요 |
| `clientDept` | VARCHAR(50) | Y | NULL | 고객사 담당 부서 |
| `clientManager`| VARCHAR(50) | Y | NULL | 고객사 담당자 성명 |
| `clientPosition`| VARCHAR(50) | Y | NULL | 고객사 담당자 직위 |
| `clientPhone`| VARCHAR(30) | Y | NULL | 담당자 연락처 |
| `clientEmail`| VARCHAR(100) | Y | NULL | 담당자 이메일 |
| `status` | VARCHAR(20) | N | 'IN_PROGRESS' | 진행 상태 |
| `createdAt` | TIMESTAMP | N | now() | 등록일시 |
| `updatedAt` | TIMESTAMP | N | now() | 수정일시 |

---

### 3.5 견적서 마스터 테이블 (`Estimate`)

| 컬럼명 | 물리 타입 | NULL | 기본값 | 설명 및 제약조건 |
| :--- | :--- | :---: | :---: | :--- |
| `id` | VARCHAR(30) | N | cuid() | 기본키 (Primary Key) |
| `projectId` | VARCHAR(30) | N | - | 프로젝트 ID (FK $\rightarrow$ `Project.id`, Cascade) |
| `authorId` | VARCHAR(30) | Y | NULL | 작성자 직원 ID (FK $\rightarrow$ `User.id`) |
| `parentEstimateId`| VARCHAR(30) | Y | NULL | 원본 견적서 ID (버전 분기 시 FK) |
| `estimateNumber`| VARCHAR(50) | N | - | 견적서 일련번호 (`EST-YYYYMMDD-XXX`) |
| `version` | DOUBLE PRECISION | N | 1.0 | 견적서 버전 (`1.0`, `1.1`, `2.0` 등) |
| `title` | VARCHAR(200) | N | - | 견적서 제목 |
| `status` | VARCHAR(20) | N | 'DRAFT' | 상태 (`DRAFT`, `REVIEW`, `SENT`, `WON`, `LOST`) |
| `overheadRate`| DOUBLE PRECISION | N | 110.0 | 제경비율 (%) |
| `technicalRate`| DOUBLE PRECISION| N | 20.0 | 기술료율 (%) |
| `profitRate` | DOUBLE PRECISION| N | 25.0 | 이윤율 (25% 이내, %) |
| `vatRate` | DOUBLE PRECISION| N | 10.0 | 부가가치세율 (%) |
| `discountAmount`| BIGINT | N | 0 | 특별할인 차감액 (원) |
| `totalLaborCost`| BIGINT | N | 0 | 직접인건비 소계 (원) |
| `totalOverheadCost`| BIGINT | N | 0 | 제경비 소계 (원) |
| `totalTechCost`| BIGINT | N | 0 | 기술료 소계 (원) |
| `totalProfitCost`| BIGINT | N | 0 | 이윤 소계 (원) |
| `totalExpenseCost`| BIGINT | N | 0 | 직접경비 소계 (원) |
| `totalDevService`| BIGINT | N | 0 | SW용역 합계 (원) |
| `totalItemsCost`| BIGINT | N | 0 | 물품 및 라이선스 합계 (원) |
| `totalSupplyPrice`| BIGINT | N | 0 | 총 공급가액 (원) |
| `totalVat` | BIGINT | N | 0 | 부가가치세 (원) |
| `grandTotal` | BIGINT | N | 0 | 최종 견적 합계 (원) |
| `changeReason` | TEXT | Y | NULL | 버전 복제 / 타인수정 분기 사유 |
| `paymentTerms` | VARCHAR(255) | Y | NULL | 대금지급조건 |
| `remarks` | TEXT | Y | NULL | 특이사항 및 비고 |
| `validUntil` | TIMESTAMP | Y | NULL | 견적 유효기간 |
| `createdAt` | TIMESTAMP | N | now() | 발행일시 |
| `updatedAt` | TIMESTAMP | N | now() | 최종수정일시 |
