export interface GeneralConfig {
  ServerName: string;
  Subtitle: string;
  Description: string;
  Logo: string;
  AccentColor: string;
  AccentColorSecondary: string;
  Command: string;
  DefaultKey: string;
  Language: string;
  Debug: boolean;
}

export interface LinksConfig {
  Discord?: string;
  Website?: string;
  Support?: string;
}

export type SectionId =
  | 'overview'
  | 'rules'
  | 'commands'
  | 'keybinds'
  | 'getting-started'
  | 'news'
  | 'community';

/**
 * A quick action tile on Overview. `type` defaults to 'section' (v0.1
 * shape: jump to a built-in section). 'url' opens an external link.
 */
export interface QuickLink {
  id: string;
  label: string;
  type?: 'section' | 'url';
  target?: SectionId;
  url?: string;
  icon?: string;
}

export interface OverviewConfig {
  Enabled: boolean;
  ShowLiveStats: boolean;
  ShowLatestAnnouncement: boolean;
  QuickLinks: QuickLink[];
}

export type Severity = 'info' | 'warning' | 'critical';
export type Priority = 'normal' | 'important' | 'critical';

export interface Category {
  id: string;
  label: string;
  icon?: string;
}

export interface RuleItem {
  id: string;
  category: string;
  title: string;
  description: string;
  severity?: Severity;
  icon?: string;
}

export interface CommandItem {
  id: string;
  command: string;
  title: string;
  description: string;
  category: string;
  permission?: string;
  icon?: string;
  aliases?: string[];
  usage?: string;
  /** Optional related key label, e.g. "F6" - informational only. */
  keybind?: string;
}

export interface KeybindItem {
  id: string;
  key: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  context?: string;
  resource?: string;
}

export interface GettingStartedStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
  linkLabel?: string;
  linkTarget?: SectionId;
  linkUrl?: string;
  estimatedMinutes?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  description: string;
  category?: string;
  version?: string;
  url?: string;
  priority?: Priority;
  featured?: boolean;
  icon?: string;
}

export interface CommunityLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  description?: string;
}

export interface CommunityGroup {
  id: string;
  label: string;
  links: CommunityLink[];
}

export interface StatItem {
  key: string;
  label: string;
  value: string | number;
}

export type ResourceState = 'started' | 'starting' | 'stopped' | 'unknown';

export interface MonitoredResourceStatus {
  name: string;
  state: ResourceState;
}

export interface StatusSnapshot {
  online: number;
  max: number;
  status: 'online';
  uptimeSeconds?: number;
  monitoredResources: MonitoredResourceStatus[];
}

export interface ThemeConfig {
  AccentHover?: string;
  Background?: string;
  Surface?: string;
  SurfaceRaised?: string;
  Border?: string;
  Text?: string;
  Muted?: string;
}

export interface ContentPayload {
  general: GeneralConfig;
  theme: ThemeConfig;
  links: LinksConfig;
  overview: OverviewConfig;
  rules: { categories: Category[]; items: RuleItem[] };
  commands: { categories: Category[]; items: CommandItem[] };
  keybinds: { categories: Category[]; items: KeybindItem[] };
  gettingStarted: { steps: GettingStartedStep[]; enableProgress: boolean };
  news: { items: NewsItem[] };
  community: { links: CommunityLink[]; groups: CommunityGroup[] };
  stats: StatItem[];
  status: { enabled: boolean; showUptime: boolean };
}
