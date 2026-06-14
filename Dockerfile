# SQL Formatter — Next.js(pnpm 모노레포) 프로덕션 이미지.
# 맥미니 운영: docker compose 가 이 Dockerfile 로 빌드 → next standalone 서버 (포트 3700).
# 공용 cloudflared 가 edge_shared 안에서 sql.myazit.kr → sql-formatter-frontend:3700 라우팅.
# 포맷팅은 전적으로 클라이언트에서 수행되며 런타임 비밀/외부 API 가 없다(PRD O-01).

# ---- 빌드 단계 ----
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

# 워크스페이스 매니페스트 먼저 복사 → 의존성 레이어 캐시
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json turbo.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# 소스 복사 후 web 빌드(standalone 출력)
COPY . .
RUN pnpm --filter web build

# ---- 실행 단계 ----
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3700
ENV HOSTNAME=0.0.0.0

# standalone 서버 + 정적 자산 + public 만 복사(self-contained)
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3700
CMD ["node", "apps/web/server.js"]
