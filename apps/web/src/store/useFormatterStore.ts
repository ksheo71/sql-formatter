import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_OPTIONS,
  OPTIONS_VERSION,
  type FormatOptions,
} from "@sqlfmt/core";

interface FormatterState {
  options: FormatOptions;
  setOption: <K extends keyof FormatOptions>(key: K, value: FormatOptions[K]) => void;
  setOptions: (options: FormatOptions) => void;
  resetOptions: () => void;
}

/**
 * 옵션 상태 + localStorage 영속 (PRD F-06, 키: sqlfmt.options).
 * 입력 SQL 은 저장하지 않는다 (PRD O-01 / 6.2 EditorState 비영속).
 */
export const useFormatterStore = create<FormatterState>()(
  persist(
    (set) => ({
      options: DEFAULT_OPTIONS,
      setOption: (key, value) =>
        set((s) => ({ options: { ...s.options, [key]: value } })),
      setOptions: (options) => set({ options }),
      resetOptions: () => set({ options: DEFAULT_OPTIONS }),
    }),
    {
      name: "sqlfmt.options",
      version: OPTIONS_VERSION,
      partialize: (s) => ({ options: s.options }),
      // 새 옵션 필드(예: alignAliases)가 추가돼도 기존 저장값과 안전하게 병합한다.
      merge: (persisted, current) => {
        const p = persisted as { options?: Partial<FormatOptions> } | undefined;
        return {
          ...current,
          options: { ...DEFAULT_OPTIONS, ...(p?.options ?? {}) },
        };
      },
    },
  ),
);
