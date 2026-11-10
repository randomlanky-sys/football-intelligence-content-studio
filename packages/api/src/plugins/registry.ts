export type PluginCategory = 'storage' | 'messaging' | 'data';
export type PluginStatus = 'configured' | 'unconfigured';

export interface PluginDescriptor {
  id: string;
  name: string;
  category: PluginCategory;
  requiredEnv: string[];
  capabilities: string[];
  status: PluginStatus;
}

interface PluginDefinition {
  id: string;
  name: string;
  category: PluginCategory;
  requiredEnv: string[];
  capabilities: string[];
}

/**
 * Integration catalogue. A plugin is "configured" only when every required
 * environment variable is present; nothing here makes network calls at import
 * time and no secret value is ever returned.
 */
const DEFINITIONS: PluginDefinition[] = [
  {
    id: 'indexeddb',
    name: 'Browser IndexedDB',
    category: 'storage',
    requiredEnv: [],
    capabilities: ['save', 'load', 'delete'],
  },
  {
    id: 'local-fs',
    name: 'Local file system',
    category: 'storage',
    requiredEnv: [],
    capabilities: ['save', 'load', 'delete', 'list'],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'storage',
    requiredEnv: ['DROPBOX_ACCESS_TOKEN'],
    capabilities: ['save', 'load', 'delete'],
  },
  {
    id: 'zapier',
    name: 'Zapier webhook',
    category: 'storage',
    requiredEnv: ['ZAPIER_WEBHOOK_URL'],
    capabilities: ['save'],
  },
  {
    id: 'youtube',
    name: 'YouTube Data API',
    category: 'data',
    requiredEnv: ['YOUTUBE_API_KEY'],
    capabilities: ['search', 'metadata'],
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    category: 'messaging',
    requiredEnv: ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN'],
    capabilities: ['publish'],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'messaging',
    requiredEnv: ['TELEGRAM_BOT_TOKEN'],
    capabilities: ['send'],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'messaging',
    requiredEnv: ['WHATSAPP_PHONE_ID', 'WHATSAPP_ACCESS_TOKEN'],
    capabilities: ['send'],
  },
  {
    id: 'instagram',
    name: 'Instagram Graph',
    category: 'messaging',
    requiredEnv: ['INSTAGRAM_ACCESS_TOKEN'],
    capabilities: ['publish'],
  },
  {
    id: 'facebook',
    name: 'Facebook Graph',
    category: 'messaging',
    requiredEnv: ['FACEBOOK_ACCESS_TOKEN'],
    capabilities: ['publish'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'messaging',
    requiredEnv: ['TIKTOK_API_KEY'],
    capabilities: ['publish'],
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    category: 'messaging',
    requiredEnv: ['SNAPCHAT_API_KEY'],
    capabilities: ['publish'],
  },
];

export function listPlugins(env: NodeJS.ProcessEnv = process.env): PluginDescriptor[] {
  return DEFINITIONS.map((definition) => ({
    ...definition,
    status: definition.requiredEnv.every((key) => Boolean(env[key])) ? 'configured' : 'unconfigured',
  }));
}

export function getPlugin(id: string, env: NodeJS.ProcessEnv = process.env): PluginDescriptor | undefined {
  return listPlugins(env).find((plugin) => plugin.id === id);
}
