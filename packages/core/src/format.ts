import { format as sqlFormat } from "sql-formatter";
import type { FormatOptions, FormatResult } from "./types";
import {
  CASE_VALUES,
  COMMA_POSITION_VALUES,
  DEFAULT_OPTIONS,
  DIALECT_VALUES,
  INDENT_STYLE_VALUES,
  LOGICAL_OP_VALUES,
} from "./defaults";

/**
 * SQL 포맷팅 엔진 래퍼.
 * - 검증된 OSS 라이브러리(sql-formatter)를 호출하고, 라이브러리가 직접 지원하지 않는
 *   옵션(leading comma)은 포맷 결과에 대한 라인 기반 후처리로 보완한다 (PRD 5.4 / R-01).
 * - 파싱 실패 시 예외를 잡아 원문을 그대로 반환한다 (PRD F-08 / AC-04).
 * - 외부 네트워크 호출 없음 — 전적으로 클라이언트에서 동작 (PRD O-01 / AC-06).
 */
export function formatSql(input: string, options: FormatOptions): FormatResult {
  if (!input.trim()) {
    return { ok: true, output: "", error: null };
  }

  try {
    let output = sqlFormat(input, {
      language: options.dialect,
      tabWidth: options.tabWidth,
      useTabs: options.useTabs,
      keywordCase: options.keywordCase,
      identifierCase: options.identifierCase,
      dataTypeCase: options.dataTypeCase,
      functionCase: options.functionCase,
      indentStyle: options.indentStyle,
      logicalOperatorNewline: options.logicalOperatorNewline,
      expressionWidth: options.expressionWidth,
      linesBetweenQueries: options.linesBetweenQueries,
      denseOperators: options.denseOperators,
      newlineBeforeSemicolon: options.newlineBeforeSemicolon,
    });

    if (options.commaPosition === "leading") {
      output = toLeadingCommas(output);
    }
    if (options.alignAliases) {
      output = alignSelectAliases(output);
    }

    return { ok: true, output, error: null };
  } catch (e) {
    return {
      ok: false,
      output: input,
      error: e instanceof Error ? e.message : "SQL을 포맷할 수 없습니다.",
    };
  }
}

/**
 * 줄 끝 콤마(trailing) → 줄 앞 콤마(leading) 변환.
 * 이미 포맷되어 목록 항목이 한 줄씩 분리된 출력에 대해서만 동작하는 휴리스틱이다.
 * (문자열 리터럴은 보통 따옴표로 끝나므로 줄 끝 콤마 매칭에 걸리지 않는다.)
 */
function toLeadingCommas(sql: string): string {
  const lines = sql.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    if (!/,\s*$/.test(line)) continue;

    lines[i] = line.replace(/,\s*$/, "");

    const next = lines[i + 1];
    const match = /^(\s*)(.*)$/.exec(next);
    if (!match) continue;
    const indent = match[1];
    const content = match[2];
    // 콤마 2칸을 앞에 두기 위해 들여쓰기를 2칸 줄여 컬럼 정렬을 유지한다.
    const newIndent = indent.length >= 2 ? indent.slice(2) : indent;
    lines[i + 1] = `${newIndent}, ${content}`;
  }
  return lines.join("\n");
}

/** ` AS `(대소문자 무관) 별칭이 있는 라인: 들여쓰기/표현식/AS/별칭 분해 */
const ALIAS_RE = /^(\s*)(.*\S)(\s+)(AS|As|aS|as)(\s+)(\S.*)$/;

/**
 * 연속된 `AS` 별칭 라인을 같은 열에 정렬한다 (sqlinform Align Token / PRD N-05).
 * 이미 한 줄에 한 컬럼씩 분리된 포맷 결과에 대해서만 동작하는 후처리이며,
 * 2줄 이상 연속될 때만 정렬한다.
 */
function alignSelectAliases(sql: string): string {
  const lines = sql.split("\n");
  let i = 0;
  while (i < lines.length) {
    const group: number[] = [];
    let j = i;
    while (j < lines.length && ALIAS_RE.test(lines[j])) {
      group.push(j);
      j++;
    }

    if (group.length >= 2) {
      let maxLeft = 0;
      const parsed = group.map((k) => {
        const m = ALIAS_RE.exec(lines[k])!;
        return { k, left: m[1] + m[2], as: m[4], rest: m[6] };
      });
      for (const p of parsed) maxLeft = Math.max(maxLeft, p.left.length);
      for (const p of parsed) {
        lines[p.k] = `${p.left.padEnd(maxLeft)} ${p.as} ${p.rest}`;
      }
    }

    i = group.length ? j : i + 1;
  }
  return lines.join("\n");
}

/**
 * 임의의 입력(JSON/URL 파라미터)을 안전한 FormatOptions 로 정규화한다.
 * 알 수 없거나 잘못된 값은 기본값으로 대체한다 (PRD N-02 프리셋 가져오기/공유 링크용).
 */
export function sanitizeOptions(raw: unknown): FormatOptions {
  const o: Record<string, unknown> =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const pick = <T extends string>(
    v: unknown,
    allowed: readonly T[],
    def: T,
  ): T =>
    typeof v === "string" && (allowed as readonly string[]).includes(v)
      ? (v as T)
      : def;

  const int = (v: unknown, min: number, max: number, def: number): number => {
    const n = typeof v === "number" ? v : parseInt(String(v), 10);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
  };

  const bool = (v: unknown, def: boolean): boolean =>
    typeof v === "boolean" ? v : def;

  return {
    dialect: pick(o.dialect, DIALECT_VALUES, DEFAULT_OPTIONS.dialect),
    keywordCase: pick(o.keywordCase, CASE_VALUES, DEFAULT_OPTIONS.keywordCase),
    identifierCase: pick(
      o.identifierCase,
      CASE_VALUES,
      DEFAULT_OPTIONS.identifierCase,
    ),
    dataTypeCase: pick(o.dataTypeCase, CASE_VALUES, DEFAULT_OPTIONS.dataTypeCase),
    functionCase: pick(o.functionCase, CASE_VALUES, DEFAULT_OPTIONS.functionCase),
    tabWidth: int(o.tabWidth, 1, 8, DEFAULT_OPTIONS.tabWidth),
    useTabs: bool(o.useTabs, DEFAULT_OPTIONS.useTabs),
    indentStyle: pick(
      o.indentStyle,
      INDENT_STYLE_VALUES,
      DEFAULT_OPTIONS.indentStyle,
    ),
    commaPosition: pick(
      o.commaPosition,
      COMMA_POSITION_VALUES,
      DEFAULT_OPTIONS.commaPosition,
    ),
    logicalOperatorNewline: pick(
      o.logicalOperatorNewline,
      LOGICAL_OP_VALUES,
      DEFAULT_OPTIONS.logicalOperatorNewline,
    ),
    expressionWidth: int(o.expressionWidth, 20, 200, DEFAULT_OPTIONS.expressionWidth),
    linesBetweenQueries: int(o.linesBetweenQueries, 0, 5, DEFAULT_OPTIONS.linesBetweenQueries),
    denseOperators: bool(o.denseOperators, DEFAULT_OPTIONS.denseOperators),
    newlineBeforeSemicolon: bool(
      o.newlineBeforeSemicolon,
      DEFAULT_OPTIONS.newlineBeforeSemicolon,
    ),
    alignAliases: bool(o.alignAliases, DEFAULT_OPTIONS.alignAliases),
  };
}
