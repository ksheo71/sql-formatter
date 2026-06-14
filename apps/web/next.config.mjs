import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 포맷 로직은 packages/core(@sqlfmt/core)의 TS 소스를 그대로 트랜스파일해 사용한다.
  transpilePackages: ["@sqlfmt/core"],
  // Docker 배포용: 의존성을 추적해 self-contained 서버를 생성한다.
  output: "standalone",
  // 모노레포 루트 기준으로 파일 추적(packages/core 포함).
  experimental: {
    outputFileTracingRoot: path.join(here, "../../"),
  },
};

export default nextConfig;
