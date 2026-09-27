import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { directionFor, resolveLocale, translate } from '../i18n';

interface I18nContextValue {
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
  language: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ language, children }: { language: string; children: ReactNode }) {
  const value = useMemo<I18nContextValue>(() => {
    const dictionary = resolveLocale(language);
    return {
      t: (key, vars) => translate(dictionary, key, vars),
      dir: directionFor(language),
      language,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
