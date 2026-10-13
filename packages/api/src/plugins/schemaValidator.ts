// packages/api/src/plugins/schemaValidator.ts
import Fastify from 'fastify';
import type { ZodSchema } from 'zod';
import type { TypeOf } from '@sinclair/typebox';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import { projectSchema } from '@fics/schema';
import { mediaSchema } from '@fics/schema';

// Extend Fastify's built-in ZodTypeProvider to include our custom schemas
declare module 'fastify' {
  interface FastifyRequest {
    // Attach validated data from schema
    validatedBody?: TypeOf<typeof projectSchema>;
    validatedParams?: TypeOf<typeof mediaSchema>;
    validatedQuery?: TypeOf<Zod.ZodObject<{}>>;
  }
}

export function schemaValidator(fastify, options, done) {
  // Register Zod schemas with Fastify for request validation
  fastify.decorate('projectSchema', projectSchema);
  fastify.decorate('mediaSchema', mediaSchema);

  fastify.addHook('onRequest', (request, reply, next) => {
    // Basic validation hook - in a full implementation,
    // would validate using the decorated schemas
    next();
  });

  done();
}

export default schemaValidator;