// packages/api/src/plugins/index.ts
export { schemaValidator } from './schemaValidator';
export type { StoragePlugin } from './storagePlugin';
export {
  IndexedDBStoragePlugin,
  CloudStoragePlugin,
  DropboxStoragePlugin,
  TelegramMessagingPlugin,
  WhatsAppMessagingPlugin,
  InstagramMessagingPlugin,
  FacebookMessagingPlugin,
  PluginManager
} from './storagePlugin';