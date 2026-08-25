# [산출물-08] 시스템 설치 및 배포/운영자 가이드 (Deployment & Operation Guide)

---

## 1. 시스템 요구사항 (System Requirements)

| 항목 | 최소 사양 | 권장 사양 |
| :--- | :--- | :--- |
| **운영체제 (OS)** | Windows 10/11, macOS 12+, Ubuntu 20.04+ LTS | Linux Ubuntu 22.04 LTS 또는 Windows Server 2022 |
| **CPU** | 2 Core 이상 | 4 Core 이상 |
| **Memory (RAM)** | 4 GB 이상 | 8 GB 이상 |
| **Storage** | 10 GB 이상의 여유 디스크 공간 | SSD 50 GB 이상 |
| **필수 소프트웨어** | Docker Engine 24.0+, Docker Compose v2.20+ | Docker Desktop 또는 Docker CE |

---

## 2. 포트 구성 및 네트워크 아키텍처

| 서비스명 | 내부 포트 | 호스트 바인딩 포트 | 프로토콜 | 설명 |
| :--- | :---: | :---: | :---: | :--- |
| **`app`** | 3000 | **3300** | HTTP | 견적 관리 시스템 메인 웹 애플리케이션 |
| **`studio`** | 5555 | **5555** | HTTP | 웹 데이터베이스 브라우저 (Prisma Studio GUI) |
| **`db`** | 5432 | **5432** | TCP | PostgreSQL 16 데이터베이스 |

---

## 3. 원클릭 설치 및 배포 절차

### 3.1 소스코드 클론 및 환경설정 파일 준비
```bash
# 1. 저장소 복제
git clone https://github.com/boheni07/estimates.git
cd estimates

# 2. .env 환경설정 확인 (기본값 설정 완료)
# DATABASE_URL="postgresql://estimate_user:estimate_pass_2026@db:5432/estimate_db?schema=public"
# JWT_SECRET="estimate-secret-jwt-key-2026-antigravity"
```

### 3.2 Docker Compose 빌드 및 백그라운드 실행
```bash
# Docker 이미지 빌드 및 컨테이너 기동
docker compose up -d --build

# 실행 상태 확인
docker compose ps
```

### 3.3 자동 초기화 과정 (`docker-entrypoint.sh`)
컨테이너가 시작되면 다음 작업이 완전 자동으로 수행됩니다:
1. `npx prisma db push`: PostgreSQL 스키마 자동 동기화
2. `node prisma/seed.js`: 초기 시스템 관리자(`admin`/`password`), KOSA 2026 표준 노임단가, 공급자 회사 정보 자동 적재
3. `server.js`: Next.js Standalone 고성능 웹 서버 구동

---

## 4. 시스템 운영 및 유지보수 가이드

### 4.1 초기 계정 및 접속 정보
* **시스템 관리자**: ID `admin` / PW `password` (ADMIN 권한)
* **샘플 직원 계정**: ID `hong` / PW `password` (사업개발팀 홍길동 팀장)
* **샘플 엔지니어 계정**: ID `kim` / PW `password` (SI개발팀 김수석 엔지니어)
* **웹 메인 접속 URL**: `http://localhost:3300`
* **웹 DB GUI 접속 URL**: `http://localhost:5555`

### 4.2 데이터베이스 백업 및 복구 (Backup & Restore)
```bash
# 1. DB 백업 (덤프 파일 생성)
docker compose exec -t db pg_dump -U estimate_user -d estimate_db > backup_$(date +%Y%m%d).sql

# 2. DB 복구 (덤프 파일 복원)
cat backup_20260825.sql | docker compose exec -i db psql -U estimate_user -d estimate_db
```

### 4.3 컨테이너 재기동 및 로그 확인
```bash
# 실시간 애플리케이션 로그 모니터링
docker compose logs -f app

# 컨테이너 서비스 재시작
docker compose restart
```
