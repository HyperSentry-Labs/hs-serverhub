import type { ContentPayload, StatusSnapshot } from '../types/content';

/**
 * Browser-demo data for a FICTIONAL server ("Northgate Roleplay"). The
 * numbers, names and links below are invented for development and
 * screenshots - they do not describe any real server, including any
 * HyperSentry Labs deployment. Shapes mirror exactly what server.lua sends.
 */
export const demoContent: ContentPayload = {
  general: {
    ServerName: 'Northgate Roleplay',
    Subtitle: 'A community-first FiveM roleplay experience',
    Description:
      'Northgate is a semi-serious roleplay city built around long-term character stories, active jobs and a welcoming community. New here? Start with the guide, then explore the rules and commands.',
    Logo: 'branding/logo.svg',
    AccentColor: '#E3A857',
    AccentColorSecondary: '#5FB3B3',
    Command: 'serverhub',
    DefaultKey: 'F10',
    Language: 'en',
    Debug: false,
  },
  theme: {},
  links: {
    Discord: 'https://discord.example.com/northgate',
    Website: 'https://northgate.example.com',
    Support: 'https://northgate.example.com/support',
  },
  overview: {
    Enabled: true,
    ShowLiveStats: true,
    ShowLatestAnnouncement: true,
    QuickLinks: [
      { id: 'ql-rules', label: 'Rules', type: 'section', target: 'rules', icon: 'shield' },
      { id: 'ql-commands', label: 'Commands', type: 'section', target: 'commands', icon: 'terminal' },
      { id: 'ql-keybinds', label: 'Keybinds', type: 'section', target: 'keybinds', icon: 'keyboard' },
      { id: 'ql-start', label: 'Getting Started', type: 'section', target: 'getting-started', icon: 'compass' },
      { id: 'ql-discord', label: 'Join Discord', type: 'url', url: 'https://discord.example.com/northgate', icon: 'discord' },
      { id: 'ql-support', label: 'Get Support', type: 'url', url: 'https://northgate.example.com/support', icon: 'life-buoy' },
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
      { id: 'general-1', category: 'general', title: 'Respect every player', description: 'Harassment, hate speech and targeted discrimination result in an immediate ban. Disagreements happen in character, not out of it.', severity: 'critical' },
      { id: 'general-2', category: 'general', title: 'One account per person', description: 'Alternate accounts used to bypass a ban or rejoin a whitelist queue are treated as ban evasion.', severity: 'warning' },
      { id: 'general-3', category: 'general', title: 'No exploits or cheats', description: 'Using bugs, mods or third-party tools for an advantage is a permanent ban. Report bugs to staff instead of abusing them.', severity: 'critical' },
      { id: 'roleplay-1', category: 'roleplay', title: 'Stay in character in RP channels', description: 'Use /ooc for out-of-character remarks. Breaking immersion mid-scene ruins it for everyone involved.', severity: 'info' },
      { id: 'roleplay-2', category: 'roleplay', title: 'No fail RP', description: 'Your character must react to their situation the way a real person would - that includes fear, injury and consequences.', severity: 'warning' },
      { id: 'roleplay-3', category: 'roleplay', title: 'Value your character\u2019s life', description: 'Do not take actions that no reasonable person would take while a weapon is pointed at them.\n\nIf you are unsure whether a scene has turned hostile, ask in /ooc before acting.', severity: 'warning' },
      { id: 'combat-1', category: 'combat', title: 'No random deathmatch', description: 'Combat must be preceded by roleplay and a clear in-character reason. Drive-by executions with no build-up are not allowed.', severity: 'critical' },
      { id: 'police-1', category: 'police', title: 'Police interaction', description: 'De-escalate before lethal force unless the scene clearly justifies skipping a step. Officers follow the use-of-force ladder; civilians cooperate with reasonable requests during a stop.', severity: 'warning' },
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
      { id: 'cmd-report', command: '/report', title: 'Report a player or issue', description: 'Opens a report ticket for staff. Include as much detail as you can.', category: 'general', permission: 'Everyone', usage: '/report [message]' },
      { id: 'cmd-911', command: '/911', title: 'Contact emergency services', description: 'Alerts on-duty Police and EMS to your location.', category: 'emergency', permission: 'Everyone', aliases: ['/112'], usage: '/911 [message]' },
      { id: 'cmd-dispatch', command: '/dispatch', title: 'Send a dispatch message', description: 'Sends a message to on-duty dispatchers.', category: 'emergency', permission: 'Police, EMS', keybind: 'F6' },
      { id: 'cmd-me', command: '/me', title: 'Describe an action', description: 'Shows a third-person action to nearby players, e.g. "/me lights a cigarette".', category: 'roleplay', permission: 'Everyone', usage: '/me [action]' },
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
      { id: 'key-police-menu', key: 'F6', title: 'Police Menu', description: 'Duty-only police tools.', category: 'emergency', resource: 'my-police', context: 'Duty only' },
      { id: 'key-interact', key: 'G', title: 'Vehicle interaction', description: 'Lock, engine and trunk controls.', category: 'core' },
      { id: 'key-hands-up', key: 'X', title: 'Hands up', description: 'Raise your hands during roleplay.', category: 'roleplay', context: 'Hold' },
    ],
  },
  gettingStarted: {
    enableProgress: true,
    steps: [
      { id: 'step-character', title: 'Create your character', description: 'Build your character and pick your starting appearance.', icon: 'user-plus', estimatedMinutes: 3 },
      { id: 'step-id', title: 'Learn your identity system', description: 'Your character ID and phone number are how other players and jobs will reach you.', icon: 'id-card' },
      { id: 'step-rules', title: 'Read the server rules', description: 'A five-minute read that saves you from an avoidable ban.', icon: 'shield', linkLabel: 'Open Rules', linkTarget: 'rules', estimatedMinutes: 5 },
      { id: 'step-job', title: 'Find your first job', description: 'Jobs are how you earn money and meet other characters.', icon: 'briefcase' },
      { id: 'step-keybinds', title: 'Learn your keybinds', description: 'Phone, inventory and radio all have dedicated keys.', icon: 'keyboard', linkLabel: 'Open Keybinds', linkTarget: 'keybinds', estimatedMinutes: 2 },
      { id: 'step-discord', title: 'Join the community Discord', description: 'Announcements, support and the rest of the community live here.', icon: 'message-circle', linkLabel: 'Join Discord', linkUrl: 'https://discord.example.com/northgate' },
    ],
  },
  news: {
    items: [
      { id: 'news-maintenance', title: 'Scheduled maintenance this weekend', date: '2026-09-05', category: 'Maintenance', priority: 'important', featured: true, description: 'The server will be offline for about 30 minutes for a database upgrade.', icon: 'bell' },
      { id: 'news-economy', title: 'Economy adjustments', date: '2026-08-22', version: 'v1.3.0', category: 'Update', description: 'Rebalanced job payouts and reduced high-end item prices.' },
      { id: 'news-police', title: 'Police Department Update', date: '2026-08-14', version: 'v1.2.0', category: 'Update', description: 'New MDT workflow and two additional patrol vehicles.', url: 'https://northgate.example.com/changelog' },
      { id: 'news-launch', title: 'Northgate Roleplay has launched', date: '2026-08-01', category: 'Announcement', description: 'Whitelist is open and the city is live. Welcome aboard.', icon: 'announcement' },
    ],
  },
  community: {
    links: [
      { id: 'com-discord', label: 'Discord', url: 'https://discord.example.com/northgate', icon: 'discord', description: 'Chat with staff and the community.' },
      { id: 'com-website', label: 'Website', url: 'https://northgate.example.com', icon: 'globe', description: 'Server news and whitelist application.' },
      { id: 'com-support', label: 'Support', url: 'https://northgate.example.com/support', icon: 'life-buoy', description: 'Open a support ticket.' },
    ],
    groups: [
      {
        id: 'community',
        label: 'Community',
        links: [
          { id: 'grp-discord', label: 'Discord', url: 'https://discord.example.com/northgate', icon: 'discord', description: 'Chat with staff and the community.' },
          { id: 'grp-website', label: 'Website', url: 'https://northgate.example.com', icon: 'globe', description: 'Server news and whitelist application.' },
        ],
      },
      {
        id: 'support',
        label: 'Support',
        links: [
          { id: 'grp-tickets', label: 'Ticket system', url: 'https://northgate.example.com/support', icon: 'life-buoy', description: 'Open a support ticket.' },
          { id: 'grp-docs', label: 'Documentation', url: 'https://northgate.example.com/docs', icon: 'book', description: 'Guides for new and returning players.' },
        ],
      },
      {
        id: 'store',
        label: 'Store',
        links: [{ id: 'grp-store', label: 'Server store', url: 'https://northgate.example.com/store', icon: 'briefcase', description: 'Optional supporter packages.' }],
      },
    ],
  },
  stats: [{ key: 'queue', label: 'Queue', value: 0 }],
  status: { enabled: true, showUptime: true },
};

export const demoStatus: StatusSnapshot = {
  online: 128,
  max: 256,
  status: 'online',
  uptimeSeconds: 60 * 60 * 14 + 60 * 22,
  monitoredResources: [
    { name: 'ox_lib', state: 'started' },
    { name: 'my-police', state: 'started' },
    { name: 'my-ems', state: 'starting' },
    { name: 'my-garage', state: 'stopped' },
  ],
};
