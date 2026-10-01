import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';
import { I18nProvider } from '../components/I18nProvider';
import type { FavoritesApi } from '../hooks/useFavorites';
import type { ProgressApi } from '../hooks/useProgress';
import { sameRef, type FavoriteRef } from '../lib/favorites';
import { normalizeContent } from '../lib/normalize';
import { demoContent } from '../mock/demoContent';
import type { ContentPayload } from '../types/content';

export function renderI18n(ui: ReactElement, language = 'en') {
  return render(<I18nProvider language={language}>{ui}</I18nProvider>);
}

export function fakeFavorites(initial: FavoriteRef[] = []) {
  const api = {
    favorites: initial,
    isFavorite: (ref: FavoriteRef) => initial.some((f) => sameRef(f, ref)),
    toggle: vi.fn(),
    clear: vi.fn(),
  };
  return api satisfies FavoritesApi;
}

export function fakeProgress(completed: string[] = []) {
  const api = {
    completed: new Set(completed) as ReadonlySet<string>,
    toggle: vi.fn(),
    reset: vi.fn(),
  };
  return api satisfies ProgressApi;
}

/** Demo content passed through the same normalizer the app uses. */
export function content(overrides: Partial<ContentPayload> = {}): ContentPayload {
  return normalizeContent({ ...demoContent, ...overrides });
}
