import Link from "next/link";

export const metadata = {
  title: "소개 · SQL Formatter",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
        ← 포맷터로 돌아가기
      </Link>

      <h1 className="mt-6 text-2xl font-semibold">SQL Formatter 소개</h1>

      <p className="mt-4 leading-7 text-slate-700 dark:text-slate-300">
        붙여넣은 SQL을 일관된 스타일로 즉시 정렬해 주는 무료 도구입니다. 가입이나 설치가
        필요 없습니다.
      </p>

      <h2 className="mt-8 text-lg font-semibold">개인정보 처리 방식</h2>
      <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">
        모든 포맷팅은 <strong>여러분의 브라우저 안에서만</strong> 이루어집니다. 입력한 SQL은
        서버로 전송되지 않으며, 어디에도 저장되지 않습니다. 선택한 포맷 옵션만 다음 방문 시
        편의를 위해 브라우저 로컬 저장소(localStorage)에 보관됩니다.
      </p>

      <h2 className="mt-8 text-lg font-semibold">사용법</h2>
      <ol className="mt-3 list-decimal space-y-1 pl-5 leading-7 text-slate-700 dark:text-slate-300">
        <li>왼쪽(또는 위쪽) 에디터에 SQL을 붙여넣습니다.</li>
        <li>왼쪽 옵션 패널에서 방언·대소문자·들여쓰기 등을 조정합니다.</li>
        <li>오른쪽(또는 아래쪽)에 나타난 결과를 “결과 복사”로 가져갑니다.</li>
      </ol>

      <p className="mt-8 text-sm text-slate-400">
        포맷 엔진은 오픈소스 sql-formatter 를 사용합니다.
      </p>
    </div>
  );
}
