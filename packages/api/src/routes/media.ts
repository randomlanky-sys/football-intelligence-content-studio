import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const createBody = z.object({
  projectId: z.string().uuid(),
  kind: z.enum(['video', 'audio', 'image', 'data']),
  filename: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().nonnegative(),
  fingerprint: z.string().trim().min(1).max(255),
  durationUs: z.number().int().nonnegative().optional(),
});

interface MediaRecord {
  id: string;
  projectId: string;
  kind: 'video' | 'audio' | 'image' | 'data';
  filename: string;
  sizeBytes: number;
  fingerprint: string;
  durationUs: number | null;
  availability: 'local' | 'cloud' | 'proxy';
  createdAt: string;
}

function problem(reply: FastifyReply, status: number, code: string, detail: string) {
  return reply
    .code(status)
    .type('application/problem+json')
    .send({ type: `https://fics.local/problems/${code}`, title: code, status, detail, code });
}

export const mediaRoutes: FastifyPluginAsync = async (fastify) => {
  const items = new Map<string, MediaRecord>();

  fastify.get('/', async () => ({ media: [...items.values()] }));

  fastify.post('/', async (request, reply) => {
    const parsed = createBody.safeParse(request.body ?? {});
    if (!parsed.success) return problem(reply, 422, 'validation_failed', 'Media payload is invalid');
    const record: MediaRecord = {
      id: randomUUID(),
      projectId: parsed.data.projectId,
      kind: parsed.data.kind,
      filename: parsed.data.filename,
      sizeBytes: parsed.data.sizeBytes,
      fingerprint: parsed.data.fingerprint,
      durationUs: parsed.data.durationUs ?? null,
      availability: 'local',
      createdAt: new Date().toISOString(),
    };
    items.set(record.id, record);
    reply.header('location', `/v1/media/${record.id}`);
    return reply.code(201).send({ media: record });
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const record = items.get(id);
    if (!record) return problem(reply, 404, 'not_found', 'Media asset does not exist');
    return { media: record };
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    if (!items.delete(id)) return problem(reply, 404, 'not_found', 'Media asset does not exist');
    return reply.code(204).send();
  });
};

export default mediaRoutes;
