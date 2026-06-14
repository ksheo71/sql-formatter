import type {
  CommaPosition,
  FormatOptions,
  IndentStyle,
  LetterCase,
  LogicalOperatorNewline,
  SqlDialect,
} from "./types";

/** localStorage 스키마 버전 (PRD 6.2 version 필드 / 마이그레이션용) */
export const OPTIONS_VERSION = 1;

/** 기본 옵션 — 가장 보편적인 SQL 스타일 (키워드 대문자, 2칸 들여쓰기) */
export const DEFAULT_OPTIONS: FormatOptions = {
  dialect: "sql",
  keywordCase: "upper",
  identifierCase: "preserve",
  dataTypeCase: "upper",
  functionCase: "upper",
  tabWidth: 2,
  useTabs: false,
  indentStyle: "standard",
  commaPosition: "trailing",
  logicalOperatorNewline: "before",
  expressionWidth: 50,
  linesBetweenQueries: 1,
  denseOperators: false,
  newlineBeforeSemicolon: false,
  alignAliases: false,
};

/** 검증용 허용값 목록 (sanitizeOptions / UI 공용) */
export const DIALECT_VALUES: readonly SqlDialect[] = [
  "sql",
  "mysql",
  "mariadb",
  "postgresql",
  "tsql",
  "plsql",
  "sqlite",
  "bigquery",
];
export const CASE_VALUES: readonly LetterCase[] = ["upper", "lower", "preserve"];
export const INDENT_STYLE_VALUES: readonly IndentStyle[] = [
  "standard",
  "tabularLeft",
  "tabularRight",
];
export const COMMA_POSITION_VALUES: readonly CommaPosition[] = [
  "trailing",
  "leading",
];
export const LOGICAL_OP_VALUES: readonly LogicalOperatorNewline[] = [
  "before",
  "after",
];

/** UI 셀렉터용 방언 목록 (PRD 7.3) */
export const DIALECTS: { value: SqlDialect; label: string }[] = [
  { value: "sql", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "tsql", label: "T-SQL (SQL Server)" },
  { value: "plsql", label: "PL/SQL (Oracle)" },
  { value: "sqlite", label: "SQLite" },
  { value: "bigquery", label: "BigQuery" },
];
