import type { ContentPayload, StatusSnapshot } from '../types/content';

// This intentionally mirrors config.lua's shipped defaults. If you change
// the demo content here, consider whether config.lua should change too -
// see docs/development.md#browser-demo-vs-fivem-build.
export const demoContent: ContentPayload = {
  general: {
    ServerName: 'Hyper Roleplay',
    Subtitle: 'A community-first FiveM roleplay experience',
    Description:
      'Hyper Roleplay is a semi-serious RP server focused on long-term character stories, active jobs, and a friendly community.',
    Logo: 'branding/logo.svg',
    AccentColor: '#E3A857',
    AccentColorSecondary: '#5FB3B3',
    Command: 'serverhub',
    DefaultKey: 'F10',
    Language: 'en',
    Debug: false,
  },
  links: {
    Discord: 'https://discord.gg/example',
    Website: 'https://example.com',
    Support: 'https://example.com/support',
  },
  overview: {
    Enabled: true,
    ShowLiveStats: true,
    ShowLatestAnnouncement: true,
    QuickLinks: [
      { id: 'ql-rules', label: 'Rules', target: 'rules', icon: 'shield' },
      { id: 'ql-commands', label: 'Commands', target: 'commands', icon: 'terminal' },
      { id: 'ql-keybinds', label: 'Keybinds', target: 'keybinds', icon: 'keyboard' },
      { id: 'ql-start', label: 'Getting Started', target: 'getting-started', icon: 'compass' },
    ],
  },
  rules: {
    categories: [
      { id: 'general', label: 'General', icon: 'book' },
      { id: 'roleplay', label: 'Roleplay', icon: 'drama' },
      { id: 'combat', label: 'Combat', icon: 'crosshair' },
      { id: 'police', label: 'Police', icon: 'badge' },
      { id: 'ems', label: 'EMS', icon: 'cross' },
      { id: 'vehicles', label: 'Vehicles', icon: 'car' },
    ],
    items: [
      { id: 'general-1', category: 'general', title: 'Respect every player', description: 'Harassment, hate speech, and targeted discrimination result in an immediate ban. Disagreements happen in character, not out of it.', severity: 'critical' },
      { id: 'general-2', category: 'general', title: 'One account per person', description: 'Alternate accounts used to bypass a ban or rejoin a whitelist queue are treated as ban evasion.', severity: 'warning' },
      { id: 'roleplay-1', category: 'roleplay', title: 'Stay in character in RP channels', description: 'Use /ooc for out-of-character remarks. Breaking immersion mid-scene ruins it for everyone involved.', severity: 'info' },
      { id: 'roleplay-2', category: 'roleplay', title: 'No fail RP', description: 'Your character must react to their situation the way a real person would - that includes fear, injury, and consequences.', severity: 'warning' },
      { id: 'combat-1', category: 'combat', title: 'No random deathmatch', description: 'Combat must be preceded by roleplay and a clear in-character reason. Drive-by executions with no build-up are not allowed.', severity: 'critical' },
      { id: 'police-1', category: 'police', title: 'Follow the use-of-force ladder', description: 'De-escalate before lethal force unless the scene clearly justifies skipping a step.', severity: 'warning' },
      { id: 'ems-1', category: 'ems', title: 'EMS RP is not a taxi service', description: 'Treat every call as a real medical scene, not a fast-travel option.', severity: 'info' },
      { id: 'vehicles-1', category: 'vehicles', title: 'No unrealistic driving', description: 'Reckless, physics-breaking driving without RP justification will be treated as vehicle-deathmatch.', severity: 'warning' },
    ],
  },
  commands: {
    categories: [
      { id: 'general', label: 'General' },
      { id: 'roleplay', label: 'Roleplay' },
      { id: 'emergency', label: 'Emergency' },
    ],
    items: [
      { id: 'cmd-report', command: '/report', title: 'Report a player or issue', description: 'Opens a report ticket for staff. Include as much detail as you can.', category: 'general', permission: 'Everyone' },
      { id: 'cmd-911', command: '/911', title: 'Contact emergency services', description: 'Alerts on-duty Police and EMS to your location.', category: 'emergency', permission: 'Everyone', aliases: ['/112'] },
      { id: 'cmd-me', command: '/me', title: 'Describe an action', description: 'Shows a third-person action to nearby players, e.g. "/me lights a cigarette".', category: 'roleplay', permission: 'Everyone' },
      { id: 'cmd-do', command: '/do', title: 'Describe your surroundings or an outcome', description: 'Used to narrate scene details that /me cannot express.', category: 'roleplay', permission: 'Everyone' },
      { id: 'cmd-discord', command: '/discord', title: 'Get the Discord invite', description: 'Prints the community Discord link in chat.', category: 'general', permission: 'Everyone' },
    ],
  },
  keybinds: {
    categories: [
      { id: 'core', label: 'Core' },
      { id: 'roleplay', label: 'Roleplay' },
      { id: 'emergency', label: 'Emergency' },
    ],
    items: [
      { id: 'key-phone', key: 'F1', title: 'Phone', description: 'Open your phone.', category: 'core' },
      { id: 'key-inventory', key: 'F2', title: 'Inventory', description: 'Open your inventory.', category: 'core' },
      { id: 'key-radio', key: 'F3', title: 'Radio', description: 'Open your radio.', category: 'core' },
      { id: 'key-police-menu', key: 'F6', title: 'Police Menu', description: 'Duty-only police tools.', category: 'emergency' },
      { id: 'key-interact', key: 'G', title: 'Vehicle interaction', description: 'Lock, engine, and trunk controls.', category: 'core' },
      { id: 'key-hands-up', key: 'X', title: 'Hands up', description: 'Raise your hands during roleplay.', category: 'roleplay' },
    ],
  },
  gettingStarted: {
    steps: [
      { id: 'step-character', title: 'Create your character', description: 'Build your character and pick your starting appearance.', icon: 'user-plus' },
      { id: 'step-id', title: 'Learn your identity system', description: 'Your character ID and phone number are how other players and jobs will reach you.', icon: 'id-card' },
      { id: 'step-rules', title: 'Read the server rules', description: 'A five-minute read that saves you from an avoidable ban.', icon: 'shield', linkLabel: 'Open Rules', linkTarget: 'rules' },
      { id: 'step-job', title: 'Find your first job', description: 'Jobs are how you earn money and meet other characters.', icon: 'briefcase' },
      { id: 'step-keybinds', title: 'Learn your keybinds', description: 'Phone, inventory, and radio all have dedicated keys.', icon: 'keyboard', linkLabel: 'Open Keybinds', linkTarget: 'keybinds' },
      { id: 'step-discord', title: 'Join the community Discord', description: 'Announcements, support, and the rest of the community live here.', icon: 'message-circle', linkLabel: 'Join Discord', linkUrl: 'https://discord.gg/example' },
    ],
  },
  news: {
    items: [
      { id: 'news-economy', title: 'Economy adjustments', date: '2026-08-22', version: 'v1.3.0', category: 'Update', description: 'Rebalanced job payouts and reduced high-end item prices.' },
      { id: 'news-police', title: 'Police department update', date: '2026-08-14', version: 'v1.2.0', category: 'Update', description: 'New MDT workflow and two additional patrol vehicles.' },
      { id: 'news-launch', title: 'Hyper Roleplay has launched', date: '2026-08-01', category: 'Announcement', description: 'Whitelist is open and the city is live. Welcome aboard.' },
    ],
  },
  community: {
    links: [
      { id: 'com-discord', label: 'Discord', url: 'https://discord.gg/example', icon: 'discord', description: 'Chat with staff and the community.' },
      { id: 'com-website', label: 'Website', url: 'https://example.com', icon: 'globe', description: 'Server news and whitelist application.' },
      { id: 'com-support', label: 'Support', url: 'https://example.com/support', icon: 'life-buoy', description: 'Open a support ticket.' },
    ],
  },
  stats: [],
  status: { enabled: true, showUptime: true },
};

export const demoStatus: StatusSnapshot = {
  online: 128,
  max: 256,
  status: 'online',
  uptimeSeconds: 60 * 60 * 14 + 60 * 22,
  monitoredResources: [
    { name: 'ox_lib', running: true },
    { name: 'my-police', running: true },
    { name: 'my-ems', running: false },
  ],
};
