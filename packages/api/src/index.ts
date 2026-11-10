import Fastify, { type FastifyInstance } from 'fastify';
import { ProjectRepository } from './repo.js';
import { projectRoutes } from './routes/project.js';
import { mediaRoutes } from './routes/media.js';
import { listPlugins, getPlugin } from './plugins/registry.js';

export interface ApiConfig {
  logger?: boolean;
  repo?: ProjectRepository;
}

export interface Api {
  app: FastifyInstance;
  start: () => Promise<string>;
  repo: ProjectRepository;
  plugins: typeof listPlugins;
  plugin: typeof getPlugin;
}

/**
 * Build the API without listening. Routes are transport-only; domain state lives
 * in the repository so a persistent implementation can be swapped in later.
 */
export function buildApi(config: ApiConfig = {}): Api {
  const app = Fastify({ logger: config.logger ?? false });
  const repo = config.repo ?? new ProjectRepository();
  const startedAt = Date.now();

  app.addHook('onSend', async (_request, reply, payload) => {
    reply.header('x-content-type-options', 'nosniff');
    reply.header('x-frame-options', 'DENY');
    reply.header('referrer-policy', 'no-referrer');
    reply.header('cache-control', 'no-store');
    return payload;
  });

  app.get('/healthz', async () => ({
    status: 'ok',
    service: 'fics-api',
    version: '0.2.0',
    uptimeMs: Date.now() - startedAt,
  }));

  app.get('/readyz', async (_request, reply) => {
    const ready = repo.size >= 0;
    if (!ready) return reply.code(503).send({ status: 'unavailable' });
    return { status: 'ready', projects: repo.size };
  });

  app.get('/v1/plugins', async () => {
    const plugins = listPlugins();
    return {
      plugins,
      summary: {
        total: plugins.length,
        configured: plugins.filter((plugin) => plugin.status === 'configured').length,
        unconfigured: plugins.filter((plugin) => plugin.status === 'unconfigured').length,
      },
    };
  });

  app.register(projectRoutes, { prefix: '/v1/projects', repo });
  app.register(mediaRoutes, { prefix: '/v1/media' });

  const start = async (): Promise<string> => {
    const port = Number(process.env['PORT'] ?? 3000);
    await app.listen({ port, host: '0.0.0.0' });
    const address = app.server.address();
    return typeof address === 'string' ? address : `http://0.0.0.0:${port}`;
  };

  return { app, start, repo, plugins: listPlugins, plugin: getPlugin };
}

export { buildApi as default };
