"use client";

import { useMemo } from "react";
import { diffLines } from "diff";
import { cn } from "@/lib/utils";

/** 포맷 전/후 라인 단위 Diff 뷰 (PRD N-03) */
export default function DiffView({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  const rows = useMemo(() => {
    const parts = diffLines(before || "", after || "");
    const out: { type: "add" | "del" | "ctx"; text: string }[] = [];
    for (const part of parts) {
      const type = part.added ? "add" : part.removed ? "del" : "ctx";
      const lines = part.value.replace(/\n$/, "").split("\n");
      for (const line of lines) out.push({ type, text: line });
    }
    return out;
  }, [before, after]);

  return (
    <div className="h-full overflow-auto rounded-md border border-slate-300 bg-white font-mono text-[13px] leading-5 dark:border-slate-600 dark:bg-slate-900">
      {rows.map((r, i) => (
        <div
          key={i}
          className={cn(
            "flex whitespace-pre-wrap px-2",
            r.type === "add" &&
              "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300",
            r.type === "del" &&
              "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300",
            r.type === "ctx" && "text-slate-600 dark:text-slate-400",
          )}
        >
          <span className="mr-2 select-none text-slate-400">
            {r.type === "add" ? "+" : r.type === "del" ? "-" : " "}
          </span>
          <span className="flex-1">{r.text || " "}</span>
        </div>
      ))}
    </div>
  );
}
