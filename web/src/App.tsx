import { useEffect, useMemo } from 'react';
import { AppShell } from './layouts/AppShell';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { RulesPage } from './pages/RulesPage';
import { CommandsPage } from './pages/CommandsPage';
import { KeybindsPage } from './pages/KeybindsPage';
import { GettingStartedPage } from './pages/GettingStartedPage';
import { NewsPage } from './pages/NewsPage';
import { CommunityPage } from './pages/CommunityPage';
import { I18nProvider } from './hooks/useI18n';
import { directionFor } from './i18n';
import { useServerHub } from './hooks/useServerHub';
import { useEscapeKey } from './hooks/useEscapeKey';
import type { SectionId } from './types/content';

const ALL_SECTIONS: SectionId[] = [
  'overview',
  'rules',
  'commands',
  'keybinds',
  'getting-started',
  'news',
  'community',
];

function App() {
  const hub = useServerHub();
  const { content, status, isOpen, section, setSection, searchQuery, setSearchQuery, close } = hub;

  useEscapeKey(isOpen, close);

  // Config-driven accent colors override the CSS-var defaults from
  // globals.css the moment real content arrives.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--hs-accent', content.general.AccentColor);
    root.style.setProperty('--hs-accent-secondary', content.general.AccentColorSecondary);
  }, [content.general.AccentColor, content.general.AccentColorSecondary]);

  useEffect(() => {
    document.body.classList.toggle('hs-closed', !isOpen);
  }, [isOpen]);

  useEffect(() => {
    document.documentElement.dir = directionFor(content.general.Language);
  }, [content.general.Language]);

  const sections = useMemo(
    () => ALL_SECTIONS.filter((s) => s !== 'overview' || content.overview.Enabled),
    [content.overview.Enabled],
  );

  useEffect(() => {
    if (!sections.includes(section)) {
      setSection(sections[0] ?? 'rules');
    }
  }, [sections, section, setSection]);

  return (
    <I18nProvider language={content.general.Language}>
      <AppShell
        isOpen={isOpen}
        header={
          <Header
            content={content}
            status={status}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onNavigate={setSection}
            onClose={close}
          />
        }
        sidebar={<Sidebar sections={sections} active={section} onSelect={setSection} />}
      >
        {section === 'overview' && <OverviewPage content={content} status={status} onNavigate={setSection} />}
        {section === 'rules' && <RulesPage rules={content.rules} />}
        {section === 'commands' && <CommandsPage commands={content.commands} />}
        {section === 'keybinds' && <KeybindsPage keybinds={content.keybinds} />}
        {section === 'getting-started' && (
          <GettingStartedPage steps={content.gettingStarted.steps} onNavigate={setSection} />
        )}
        {section === 'news' && <NewsPage news={content.news} />}
        {section === 'community' && <CommunityPage community={content.community} />}
      </AppShell>
    </I18nProvider>
  );
}

export default App;
