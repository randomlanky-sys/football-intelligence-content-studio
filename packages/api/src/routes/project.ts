// packages/api/src/routes/project.ts
import Fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export const projectRoutes = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return { projects: [] };
  });

  fastify.post('/', async (request, reply) => {
    // In a real app, we would validate the request body and then create a project.
    return { id: '1', name: 'Test Project' };
  });

  fastify.get('/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    return { id: projectId, name: 'Test Project' };
  });

  fastify.put('/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    return { id: projectId, updated: true };
  });

  fastify.delete('/:projectId', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    return { id: projectId, deleted: true };
  });
};

export default projectRoutes;