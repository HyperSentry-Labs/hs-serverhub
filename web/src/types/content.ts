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

export interface QuickLink {
  id: string;
  label: string;
  target: SectionId;
  icon?: string;
}

export interface OverviewConfig {
  Enabled: boolean;
  ShowLiveStats: boolean;
  ShowLatestAnnouncement: boolean;
  QuickLinks: QuickLink[];
}

export type Severity = 'info' | 'warning' | 'critical';

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
}

export interface KeybindItem {
  id: string;
  key: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
}

export interface GettingStartedStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
  linkLabel?: string;
  linkTarget?: SectionId;
  linkUrl?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  description: string;
  category?: string;
  version?: string;
  url?: string;
}

export interface CommunityLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  description?: string;
}

export interface StatItem {
  key: string;
  label: string;
  value: string | number;
}

export interface MonitoredResourceStatus {
  name: string;
  running: boolean;
}

export interface StatusSnapshot {
  online: number;
  max: number;
  status: 'online';
  uptimeSeconds?: number;
  monitoredResources: MonitoredResourceStatus[];
}

export type SectionId =
  | 'overview'
  | 'rules'
  | 'commands'
  | 'keybinds'
  | 'getting-started'
  | 'news'
  | 'community';

export interface ContentPayload {
  general: GeneralConfig;
  links: LinksConfig;
  overview: OverviewConfig;
  rules: { categories: Category[]; items: RuleItem[] };
  commands: { categories: Category[]; items: CommandItem[] };
  keybinds: { categories: Category[]; items: KeybindItem[] };
  gettingStarted: { steps: GettingStartedStep[] };
  news: { items: NewsItem[] };
  community: { links: CommunityLink[] };
  stats: StatItem[];
  status: { enabled: boolean; showUptime: boolean };
}
