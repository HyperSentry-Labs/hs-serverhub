import { useMemo, type ReactNode } from 'react';
import { I18nContext, type I18nContextValue } from '../hooks/i18nContext';
import { directionFor, resolveLocale, translate } from '../i18n';

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
