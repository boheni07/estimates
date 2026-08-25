# [산출물-05] REST API 인터페이스 명세서 (API Specification)

---

## 1. 공통 규격 및 상태 코드

* **기본 URL**: `http://localhost:3300/api`
* **인증 방식**: JWT Cookie (`estimate_auth_token`) 또는 `Authorization: Bearer <token>`
* **응답 포맷**: `application/json` (엑셀 다운로드 제외: `application/vnd.openxmlformats...`)
* **표준 HTTP 상태 코드**:
  - `200 OK`: 요청 성공 및 데이터 반환
  - `201 Created`: 자원 생성 성공
  - `400 Bad Request`: 필수 파라미터 누락 및 유효성 검증 실패
  - `401 Unauthorized`: 로그인 인증 필요
  - `403 Forbidden`: 시스템 관리자(ADMIN) 전용 권한 제한
  - `404 Not Found`: 대상 리소스 미존재
  - `500 Internal Server Error`: 서버 내부 에러

---

## 2. API 엔드포인트 목록 총괄표

| 대분류 | HTTP Method | Endpoint URI | 인증/권한 | 기능 설명 |
| :--- | :---: | :--- | :---: | :--- |
| **인증** | `POST` | `/api/auth/login` | Public | ID/PW 로그인 & JWT 토큰 및 쿠키 발급 |
| | `POST` | `/api/auth/logout` | User/Admin | 로그아웃 & 세션 쿠키 무효화 |
| | `GET` | `/api/auth/me` | User/Admin | 현재 로그인된 사용자 정보 조회 |
| **직원 관리** | `GET` | `/api/users` | User/Admin | 전체 직원 목록 조회 |
| | `POST` | `/api/users` | **ADMIN** | 신규 직원 등록 |
| | `PUT` | `/api/users/[id]` | **ADMIN** | 직원 정보 / 비밀번호 / 권한 수정 |
| | `DELETE`| `/api/users/[id]` | **ADMIN** | 직원 계정 삭제 |
| **고객사** | `GET` | `/api/companies` | User/Admin | 고객사 목록 조회 |
| | `POST` | `/api/companies` | User/Admin | 고객사 등록 |
| | `GET` | `/api/companies/[id]` | User/Admin | 고객사 상세 및 소속 프로젝트 목록 조회 |
| | `PUT` | `/api/companies/[id]` | User/Admin | 고객사 정보 수정 |
| | `DELETE`| `/api/companies/[id]` | User/Admin | 고객사 삭제 (하위 프로젝트/견적서 Cascade) |
| **프로젝트**| `GET` | `/api/projects` | User/Admin | 프로젝트 목록 (고객사별 필터링 지원) |
| | `POST` | `/api/projects` | User/Admin | 프로젝트 등록 (전담 연락망 포함) |
| | `GET` | `/api/projects/[id]` | User/Admin | 프로젝트 상세 및 견적서 이력 조회 |
| | `PUT` | `/api/projects/[id]` | User/Admin | 프로젝트 및 담당자 연락처 수정 |
| | `DELETE`| `/api/projects/[id]` | User/Admin | 프로젝트 삭제 |
| **견적서** | `GET` | `/api/estimates` | User/Admin | 견적서 목록 (검색, 상태필터, 작성자 포함) |
| | `POST` | `/api/estimates` | User/Admin | 견적서 신규 생성 (작성자 자동 바인딩) |
| | `GET` | `/api/estimates/[id]` | User/Admin | 견적서 상세 데이터(인건비/물품/경비) 조회 |
| | `PUT` | `/api/estimates/[id]` | User/Admin | 견적서 수정 (**타인 수정 시 자동 마이너 버전 분기**) |
| | `DELETE`| `/api/estimates/[id]` | User/Admin | 견적서 삭제 |
| | `POST` | `/api/estimates/[id]/duplicate`| User/Admin | 견적서 버전 복제 (Major +1.0 / Minor +0.1) |
| | `GET` | `/api/estimates/[id]/excel` | User/Admin | 공식 4개 시트 엑셀(.xlsx) 파일 다운로드 & 로그 적재 |
| | `POST` | `/api/estimates/[id]/log` | User/Admin | 견적서 열람/인쇄 이벤트 실시간 감사 로그 적재 |
| **보안/감사**| `GET` | `/api/audit-logs` | **ADMIN** | 전체 열람/인쇄/엑셀 감사 로그 조회 및 필터링 |
| **대시보드**| `GET` | `/api/dashboard` | User/Admin | 총 견적액, 수주현황, 최근 견적 목록 집계 통계 |
| **마스터설정**| `GET` | `/api/settings` | User/Admin | KOSA 노임단가 및 공급자 사업자정보 조회 |
| | `PUT` | `/api/settings` | **ADMIN** | 공급자 회사정보 및 노임단가 수정 |

