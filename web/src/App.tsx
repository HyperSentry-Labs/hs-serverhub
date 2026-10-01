import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from './layouts/AppShell';
import { Header } from './components/Header';
import { I18nProvider } from './components/I18nProvider';
import { Loading } from './components/Loading';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { RulesPage } from './pages/RulesPage';
import { CommandsPage } from './pages/CommandsPage';
import { KeybindsPage } from './pages/KeybindsPage';
import { GettingStartedPage } from './pages/GettingStartedPage';
import { NewsPage } from './pages/NewsPage';
import { CommunityPage } from './pages/CommunityPage';
import { directionFor } from './i18n';
import { applyTheme } from './lib/color';
import type { SearchResultItem } from './lib/search';
import { useEscapeKey } from './hooks/useEscapeKey';
import { useFavorites } from './hooks/useFavorites';
import { useGlobalSearchShortcut } from './hooks/useGlobalSearchShortcut';
import { useProgress } from './hooks/useProgress';
import { useServerHub } from './hooks/useServerHub';
import type { SectionId } from './types/content';

const ALL_SECTIONS: SectionId[] = ['overview', 'rules', 'commands', 'keybinds', 'getting-started', 'news', 'community'];

/** How long a navigated-to row keeps its highlight ring. */
const HIGHLIGHT_MS = 1800;

interface Highlight {
  section: SectionId;
  id: string;
}

function App() {
  const { content, status, isOpen, isLoaded, section, setSection, searchQuery, setSearchQuery, close } = useServerHub();
  const favorites = useFavorites();
  const progress = useProgress();
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEscapeKey(isOpen, close);
  useGlobalSearchShortcut(isOpen, searchInputRef);

  const navigate = useCallback(
    (target: SectionId, highlightId?: string) => {
      setSection(target);
      setHighlight(highlightId ? { section: target, id: highlightId } : null);
    },
    [setSection],
  );

  const onSelectResult = useCallback((result: SearchResultItem) => navigate(result.section, result.id), [navigate]);

  useEffect(() => {
    if (!highlight) return;
    const timer = setTimeout(() => setHighlight(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlight]);

  // Config-driven theme tokens (validated in Lua and again here).
  useEffect(() => {
    applyTheme(document.documentElement, content.general.AccentColor, content.general.AccentColorSecondary, content.theme);
  }, [content.general.AccentColor, content.general.AccentColorSecondary, content.theme]);

  useEffect(() => {
    document.body.classList.toggle('hs-closed', !isOpen);
  }, [isOpen]);

  useEffect(() => {
    document.documentElement.dir = directionFor(content.general.Language);
    document.documentElement.lang = content.general.Language;
  }, [content.general.Language]);

  useEffect(() => {
    document.title = content.general.ServerName;
  }, [content.general.ServerName]);

  const sections = useMemo(
    () => ALL_SECTIONS.filter((s) => s !== 'overview' || content.overview.Enabled),
    [content.overview.Enabled],
  );

  useEffect(() => {
    if (!sections.includes(section)) {
      setSection(sections[0] ?? 'rules');
    }
  }, [sections, section, setSection]);

  const highlightId = highlight && highlight.section === section ? highlight.id : undefined;

  return (
    <I18nProvider language={content.general.Language}>
      <AppShell
        isOpen={isOpen}
        label={content.general.ServerName}
        scrollKey={section}
        resetScroll={!highlight}
        header={
          <Header
            content={content}
            status={status}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSelectResult={onSelectResult}
            onClose={close}
            searchInputRef={searchInputRef}
          />
        }
        sidebar={<Sidebar sections={sections} active={section} onSelect={(s) => navigate(s)} />}
      >
        <div key={section} className="hs-fade-in">
          {!isLoaded ? (
            <Loading />
          ) : (
            <>
              {section === 'overview' && (
                <OverviewPage content={content} status={status} favorites={favorites} progress={progress} onNavigate={navigate} />
              )}
              {section === 'rules' && <RulesPage rules={content.rules} favorites={favorites} highlightId={highlightId} />}
              {section === 'commands' && <CommandsPage commands={content.commands} favorites={favorites} highlightId={highlightId} />}
              {section === 'keybinds' && <KeybindsPage keybinds={content.keybinds} favorites={favorites} highlightId={highlightId} />}
              {section === 'getting-started' && (
                <GettingStartedPage gettingStarted={content.gettingStarted} progress={progress} onNavigate={navigate} highlightId={highlightId} />
              )}
              {section === 'news' && <NewsPage news={content.news} highlightId={highlightId} />}
              {section === 'community' && <CommunityPage community={content.community} highlightId={highlightId} />}
            </>
          )}
        </div>
      </AppShell>
    </I18nProvider>
  );
}

export default App;
