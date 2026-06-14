"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Eraser,
  FileUp,
  GitCompare,
  Link2,
  Moon,
  RotateCcw,
  Sun,
  Upload,
  Wand2,
} from "lucide-react";
import { formatSql, sanitizeOptions, type FormatResult } from "@sqlfmt/core";
import { useFormatterStore } from "@/store/useFormatterStore";
import { useThemeStore } from "@/store/useThemeStore";
import { buildShareUrl, decodeOptions } from "@/lib/share";
import { Button } from "@/components/ui";
import OptionsPanel from "@/components/OptionsPanel";

const SqlEditor = dynamic(() => import("@/components/SqlEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full rounded-md border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900" />
  ),
});
const DiffView = dynamic(() => import("@/components/DiffView"), { ssr: false });

const SAMPLE = `select u.id, u.name, count(o.id) as order_count from users u left join orders o on o.user_id=u.id where u.created_at > '2024-01-01' group by u.id, u.name having count(o.id)>3 order by order_count desc;`;

export default function Page() {
  const options = useFormatterStore((s) => s.options);
  const setOptions = useFormatterStore((s) => s.setOptions);
  const resetOptions = useFormatterStore((s) => s.resetOptions);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<FormatResult>({
    ok: true,
    output: "",
    error: null,
  });
  const [showDiff, setShowDiff] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const sqlFileRef = useRef<HTMLInputElement>(null);
  const optsFileRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 마운트 후: 공유 링크(?opts=)가 있으면 옵션 적용
  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("opts");
    if (encoded) {
      const decoded = decodeOptions(encoded);
      if (decoded) {
        setOptions(decoded);
        flash("공유된 옵션을 적용했습니다");
      }
      params.delete("opts");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (qs ? `?${qs}` : ""),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 테마 변경 시 <html> 클래스 토글
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // F-02 즉시 포맷팅 (디바운스)
  useEffect(() => {
    const id = setTimeout(() => setResult(formatSql(input, options)), 200);
    return () => clearTimeout(id);
  }, [input, options]);

  function flash(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  }

  async function handleCopy() {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      flash("결과를 복사했습니다");
    } catch {
      /* 권한 거부 시 무시 */
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(buildShareUrl(options));
      flash("공유 링크를 복사했습니다");
    } catch {
      /* 무시 */
    }
  }

  function download(filename: string, text: string, type: string) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadSql() {
    if (!result.output) return;
    download("formatted.sql", result.output, "text/plain;charset=utf-8");
  }

  function handleExportOptions() {
    download(
      "sqlfmt-options.json",
      JSON.stringify(options, null, 2),
      "application/json",
    );
    flash("옵션을 내보냈습니다");
  }

  async function handleSqlFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setInput(await file.text());
    e.target.value = "";
  }

  async function handleOptsFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setOptions(sanitizeOptions(JSON.parse(await file.text())));
        flash("옵션을 가져왔습니다");
      } catch {
        flash("옵션 파일을 읽을 수 없습니다");
      }
    }
    e.target.value = "";
  }

  return (
    <div className="flex h-screen flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          <h1 className="text-base font-semibold">SQL Formatter</h1>
          <span className="hidden text-xs text-slate-400 sm:inline">
            브라우저 안에서만 처리 · 서버 전송 없음
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={toggleTheme}
            aria-label="다크모드 전환"
            title="다크모드 전환"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Link
            href="/about"
            className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            소개
          </Link>
        </div>
      </header>

      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
        <Button variant="outline" onClick={() => setInput(SAMPLE)}>
          예시 넣기
        </Button>
        <Button variant="outline" onClick={() => sqlFileRef.current?.click()}>
          <FileUp className="h-4 w-4" /> .sql 열기
        </Button>
        <Button variant="outline" onClick={() => setInput("")}>
          <Eraser className="h-4 w-4" /> 비우기
        </Button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            variant={showDiff ? "default" : "outline"}
            onClick={() => setShowDiff((v) => !v)}
          >
            <GitCompare className="h-4 w-4" /> Diff
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Link2 className="h-4 w-4" /> 공유 링크
          </Button>
          <Button variant="outline" onClick={handleExportOptions} title="옵션 내보내기(JSON)">
            <Download className="h-4 w-4" /> 옵션
          </Button>
          <Button
            variant="outline"
            onClick={() => optsFileRef.current?.click()}
            title="옵션 가져오기(JSON)"
          >
            <Upload className="h-4 w-4" /> 가져오기
          </Button>
          <Button variant="outline" onClick={resetOptions}>
            <RotateCcw className="h-4 w-4" /> 초기화
          </Button>
          <Button onClick={handleCopy} disabled={!result.output}>
            <Copy className="h-4 w-4" /> 결과 복사
          </Button>
        </div>

        {/* 숨김 파일 입력 */}
        <input
          ref={sqlFileRef}
          type="file"
          accept=".sql,text/plain"
          className="hidden"
          onChange={handleSqlFile}
        />
        <input
          ref={optsFileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleOptsFile}
        />
      </div>

      {/* 본문 */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="shrink-0 overflow-y-auto border-b border-slate-200 bg-white py-2 dark:border-slate-700 dark:bg-slate-800 lg:w-72 lg:border-b-0 lg:border-r">
          {mounted && <OptionsPanel />}
        </aside>

        <main className="grid flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-2">
          <section className="flex min-h-[200px] flex-col">
            <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              입력 SQL
            </h2>
            <div className="min-h-0 flex-1">
              <SqlEditor
                value={input}
                onChange={setInput}
                dialect={options.dialect}
                theme={mounted && theme === "dark" ? "dark" : "light"}
                placeholder="여기에 SQL을 붙여넣으세요…"
                ariaLabel="입력 SQL"
              />
            </div>
          </section>

          <section className="flex min-h-[200px] flex-col">
            <h2 className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {showDiff ? "Diff (전 → 후)" : "결과"}
              {!result.ok && (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium normal-case text-red-700 dark:bg-red-950 dark:text-red-300">
                  포맷 실패 — 원문 표시
                </span>
              )}
              <button
                type="button"
                onClick={handleDownloadSql}
                disabled={!result.output}
                className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium normal-case text-slate-500 hover:text-slate-900 disabled:opacity-40 dark:text-slate-400 dark:hover:text-slate-100"
              >
                <Download className="h-3.5 w-3.5" /> .sql 저장
              </button>
            </h2>
            <div className="min-h-0 flex-1">
              {showDiff ? (
                <DiffView before={input} after={result.output} />
              ) : (
                <SqlEditor
                  value={result.output}
                  dialect={options.dialect}
                  theme={mounted && theme === "dark" ? "dark" : "light"}
                  readOnly
                  ariaLabel="포맷 결과"
                />
              )}
            </div>
            {!result.ok && result.error && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                {result.error}
              </p>
            )}
          </section>
        </main>
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md bg-slate-900 px-4 py-2 text-sm text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
          {toast}
        </div>
      )}
    </div>
  );
}