---

## 3. 주요 핵심 API 상세 명세

### 3.1 견적서 수정 및 자동 버전 분기 (`PUT /api/estimates/[id]`)

* **설명**: 견적서 데이터를 수정합니다. 요청자가 견적서 원작성자와 다를 경우 **기존 견적서를 보존하고 `v1.1`로 신규 분기 생성**합니다.
* **Request Body (JSON)**:
```json
{
  "title": "2026 차세대 포털 견적서 (수정안)",
  "status": "DRAFT",
  "overheadRate": 110.0,
  "technicalRate": 20.0,
  "profitRate": 25.0,
  "vatRate": 10.0,
  "discountAmount": 5000000,
  "paymentTerms": "선금 40%, 잔금 60%",
  "remarks": "납기 4개월 준수 조건",
  "validUntil": "2026-09-30",
  "labors": [
    { "role": "PM", "grade": "총괄관리자(PM)", "manMonths": 1.0, "unitPrice": 11500000, "totalPrice": 11500000, "sortOrder": 0 }
  ],
  "items": [
    { "category": "패키지 소프트웨어", "name": "보안 솔루션", "spec": "v3.0", "unit": "EA", "quantity": 1, "unitPrice": 15000000, "discountRate": 10, "totalPrice": 13500000, "sortOrder": 0 }
  ],
  "expenses": [
    { "category": "여비교통비/출장비", "description": "원격지 지원 출장 5회", "amount": 1500000, "sortOrder": 0 }
  ]
}
```

* **Response Body (작성자 본인 수정 시)**:
```json
{
  "success": true,
  "branched": false,
  "id": "cmt7vdjl20002tfdjmu9ukm5j",
  "version": 1.0,
  "message": "견적서가 저장되었습니다."
}
```

* **Response Body (타 사용자가 수정 시 자동 분기)**:
```json
{
  "success": true,
  "branched": true,
  "id": "cmt7vdjo10006tfdjnvp68qxr",
  "version": 1.1,
  "parentEstimateId": "cmt7vdjl20002tfdjmu9ukm5j",
  "changeReason": "[김수석 수석엔지니어] 님이 원본(v1.0, 홍길동 팀장) 수정 시 자동 마이너 버전(v1.1) 분기 생성",
  "author": { "name": "김수석", "position": "수석엔지니어" },
  "message": "작성자가 달라 v1.1 마이너 버전으로 신규 분기 저장되었습니다."
}
```

---

### 3.2 관리자 전용 보안 감사 로그 조회 (`GET /api/audit-logs`)

* **설명**: 시스템 관리자(`ADMIN`)가 전사 견적서 열람, 인쇄, 엑셀 다운로드 이력을 조회합니다. (일반 직원은 403 차단)
* **Response Body (JSON)**:
```json
[
  {
    "id": "cmt7vdjo40008tfdju6i7r6l9",
    "action": "EDIT_ATTEMPT",
    "userName": "김수석",
    "userDept": "SI개발팀",
    "ipAddress": "172.18.0.1",
    "userAgent": "Mozilla/5.0 ...",
    "createdAt": "2026-08-24T23:31:01.210Z",
    "estimate": {
      "estimateNumber": "EST-20260824-003",
      "version": 1.0,
      "title": "홍길동 팀장 작성 견적서 v1.0",
      "project": {
        "title": "차세대 고객 포털",
        "company": { "name": "(주)한국글로벌" }
      }
    }
  }
]
```
