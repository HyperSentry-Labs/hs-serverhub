import { useCallback, useMemo, useState } from 'react';
import {
  loadFavorites,
  MAX_FAVORITES,
  sameRef,
  saveFavorites,
  type FavoriteRef,
} from '../lib/favorites';

export interface FavoritesApi {
  favorites: FavoriteRef[];
  isFavorite: (ref: FavoriteRef) => boolean;
  toggle: (ref: FavoriteRef) => void;
  clear: () => void;
}

/** Local-only pinned items. Not server data - see lib/storage.ts. */
export function useFavorites(): FavoritesApi {
  const [favorites, setFavorites] = useState<FavoriteRef[]>(() => loadFavorites());

  const toggle = useCallback((ref: FavoriteRef) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => sameRef(f, ref));
      const next = exists ? prev.filter((f) => !sameRef(f, ref)) : [...prev, ref].slice(-MAX_FAVORITES);
      saveFavorites(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, []);

  return useMemo(
    () => ({
      favorites,
      isFavorite: (ref) => favorites.some((f) => sameRef(f, ref)),
      toggle,
      clear,
    }),
    [favorites, toggle, clear],
  );
}
