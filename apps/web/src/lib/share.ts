import { sanitizeOptions, type FormatOptions } from "@sqlfmt/core";

/** 옵션을 URL-safe base64 문자열로 인코딩 (공유 링크용) */
export function encodeOptions(options: FormatOptions): string {
  const json = JSON.stringify(options);
  // UTF-8 안전 base64 → URL-safe 치환
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 공유 링크의 base64 문자열을 안전한 FormatOptions 로 디코딩. 실패 시 null */
export function decodeOptions(encoded: string): FormatOptions | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    return sanitizeOptions(JSON.parse(json));
  } catch {
    return null;
  }
}

/** 현재 옵션을 담은 공유 URL 생성 */
export function buildShareUrl(options: FormatOptions): string {
  const url = new URL(window.location.href);
  url.searchParams.set("opts", encodeOptions(options));
  return url.toString();
}
