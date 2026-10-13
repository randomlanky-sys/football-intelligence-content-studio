// packages/api/src/routes/media.ts
export const mediaRoutes = async (fastify, options) => {
  fastify.get('/', async (request, reply) => {
    return { media: [] };
  });

  fastify.post('/', async (request, reply) => {
    return { id: '1', name: 'Test Media' };
  });

  fastify.get('/:mediaId', async (request, reply) => {
    const { mediaId } = request.params as { mediaId: string };
    return { id: mediaId, name: 'Test Media' };
  });

  fastify.put('/:mediaId', async (request, reply) => {
    const { mediaId } = request.params as { mediaId: string };
    return { id: mediaId, updated: true };
  });

  fastify.delete('/:mediaId', async (request, reply) => {
    const { mediaId } = request.params as { mediaId: string };
    return { id: mediaId, deleted: true };
  });
};

export default mediaRoutes;