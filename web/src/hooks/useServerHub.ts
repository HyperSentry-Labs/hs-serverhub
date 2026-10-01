import { useCallback, useEffect, useMemo, useState } from 'react';
import { getBridge } from '../bridge';
import { normalizeContent } from '../lib/normalize';
import type { ContentPayload, SectionId, StatusSnapshot } from '../types/content';

export interface ServerHubState {
  isOpen: boolean;
  isFiveM: boolean;
  /** False until the first bootstrap payload arrives from the server. */
  isLoaded: boolean;
  content: ContentPayload;
  status: StatusSnapshot | null;
  section: SectionId;
  setSection: (section: SectionId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  close: () => void;
  refresh: () => void;
}

export function useServerHub(): ServerHubState {
  const bridge = useMemo(() => getBridge(), []);
  const [isOpen, setIsOpen] = useState(bridge.isFiveM ? false : true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [content, setContent] = useState<ContentPayload>(() => normalizeContent(null));
  const [status, setStatus] = useState<StatusSnapshot | null>(null);
  const [section, setSection] = useState<SectionId>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    return bridge.onMessage((message) => {
      switch (message.type) {
        case 'open':
          setIsOpen(true);
          break;
        case 'close':
          setIsOpen(false);
          break;
        case 'bootstrap':
          setContent(normalizeContent(message.payload));
          setIsLoaded(true);
          break;
        case 'contentUpdate':
          setContent(normalizeContent(message.payload));
          break;
        case 'statusUpdate':
          setStatus(message.payload);
          break;
      }
    });
  }, [bridge]);

  const close = useCallback(() => {
    setIsOpen(false); // optimistic - feels instant even before the round trip completes
    void bridge.close();
  }, [bridge]);

  const refresh = useCallback(() => {
    void bridge.refresh();
  }, [bridge]);

  return {
    isOpen,
    isFiveM: bridge.isFiveM,
    isLoaded,
    content,
    status,
    section,
    setSection,
    searchQuery,
    setSearchQuery,
    close,
    refresh,
  };
}
