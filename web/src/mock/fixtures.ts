import type { ContentPayload, StatusSnapshot } from '../types/content';
import { demoContent, demoStatus } from './demoContent';

export type FixtureName = 'default' | 'empty' | 'minimal' | 'long' | 'many' | 'rtl';

export interface Fixture {
  content: ContentPayload;
  status: StatusSnapshot | null;
}

export const FIXTURE_NAMES: readonly FixtureName[] = ['default', 'empty', 'minimal', 'long', 'many', 'rtl'];

const LONG_TEXT =
  'This entry is intentionally long to exercise wrapping and overflow. '.repeat(6).trim();

const emptyContent: ContentPayload = {
  ...demoContent,
  general: { ...demoContent.general, ServerName: 'ServerHub', Subtitle: '', Description: '', Logo: '' },
  overview: { ...demoContent.overview, QuickLinks: [] },
  rules: { categories: [], items: [] },
  commands: { categories: [], items: [] },
  keybinds: { categories: [], items: [] },
  gettingStarted: { steps: [], enableProgress: true },
  news: { items: [] },
  community: { links: [], groups: [] },
  stats: [],
};

function build(name: FixtureName): Fixture {
  switch (name) {
    case 'empty':
      return { content: emptyContent, status: null };

    case 'minimal':
      // Overview and live status disabled, progress tracking off, no logo, a few rules only.
      return {
        content: {
          ...emptyContent,
          general: { ...emptyContent.general, ServerName: 'Small Server' },
          overview: { ...emptyContent.overview, Enabled: false },
          rules: { categories: demoContent.rules.categories.slice(0, 1), items: demoContent.rules.items.slice(0, 2) },
          gettingStarted: { steps: demoContent.gettingStarted.steps.slice(0, 3), enableProgress: false },
          status: { enabled: false, showUptime: false },
        },
        status: null,
      };

    case 'long':
      return {
        content: {
          ...demoContent,
          general: {
            ...demoContent.general,
            ServerName: 'The Extraordinarily Long-Named Northgate Metropolitan Roleplay Community',
            Subtitle: LONG_TEXT,
          },
          rules: {
            ...demoContent.rules,
            items: [
              { id: 'long-1', category: 'general', title: LONG_TEXT, description: `${LONG_TEXT}\n\n${LONG_TEXT}`, severity: 'warning' },
              ...demoContent.rules.items,
            ],
          },
          commands: {
            ...demoContent.commands,
            items: [
              { id: 'long-cmd', command: '/averyveryverylongcommandnamethatkeepsgoingandgoing', title: LONG_TEXT, description: LONG_TEXT, category: 'general', usage: '/averyveryverylongcommandnamethatkeepsgoingandgoing [argument] [another-argument]', permission: 'Staff members only' },
              ...demoContent.commands.items,
            ],
          },
        },
        status: demoStatus,
      };

    case 'many': {
      const categories = demoContent.rules.categories;
      const rules = Array.from({ length: 60 }, (_, i) => ({
        id: `many-rule-${i + 1}`,
        category: categories[i % categories.length]?.id ?? 'general',
        title: `Rule ${i + 1}: example community guideline`,
        description: 'A concise example guideline used to test long lists.',
        severity: (['info', 'warning', 'critical'] as const)[i % 3],
      }));
      const commands = Array.from({ length: 40 }, (_, i) => ({
        id: `many-cmd-${i + 1}`,
        command: `/example${i + 1}`,
        title: `Example command ${i + 1}`,
        description: 'A placeholder command used to test long lists.',
        category: 'general',
      }));
      return {
        content: {
          ...demoContent,
          rules: { categories, items: [...rules, ...demoContent.rules.items] },
          commands: { ...demoContent.commands, items: [...demoContent.commands.items, ...commands] },
        },
        status: demoStatus,
      };
    }

    case 'rtl':
      return {
        content: {
          ...demoContent,
          general: {
            ...demoContent.general,
            ServerName: 'نورث‌گیت رول‌پلی',
            Subtitle: 'یک تجربه رول‌پلی جامعه‌محور در FiveM',
            Description: 'نورث‌گیت یک شهر رول‌پلی نیمه‌جدی است. قبل از شروع، قوانین و دستورات (مثل /report و /911) را بخوانید.',
            Language: 'fa',
          },
          rules: {
            categories: [{ id: 'general', label: 'عمومی' }, { id: 'police', label: 'پلیس' }],
            items: [
              { id: 'fa-1', category: 'general', title: 'احترام به همه بازیکنان', description: 'توهین و تبعیض منجر به بن فوری می‌شود. اختلاف‌ها باید داخل نقش حل شوند.', severity: 'critical' },
              { id: 'fa-2', category: 'police', title: 'تعامل با Police', description: 'قبل از استفاده از زور مرگبار، تنش را کاهش دهید. شماره اضطراری 911 است.', severity: 'warning' },
            ],
          },
          commands: {
            categories: [{ id: 'general', label: 'عمومی' }],
            items: [
              { id: 'fa-cmd-1', command: '/report', title: 'گزارش بازیکن', description: 'یک تیکت گزارش برای استاف باز می‌کند.', category: 'general', permission: 'همه', usage: '/report [پیام]' },
            ],
          },
          news: {
            items: [{ id: 'fa-news-1', title: 'به‌روزرسانی v1.3.0', date: '2026-08-22', version: 'v1.3.0', category: 'به‌روزرسانی', description: 'اقتصاد سرور متعادل‌تر شد.' }],
          },
        },
        status: demoStatus,
      };

    default:
      return { content: demoContent, status: demoStatus };
  }
}

export function getFixture(name: string | null | undefined): Fixture {
  const safe = (FIXTURE_NAMES as readonly string[]).includes(name ?? '') ? (name as FixtureName) : 'default';
  return build(safe);
}
