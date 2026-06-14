/**
 * 포맷 옵션 타입 — PRD 6.2 / 5.4 기준.
 * 프레임워크 비의존. 웹 앱과 향후 VSCode 확장이 공통으로 사용한다.
 */

/** 지원 SQL 방언 (PRD 7.3). 값은 sql-formatter `language` 값과 1:1 매핑된다. */
export type SqlDialect =
  | "sql"
  | "mysql"
  | "mariadb"
  | "postgresql"
  | "tsql"
  | "plsql"
  | "sqlite"
  | "bigquery";

/** 대소문자 변환 */
export type LetterCase = "upper" | "lower" | "preserve";

/** 들여쓰기 스타일 (sqlinform Align Token/Keyword 대응) */
export type IndentStyle = "standard" | "tabularLeft" | "tabularRight";

/** 콤마 위치 (sqlinform Lists 대응) */
export type CommaPosition = "trailing" | "leading";

/** 논리 연산자 줄바꿈 위치 (sqlinform Conditions 대응) */
export type LogicalOperatorNewline = "before" | "after";

/** PRD 6.2 FormatOptions 엔티티 */
export interface FormatOptions {
  dialect: SqlDialect;
  keywordCase: LetterCase;
  identifierCase: LetterCase;
  dataTypeCase: LetterCase;
  functionCase: LetterCase;
  /** 들여쓰기 공백 수 */
  tabWidth: number;
  /** 탭 문자 사용 여부 */
  useTabs: boolean;
  indentStyle: IndentStyle;
  commaPosition: CommaPosition;
  logicalOperatorNewline: LogicalOperatorNewline;
  /** 표현식 최대 줄폭(wrap) */
  expressionWidth: number;
  /** 쿼리 사이 빈 줄 수 */
  linesBetweenQueries: number;
  /** 연산자 밀집 표기 */
  denseOperators: boolean;
  /** 세미콜론 앞 줄바꿈 */
  newlineBeforeSemicolon: boolean;
  /**
   * [고급/후처리] SELECT 목록에서 연속된 `AS` 별칭을 같은 열에 정렬한다
   * (sqlinform Align Token 대응). 라이브러리 미지원 → 포맷 결과 후처리.
   */
  alignAliases: boolean;
}

/** 포맷 결과. 실패 시 output 은 원문(input) 을 그대로 반환해 데이터 손실을 막는다 (PRD F-08). */
export interface FormatResult {
  ok: boolean;
  output: string;
  error: string | null;
}
