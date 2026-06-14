"use client";

import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import {
  sql,
  PostgreSQL,
  MySQL,
  MSSQL,
  PLSQL,
  SQLite,
  StandardSQL,
  type SQLDialect,
} from "@codemirror/lang-sql";
import { useMemo } from "react";
import type { SqlDialect } from "@sqlfmt/core";

/** 앱의 방언 → CodeMirror lang-sql 방언 (구문 강조용) */
function toCmDialect(dialect: SqlDialect): SQLDialect {
  switch (dialect) {
    case "postgresql":
      return PostgreSQL;
    case "mysql":
    case "mariadb":
      return MySQL;
    case "tsql":
      return MSSQL;
    case "plsql":
      return PLSQL;
    case "sqlite":
      return SQLite;
    default:
      return StandardSQL;
  }
}

export default function SqlEditor({
  value,
  onChange,
  dialect,
  readOnly = false,
  placeholder,
  ariaLabel,
  theme = "light",
}: {
  value: string;
  onChange?: (value: string) => void;
  dialect: SqlDialect;
  readOnly?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  theme?: "light" | "dark";
}) {
  const extensions = useMemo(
    () => [sql({ dialect: toCmDialect(dialect) }), EditorView.lineWrapping],
    [dialect],
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={theme}
      editable={!readOnly}
      readOnly={readOnly}
      placeholder={placeholder}
      height="100%"
      aria-label={ariaLabel}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: !readOnly,
        foldGutter: false,
        autocompletion: false,
      }}
      className="h-full overflow-hidden rounded-md border border-slate-300 bg-white dark:border-slate-600"
    />
  );
}
