// packages/api/src/index.ts
import Fastify from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type Zod from 'zod';

import type { projectSchema } from '@fics/schema';
import type { mediaSchema } from '@fics/schema';
import { schemaValidator } from './plugins/schemaValidator';
import type { StoragePlugin } from './plugins/storagePlugin';
import type { IndexedDBStoragePlugin, DropboxStoragePlugin, TelegramMessagingPlugin, WhatsAppMessagingPlugin, InstagramMessagingPlugin, FacebookMessagingPlugin } from './plugins/storagePlugin';

/**
 * Plugin manager - registers and manages all available plugins.
 */
class PluginManager {
  private storagePlugins: Map<string, StoragePlugin> = new Map();
  private messagingPlugins: Map<string, any> = new Map();

  registerStoragePlugin(name: string, plugin: StoragePlugin): void {
    this.storagePlugins.set(name, plugin);
  }

  registerMessagingPlugin(name: string, plugin: any): void {
    this.messagingPlugins.set(name, plugin);
  }

  getStoragePlugin(name: string): StoragePlugin | undefined {
    return this.storagePlugins.get(name);
  }

  getMessagingPlugin(name: string): any | undefined {
    return this.messagingPlugins.get(name);
  }

  listStoragePlugins(): string[] {
    return Array.from(this.storagePlugins.keys());
  }

  listMessagingPlugins(): string[] {
    return Array.from(this.messagingPlugins.keys());
  }
}

export interface ApiConfig {
  storagePlugins?: string[];
  messagingPlugins?: string[];
}

export default function buildApi(config?: ApiConfig) {
  const fastify = Fastify({
    logger: true,
  });

  // Register schema validator plugin
  fastify.register(schemaValidator);

  // Initialize plugin manager
  const pluginManager = new PluginManager();

  // Register storage plugins if configured
  if (config?.storagePlugins) {
    for (const pluginName of config.storagePlugins) {
      switch (pluginName.toLowerCase()) {
        case 'indexeddb':
          fastify.register(() => {
            const plugin = new IndexedDBStoragePlugin();
            pluginManager.registerStoragePlugin('indexeddb', plugin);
            return plugin;
          });
          break;
        case 'dropbox':
          fastify.log.info('Dropbox plugin requires token configuration');
          break;
        case 'telegram':
          fastify.log.info('Telegram plugin requires bot token configuration');
          break;
        case 'whatsapp':
          fastify.log.info('WhatsApp plugin requires Business API credentials');
          break;
        case 'instagram':
          fastify.log.info('Instagram plugin requires Graph API token configuration');
          break;
        case 'facebook':
          fastify.log.info('Facebook plugin requires Graph API token configuration');
          break;
        default:
          fastify.log.warn(`Unknown storage plugin: ${pluginName}`);
      }
    }
  }

  // Register messaging plugins if configured
  if (config?.messagingPlugins) {
    for (const pluginName of config.messagingPlugins) {
      switch (pluginName.toLowerCase()) {
        case 'telegram':
          fastify.log.info('Telegram messaging plugin requires bot token');
          break;
        case 'whatsapp':
          fastify.log.info('WhatsApp messaging plugin requires Business API credentials');
          break;
        case 'instagram':
          fastify.log.info('Instagram messaging plugin requires Graph API token');
          break;
        case 'facebook':
          fastify.log.info('Facebook messaging plugin requires Graph API token');
          break;
        default:
          fastify.log.warn(`Unknown messaging plugin: ${pluginName}`);
      }
    }
  }

  // Health check route
  fastify.get('/healthz', async () => {
    return { status: 'ok' };
  });

  // API routes
  fastify.get('/v1/projects', async (request, reply) => {
    return { projects: [] };
  });

  fastify.post('/v1/projects', async (request, reply) => {
    return { id: '1', name: 'Test Project' };
  });

  // Start the server
  const start = async () => {
    try {
      await fastify.listen({ port: 3000 });
      fastify.log.info(`Server listening on port ${fastify.server.address?.port}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };

  return {
    fastify,
    start,
    pluginManager,
    getStoragePlugins: () => pluginManager.listStoragePlugins(),
    getMessagingPlugins: () => pluginManager.listMessagingPlugins()
  };
}

export { buildApi };