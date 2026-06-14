"use client";

import { cn } from "@/lib/utils";

/** 버튼 */
export function Button({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 h-9 px-3";
  const variants = {
    default:
      "bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white",
    outline:
      "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
    ghost:
      "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  } as const;
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

/** 라벨 + 컨트롤 한 줄 */
export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <label htmlFor={htmlFor} className="text-sm text-slate-600 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

/** 셀렉트 */
export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-8 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

/** 숫자 입력 */
export function NumberInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      className={cn(
        "h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

/** 토글 스위치 */
export function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
        checked
          ? "bg-slate-900 dark:bg-slate-100"
          : "bg-slate-300 dark:bg-slate-600",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/** 접이식 옵션 그룹 (sqlinform식 카테고리 아코디언) */
export function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="border-b border-slate-200 last:border-b-0 dark:border-slate-700"
    >
      <summary className="cursor-pointer select-none py-2.5 text-sm font-semibold text-slate-800 marker:content-[''] dark:text-slate-100">
        {title}
      </summary>
      <div className="pb-2 pl-1">{children}</div>
    </details>
  );
}
