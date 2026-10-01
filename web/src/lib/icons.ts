import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Briefcase,
  Car,
  ChevronRight,
  Compass,
  Contact,
  Crosshair,
  Drama,
  ExternalLink,
  Globe,
  HeartPulse,
  Home,
  Info,
  Keyboard,
  LifeBuoy,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Newspaper,
  Search,
  Shield,
  ShieldAlert,
  Siren,
  Terminal,
  Users,
  UserPlus,
  X,
} from 'lucide-react';

/**
 * Config authors reference icons by short string ids (see config.lua),
 * never by importing a component. That keeps config.lua free of any
 * frontend implementation detail. Unknown ids fall back to `Info` rather
 * than throwing, per the "one bad entry never breaks the page" philosophy.
 *
 * Note: `discord` intentionally maps to a generic chat icon rather than a
 * reproduction of Discord's trademarked logo mark.
 */
const ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  drama: Drama,
  crosshair: Crosshair,
  badge: ShieldAlert,
  cross: HeartPulse,
  car: Car,
  shield: Shield,
  terminal: Terminal,
  keyboard: Keyboard,
  compass: Compass,
  'user-plus': UserPlus,
  'id-card': Contact,
  briefcase: Briefcase,
  'message-circle': MessageCircle,
  discord: MessageSquare,
  globe: Globe,
  'life-buoy': LifeBuoy,
  search: Search,
  close: X,
  'external-link': ExternalLink,
  'chevron-right': ChevronRight,
  users: Users,
  info: Info,
  warning: AlertTriangle,
  siren: Siren,
  bell: Bell,
  newspaper: Newspaper,
  home: Home,
  announcement: Megaphone,
};

export function getIcon(name: string | undefined | null): LucideIcon {
  if (!name) return Info;
  return ICONS[name] ?? Info;
}

export const SECTION_ICONS = {
  overview: Home,
  rules: Shield,
  commands: Terminal,
  keybinds: Keyboard,
  'getting-started': Compass,
  news: Newspaper,
  community: Users,
} as const;
