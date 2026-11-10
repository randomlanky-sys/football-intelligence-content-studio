import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { ProjectRepository } from '../repo.js';

const createBody = z.object({
  name: z.string().trim().min(1).max(200),
  ownerId: z.string().trim().min(1).max(120).optional(),
  settings: z.record(z.unknown()).optional(),
});

const updateBody = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    state: z.enum(['draft', 'active', 'review', 'exported', 'archived']).optional(),
    settings: z.record(z.unknown()).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'At least one field is required' });

const listQuery = z.object({
  ownerId: z.string().trim().min(1).max(120).optional(),
});

function problem(reply: FastifyReply, status: number, code: string, detail: string) {
  return reply
    .code(status)
    .type('application/problem+json')
    .send({
      type: `https://fics.local/problems/${code}`,
      title: code.replaceAll('_', ' '),
      status,
      detail,
      code,
    });
}

function etagFor(rev: number): string {
  return `W/"rev-${rev}"`;
}

function parseRev(ifMatch: string | undefined): number | null {
  if (!ifMatch) return null;
  const match = /rev-(\d+)/.exec(ifMatch);
  return match?.[1] ? Number(match[1]) : null;
}

export interface ProjectRoutesOptions {
  repo: ProjectRepository;
}

export const projectRoutes: FastifyPluginAsync<ProjectRoutesOptions> = async (fastify, options) => {
  const { repo } = options;

  fastify.get('/', async (request, reply) => {
    const parsed = listQuery.safeParse(request.query ?? {});
    if (!parsed.success) return problem(reply, 422, 'validation_failed', 'Invalid query parameters');
    return { projects: repo.list(parsed.data.ownerId) };
  });

  fastify.post('/', async (request, reply) => {
    const parsed = createBody.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.code(422).type('application/problem+json').send({
        type: 'https://fics.local/problems/validation_failed',
        title: 'validation_failed',
        status: 422,
        detail: 'Project payload is invalid',
        code: 'validation_failed',
        issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      });
    }
    const project = repo.create(parsed.data);
    reply.header('etag', etagFor(project.rev));
    reply.header('location', `/v1/projects/${project.id}`);
    return reply.code(201).send({ project });
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = repo.get(id);
    if (!project) return problem(reply, 404, 'not_found', 'Project does not exist');
    reply.header('etag', etagFor(project.rev));
    return { project };
  });

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const current = repo.get(id);
    if (!current) return problem(reply, 404, 'not_found', 'Project does not exist');

    const expectedRev = parseRev(request.headers['if-match'] as string | undefined);
    if (expectedRev !== null && expectedRev !== current.rev) {
      return reply.code(409).type('application/problem+json').send({
        type: 'https://fics.local/problems/rev_conflict',
        title: 'rev_conflict',
        status: 409,
        detail: `Project is at revision ${current.rev}`,
        code: 'rev_conflict',
        currentRev: current.rev,
      });
    }

    const parsed = updateBody.safeParse(request.body ?? {});
    if (!parsed.success) return problem(reply, 422, 'validation_failed', 'Project patch is invalid');

    const project = repo.update(id, parsed.data);
    if (!project) return problem(reply, 404, 'not_found', 'Project does not exist');
    reply.header('etag', etagFor(project.rev));
    return { project };
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    if (!repo.delete(id)) return problem(reply, 404, 'not_found', 'Project does not exist');
    return reply.code(204).send();
  });
};

export default projectRoutes;
