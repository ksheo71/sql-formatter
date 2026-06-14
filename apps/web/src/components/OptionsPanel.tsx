"use client";

import { DIALECTS, type FormatOptions, type LetterCase } from "@sqlfmt/core";
import { useFormatterStore } from "@/store/useFormatterStore";
import { Accordion, Field, NumberInput, Select, Toggle } from "@/components/ui";

const CASE_OPTIONS: { value: LetterCase; label: string }[] = [
  { value: "upper", label: "UPPER" },
  { value: "lower", label: "lower" },
  { value: "preserve", label: "원본 유지" },
];

type CaseField = "keywordCase" | "identifierCase" | "dataTypeCase" | "functionCase";

/** LetterCase 셀렉트 헬퍼 */
function CaseSelect({
  field,
  value,
}: {
  field: CaseField;
  value: LetterCase;
}) {
  const setOption = useFormatterStore((s) => s.setOption);
  return (
    <Select
      value={value}
      onChange={(e) => setOption(field, e.target.value as LetterCase)}
    >
      {CASE_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}

export default function OptionsPanel() {
  const options = useFormatterStore((s) => s.options);
  const setOption = useFormatterStore((s) => s.setOption);

  return (
    <div className="px-3">
      {/* 일반 (General) */}
      <Accordion title="일반" defaultOpen>
        <Field label="방언 (Dialect)">
          <Select
            value={options.dialect}
            onChange={(e) =>
              setOption("dialect", e.target.value as FormatOptions["dialect"])
            }
          >
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="들여쓰기 크기">
          <NumberInput
            min={1}
            max={8}
            value={options.tabWidth}
            onChange={(e) =>
              setOption("tabWidth", clampInt(e.target.value, 1, 8, 2))
            }
          />
        </Field>
        <Field label="탭 문자 사용">
          <Toggle
            checked={options.useTabs}
            onChange={(v) => setOption("useTabs", v)}
          />
        </Field>
        <Field label="들여쓰기 스타일">
          <Select
            value={options.indentStyle}
            onChange={(e) =>
              setOption(
                "indentStyle",
                e.target.value as FormatOptions["indentStyle"],
              )
            }
          >
            <option value="standard">standard</option>
            <option value="tabularLeft">tabularLeft</option>
            <option value="tabularRight">tabularRight</option>
          </Select>
        </Field>
      </Accordion>

      {/* 대소문자 (Upper/Lower) */}
      <Accordion title="대소문자">
        <Field label="키워드">
          <CaseSelect field="keywordCase" value={options.keywordCase} />
        </Field>
        <Field label="식별자">
          <CaseSelect field="identifierCase" value={options.identifierCase} />
        </Field>
        <Field label="데이터 타입">
          <CaseSelect field="dataTypeCase" value={options.dataTypeCase} />
        </Field>
        <Field label="함수">
          <CaseSelect field="functionCase" value={options.functionCase} />
        </Field>
      </Accordion>

      {/* 목록 / 줄바꿈 (Lists / White Spaces / Conditions) */}
      <Accordion title="목록 / 줄바꿈">
        <Field label="콤마 위치">
          <Select
            value={options.commaPosition}
            onChange={(e) =>
              setOption(
                "commaPosition",
                e.target.value as FormatOptions["commaPosition"],
              )
            }
          >
            <option value="trailing">줄 끝 (trailing)</option>
            <option value="leading">줄 앞 (leading)</option>
          </Select>
        </Field>
        <Field label="논리 연산자 줄바꿈">
          <Select
            value={options.logicalOperatorNewline}
            onChange={(e) =>
              setOption(
                "logicalOperatorNewline",
                e.target.value as FormatOptions["logicalOperatorNewline"],
              )
            }
          >
            <option value="before">연산자 앞 (before)</option>
            <option value="after">연산자 뒤 (after)</option>
          </Select>
        </Field>
        <Field label="표현식 줄폭">
          <NumberInput
            min={20}
            max={200}
            value={options.expressionWidth}
            onChange={(e) =>
              setOption("expressionWidth", clampInt(e.target.value, 20, 200, 50))
            }
          />
        </Field>
        <Field label="쿼리 간 빈 줄">
          <NumberInput
            min={0}
            max={5}
            value={options.linesBetweenQueries}
            onChange={(e) =>
              setOption("linesBetweenQueries", clampInt(e.target.value, 0, 5, 1))
            }
          />
        </Field>
        <Field label="연산자 밀집">
          <Toggle
            checked={options.denseOperators}
            onChange={(v) => setOption("denseOperators", v)}
          />
        </Field>
        <Field label="세미콜론 앞 줄바꿈">
          <Toggle
            checked={options.newlineBeforeSemicolon}
            onChange={(v) => setOption("newlineBeforeSemicolon", v)}
          />
        </Field>
      </Accordion>

      {/* 고급 (후처리, sqlinform Align Token 등) */}
      <Accordion title="고급">
        <Field label="AS 별칭 정렬">
          <Toggle
            checked={options.alignAliases}
            onChange={(v) => setOption("alignAliases", v)}
          />
        </Field>
        <p className="pb-1 text-xs text-slate-400 dark:text-slate-500">
          연속된 AS 별칭을 같은 열에 맞춰 정렬합니다.
        </p>
      </Accordion>
    </div>
  );
}

function clampInt(raw: string, min: number, max: number, fallback: number): number {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
