import { describe, expect, test } from 'vitest';
import { buildApi } from './index.js';

const base = '/v1/projects';

async function createProject(name = 'Atlantic FC vs Highveld United') {
  const api = buildApi();
  const response = await api.app.inject({
    method: 'POST',
    url: base,
    payload: { name },
  });
  const body = response.json() as { project: { id: string; rev: number; name: string } };
  return { api, response, project: body.project };
}

describe('api bootstrap', () => {
  test('buildApi exposes start, repo and plugin helpers', () => {
    const api = buildApi();
    expect(typeof api.start).toBe('function');
    expect(api.repo.size).toBe(0);
    expect(api.plugins().length).toBeGreaterThan(0);
  });

  test('health and readiness endpoints report state', async () => {
    const api = buildApi();
    const health = await api.app.inject({ method: 'GET', url: '/healthz' });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toMatchObject({ status: 'ok', service: 'fics-api' });

    const ready = await api.app.inject({ method: 'GET', url: '/readyz' });
    expect(ready.statusCode).toBe(200);
    expect(ready.json()).toMatchObject({ status: 'ready', projects: 0 });
  });

  test('responses carry security headers and no-store caching', async () => {
    const api = buildApi();
    const response = await api.app.inject({ method: 'GET', url: '/healthz' });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['cache-control']).toBe('no-store');
  });
});

describe('projects CRUD', () => {
  test('creates a project with ETag and Location', async () => {
    const { response, project } = await createProject();
    expect(response.statusCode).toBe(201);
    expect(response.headers['etag']).toBe('W/"rev-1"');
    expect(response.headers['location']).toBe(`${base}/${project.id}`);
    expect(project.name).toBe('Atlantic FC vs Highveld United');
    expect(project.rev).toBe(1);
  });

  test('lists and fetches a project', async () => {
    const { api, project } = await createProject();
    const list = await api.app.inject({ method: 'GET', url: base });
    expect(list.statusCode).toBe(200);
    expect((list.json() as { projects: unknown[] }).projects).toHaveLength(1);

    const fetched = await api.app.inject({ method: 'GET', url: `${base}/${project.id}` });
    expect(fetched.statusCode).toBe(200);
    expect(fetched.headers['etag']).toBe('W/"rev-1"');
  });

  test('rejects an invalid create payload with problem+json', async () => {
    const api = buildApi();
    const response = await api.app.inject({ method: 'POST', url: base, payload: { name: '   ' } });
    expect(response.statusCode).toBe(422);
    expect(response.headers['content-type']).toContain('application/problem+json');
    const body = response.json() as { code: string; issues: unknown[] };
    expect(body.code).toBe('validation_failed');
    expect(body.issues.length).toBeGreaterThan(0);
  });

  test('patches with If-Match and bumps the revision', async () => {
    const { api, project } = await createProject();
    const patched = await api.app.inject({
      method: 'PATCH',
      url: `${base}/${project.id}`,
      headers: { 'if-match': 'W/"rev-1"' },
      payload: { state: 'active' },
    });
    expect(patched.statusCode).toBe(200);
    expect(patched.headers['etag']).toBe('W/"rev-2"');
    expect((patched.json() as { project: { state: string } }).project.state).toBe('active');
  });

  test('returns 409 on a stale If-Match', async () => {
    const { api, project } = await createProject();
    const conflict = await api.app.inject({
      method: 'PATCH',
      url: `${base}/${project.id}`,
      headers: { 'if-match': 'W/"rev-9"' },
      payload: { name: 'Renamed' },
    });
    expect(conflict.statusCode).toBe(409);
    expect(conflict.json()).toMatchObject({ code: 'rev_conflict', currentRev: 1 });
  });

  test('deletes a project and then reports 404', async () => {
    const { api, project } = await createProject();
    const deleted = await api.app.inject({ method: 'DELETE', url: `${base}/${project.id}` });
    expect(deleted.statusCode).toBe(204);

    const missing = await api.app.inject({ method: 'GET', url: `${base}/${project.id}` });
    expect(missing.statusCode).toBe(404);
    expect(missing.json()).toMatchObject({ code: 'not_found' });
  });

  test('filters by owner', async () => {
    const api = buildApi();
    await api.app.inject({ method: 'POST', url: base, payload: { name: 'A', ownerId: 'ana' } });
    await api.app.inject({ method: 'POST', url: base, payload: { name: 'B', ownerId: 'coach' } });
    const filtered = await api.app.inject({ method: 'GET', url: `${base}?ownerId=ana` });
    expect((filtered.json() as { projects: unknown[] }).projects).toHaveLength(1);
  });
});

describe('media and plugins', () => {
  test('creates, fetches and deletes a media record', async () => {
    const api = buildApi();
    const created = await api.app.inject({
      method: 'POST',
      url: '/v1/media',
      payload: {
        projectId: '9f1c1e5e-6a1a-4a2b-9d1a-0b1c2d3e4f50',
        kind: 'video',
        filename: 'match.mp4',
        sizeBytes: 1024,
        fingerprint: 'sha256:abc',
      },
    });
    expect(created.statusCode).toBe(201);
    const media = (created.json() as { media: { id: string } }).media;
    expect(created.headers['location']).toBe(`/v1/media/${media.id}`);

    const fetched = await api.app.inject({ method: 'GET', url: `/v1/media/${media.id}` });
    expect(fetched.statusCode).toBe(200);

    const deleted = await api.app.inject({ method: 'DELETE', url: `/v1/media/${media.id}` });
    expect(deleted.statusCode).toBe(204);
  });

  test('plugin catalogue reports configuration status without secrets', async () => {
    const api = buildApi();
    const response = await api.app.inject({ method: 'GET', url: '/v1/plugins' });
    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      plugins: { id: string; requiredEnv: string[]; status: string }[];
      summary: { total: number; configured: number; unconfigured: number };
    };
    expect(body.plugins.length).toBe(body.summary.total);
    expect(body.summary.configured + body.summary.unconfigured).toBe(body.summary.total);
    expect(JSON.stringify(body)).not.toContain('oc_sk_');
  });
});
