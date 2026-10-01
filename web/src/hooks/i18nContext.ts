import { createContext } from 'react';

export interface I18nContextValue {
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
  language: string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
