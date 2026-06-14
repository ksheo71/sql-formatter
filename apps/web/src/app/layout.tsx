import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SQL Formatter — 브라우저에서 즉시 SQL 정렬",
  description:
    "가입·설치 없이 브라우저에서 SQL을 붙여넣고 세밀한 옵션으로 즉시 포맷팅하세요. 모든 처리는 브라우저 안에서만 이루어집니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 페인트 전에 저장된 테마를 적용해 다크모드 깜빡임(FOUC)을 막는다.
  const themeScript = `(function(){try{var s=localStorage.getItem('sqlfmt.theme');if(s&&JSON.parse(s).state.theme==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
