# PROGRESS — SQL Formatter (웹 MVP, Phase 1)

> PRD: [PRD-sql-formatter-260608.md](PRD-sql-formatter-260608.md) · Phase 1(F-01~F-09)만 구현. Nice/Phase 2/3 손대지 않음.
> 비범위 가드레일: 서버 저장 / 로그인 / 결제 / AI / 다국어 / SQL 실행·DB 연결 (5.3 O-01~O-07) — 작성 금지.

## 확정된 결정 ([확인필요] 해소)
- C-01 에디터: **CodeMirror 6**
- C-04 분석: **도입 안함** (런타임 시크릿/환경변수 없음)
- C-05 UI 언어: **한국어**

## 기술 스택 (PRD 7)
pnpm + Turborepo 모노레포 / `packages/core`(엔진) + `apps/web`(Next.js App Router + TS) / Tailwind + shadcn/ui / sql-formatter(npm) / Zustand(persist) / CodeMirror 6

## 작업 체크리스트

### 0. 인프라
- [x] 모노레포 스캐폴드 (pnpm-workspace, turbo, root tsconfig)

### 1. packages/core (엔진, 프레임워크 비의존 → VSCode 재사용)
- [x] FormatOptions 타입 + 기본값 (PRD 6.2)
- [x] `formatSql(input, options)` — sql-formatter 래퍼, leading comma 후처리, 안전 에러 처리
- [x] 단위 테스트 7개 통과 (케이스/들여쓰기/콤마/방언/에러)

### 2. apps/web 기능
| 기능 | 설명 | 인수 | 상태 |
|--|--|--|--|
| F-01 | 듀얼 에디터(CodeMirror, SQL 강조) | AC-01 | [x] |
| F-02 | 즉시 포맷(200ms 디바운스) | AC-01 | [x] |
| F-03 | 결과 복사 + 복사됨 표시 | AC-01 | [x] |
| F-04 | 방언 선택(8종) | AC-03 | [x] |
| F-05 | 옵션 패널(아코디언 3그룹, 5.4의 13종) | AC-02 | [x] |
| F-06 | localStorage 영속(Zustand persist) | AC-02 | [x] |
| F-07 | 비우기 / 옵션 초기화 | — | [x] |
| F-08 | 파싱 에러 안전 처리(원문 보존) | AC-04 | [x] |
| F-09 | 반응형(lg 좌우 / 모바일 상하) | AC-05 | [x] |
| /about | 프라이버시 고지 | AC-06 | [x] |

## 인수 시나리오 검증 (PRD 12)
- [x] AC-01 포맷→복사 (브라우저 실측: 예시 입력→키워드 대문자/들여쓰기 정상)
- [x] AC-02 옵션 변경 + 새로고침 후 복원 (tabWidth 4 영속 확인)
- [x] AC-03 PostgreSQL `::` 캐스팅 (core 단위 테스트)
- [x] AC-04 깨진 SQL 에러 안전 (core 단위 테스트, 원문 보존)
- [x] AC-05 모바일 상하 배치 (~800px 뷰포트 적층 렌더 확인)
- [x] AC-06 입력 SQL 외부 비전송 (네트워크: localhost GET만, POST/외부 없음)

## 빌드/검증 결과
- `pnpm --filter @sqlfmt/core test` → 7 passed
- `pnpm --filter web build` → 컴파일·타입체크 통과, 3페이지 정적 생성, First Load JS 184kB(/)
- 실행: `pnpm --filter web dev` (포트 3000)

## Phase 2 (확장 기능) — 완료
| ID | 기능 | 구현 | 검증 |
|--|--|--|--|
| N-02 | 프리셋 공유/내보내기/가져오기 | 공유 URL(`?opts=` base64) + 옵션 JSON 내보내기/가져오기, `sanitizeOptions` 검증 | URL 라운드트립 적용·파라미터 제거 / JSON import 적용 확인 |
| N-03 | 포맷 전후 Diff 뷰 | `diff` 라이브러리, 결과 영역 Diff 토글 | 빨강(-)/초록(+) 라인 렌더 확인 |
| N-04 | 다크 모드 | `useThemeStore`(영속) + Tailwind class + CM 테마 + FOUC 방지 스크립트 | 전체 UI/에디터 다크 전환 확인 |
| N-05 | 고급 옵션(AS 별칭 정렬) | core `alignSelectAliases` 후처리, 옵션 패널 "고급" 그룹 | core 테스트 + 브라우저 정렬 확인 |
| N-06 | .sql 파일 업로드/다운로드 | 입력 .sql 열기 / 결과 .sql 저장 / 옵션 JSON 입출력 | 업로드→입력교체→포맷, 다운로드 파일명·내용 확인 |

- core 단위 테스트 **11/11 통과** (alignAliases·sanitizeOptions 추가)
- 웹 빌드 통과 (First Load 187kB)
- 비범위 가드레일 유지: 여전히 서버/DB/인증/AI/SQL실행 없음, 전 클라이언트 처리

## 배포 (형제 프로젝트 규약 준수: 맥미니 + Docker Compose + edge_shared + cloudflared)
- 산출물: `Dockerfile`(pnpm 모노레포 → Next standalone), `docker-compose.yml`(name `sql-formatter`, 포트 **3700**), `.dockerignore`, `scripts/deploy.sh`, `.github/workflows/deploy.yml`, `/healthz` 라우트
- 포트: 3100~3600 사용 중 → **3700** 채택 / 도메인: **sql.myazit.kr**
- ✅ `docker compose up -d --build` 성공 → `sql-formatter-frontend` 컨테이너 **Up**, edge_shared 합류
- ✅ `/healthz` → ok (컨테이너·호스트), 메인 페이지 HTTP 200
- ✅ GitHub Public 레포 생성+push: https://github.com/ksheo71/sql-formatter (main)
- ✅ 배포 트리 클론: `/opt/stack/services/public/myazit.kr/sql-formatter/repo`
- ✅ **self-hosted 러너 설치**: `kyle-mini-sql` (online), launchd 서비스 `actions.runner.ksheo71-sql-formatter.kyle-mini-sql` — 재부팅 자동 실행
- ✅ **CI/CD 자동배포 검증 완료**: main push 2건 → 워크플로 `Deploy to sql.myazit.kr` 모두 success (러너가 deploy.sh 자동 실행)
- ⛔ 남은 단계(사용자 직접): **Cloudflare Zero Trust 대시보드** Public Hostname 추가: `sql.myazit.kr` → `http://sql-formatter-frontend:3700` (cloudflared 토큰 모드라 CLI 불가)

## 로그
- 2026-06-09: PRD 분석 완료, [확인필요] 5건 모두 해소, 작업 계획 수립.
- 2026-06-09: Phase 1 전체(F-01~F-09 + /about) 구현·검증 완료. AC-01~AC-06 통과.
- 2026-06-09: Phase 2 전체(N-02~N-06) 구현·브라우저 검증 완료.
- 2026-06-09: 형제 규약대로 Docker 배포 구성 작성, 컨테이너 기동·헬스체크 검증(포트 3700, edge_shared).
