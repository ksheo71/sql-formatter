import { describe, expect, it } from "vitest";
import { formatSql, sanitizeOptions } from "./format";
import { DEFAULT_OPTIONS } from "./defaults";
import type { FormatOptions } from "./types";

const opts = (over: Partial<FormatOptions> = {}): FormatOptions => ({
  ...DEFAULT_OPTIONS,
  ...over,
});

describe("formatSql", () => {
  it("빈 입력은 빈 출력을 반환한다", () => {
    expect(formatSql("   ", opts())).toEqual({ ok: true, output: "", error: null });
  });

  it("키워드를 대문자로 변환하고 들여쓰기한다", () => {
    const r = formatSql("select a,b from t", opts({ keywordCase: "upper", tabWidth: 2 }));
    expect(r.ok).toBe(true);
    expect(r.output).toContain("SELECT");
    expect(r.output).toContain("FROM");
    // 컬럼이 한 줄씩 분리되어 들여쓰기된다
    expect(r.output).toMatch(/SELECT\n {2}a,/);
  });

  it("키워드 소문자 변환", () => {
    const r = formatSql("SELECT A FROM T", opts({ keywordCase: "lower" }));
    expect(r.output.startsWith("select")).toBe(true);
  });

  // AC-03: PostgreSQL :: 캐스팅이 깨지지 않는다
  it("PostgreSQL :: 캐스팅을 보존한다", () => {
    const r = formatSql("select id::text from users", opts({ dialect: "postgresql" }));
    expect(r.ok).toBe(true);
    expect(r.output).toContain("::");
    expect(r.output.toLowerCase()).toContain("text");
  });

  // F-08 / AC-04: 어떤 입력에도 throw 하지 않고 FormatResult 를 반환 (안전망)
  it("이상한 입력에도 throw 하지 않고 결과 객체를 반환한다", () => {
    const r = formatSql("))) not really sql ((( ;;;", opts());
    expect(typeof r.output).toBe("string");
    expect(typeof r.ok).toBe("boolean");
    // 실패하면 원문을 보존한다
    if (!r.ok) {
      expect(r.output).toBe("))) not really sql ((( ;;;");
      expect(r.error).not.toBeNull();
    }
  });

  // F-05 / 5.4: leading comma 후처리
  it("leading comma 옵션은 콤마를 줄 앞으로 옮긴다", () => {
    const r = formatSql("select a, b, c from t", opts({ commaPosition: "leading" }));
    expect(r.ok).toBe(true);
    // trailing 콤마(', \n')가 없어야 하고, 줄 앞 콤마(', ')가 있어야 한다
    expect(r.output).toMatch(/\n\s*, b/);
    expect(r.output).toMatch(/\n\s*, c/);
    expect(r.output).not.toMatch(/a,\n/);
  });

  it("trailing comma(기본)는 콤마를 줄 끝에 둔다", () => {
    const r = formatSql("select a, b from t", opts({ commaPosition: "trailing" }));
    expect(r.output).toMatch(/a,\n/);
  });

  // N-05: AS 별칭 정렬 (고급 후처리)
  it("alignAliases 는 연속된 AS 별칭을 같은 열로 정렬한다", () => {
    const r = formatSql(
      "select id as user_id, full_name as name, created_at as ts from users",
      opts({ alignAliases: true, keywordCase: "upper" }),
    );
    expect(r.ok).toBe(true);
    const asCols = r.output
      .split("\n")
      .filter((l) => / AS /.test(l))
      .map((l) => l.indexOf(" AS "));
    expect(asCols.length).toBe(3);
    // 모든 AS 의 컬럼 위치가 동일해야 한다
    expect(new Set(asCols).size).toBe(1);
  });

  it("alignAliases off 면 정렬하지 않는다(기본 동작 유지)", () => {
    const r = formatSql(
      "select id as user_id, full_name as name from users",
      opts({ alignAliases: false }),
    );
    expect(r.ok).toBe(true);
    // 짧은 표현식 뒤에 정렬용 공백이 들어가지 않는다
    expect(r.output).toMatch(/\bid AS user_id/);
  });
});

describe("sanitizeOptions", () => {
  it("빈/잘못된 입력은 기본값으로 채운다", () => {
    expect(sanitizeOptions(null)).toEqual(DEFAULT_OPTIONS);
    expect(sanitizeOptions({})).toEqual(DEFAULT_OPTIONS);
  });

  it("유효한 값은 통과시키고 잘못된 값만 교정한다", () => {
    const result = sanitizeOptions({
      dialect: "postgresql",
      keywordCase: "lower",
      tabWidth: 999, // 범위 밖 → 8로 클램프
      denseOperators: "yes", // 잘못된 타입 → 기본값
      bogusField: 1, // 무시
    });
    expect(result.dialect).toBe("postgresql");
    expect(result.keywordCase).toBe("lower");
    expect(result.tabWidth).toBe(8);
    expect(result.denseOperators).toBe(DEFAULT_OPTIONS.denseOperators);
    expect(result).not.toHaveProperty("bogusField");
  });
});
