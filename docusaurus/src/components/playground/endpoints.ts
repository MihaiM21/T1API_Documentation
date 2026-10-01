// Fallback endpoint catalog used when /openapi.json is unavailable.
// When you drop a real OpenAPI spec at static/openapi.json this is overridden at runtime.

export type ParamLoc = 'query' | 'path';

export interface EndpointParam {
  name: string;
  in: ParamLoc;
  required: boolean;
  type: 'string' | 'integer' | 'number' | 'boolean';
  description?: string;
  example?: string | number;
  enum?: string[];
}

export interface EndpointDef {
  id: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  path: string;
  summary: string;
  group: string;
  auth: boolean;
  params: EndpointParam[];
}

const sessionParams: EndpointParam[] = [
  { name: 'year', in: 'query', required: true, type: 'integer', description: 'Season year', example: 2025 },
  { name: 'gp', in: 'query', required: true, type: 'string', description: 'Round number or event name', example: '1' },
  { name: 'session', in: 'query', required: true, type: 'string', description: 'Session type', example: 'Q', enum: ['Q', 'R', 'FP1', 'FP2', 'FP3', 'S', 'SQ'] },
];

export const FALLBACK_ENDPOINTS: EndpointDef[] = [
  {
    id: 'health',
    method: 'GET',
    path: '/api/health',
    summary: 'Health check (no auth)',
    group: 'General',
    auth: false,
    params: [],
  },
  {
    id: 'root',
    method: 'GET',
    path: '/',
    summary: 'Welcome / API version',
    group: 'General',
    auth: false,
    params: [],
  },
  // V1
  {
    id: 'v1-top-speed-data',
    method: 'GET',
    path: '/api/v1/top-speed-data',
    summary: 'Top speed per driver (JSON)',
    group: 'V1 — FastF1',
    auth: true,
    params: sessionParams,
  },
  {
    id: 'v1-throttle-data',
    method: 'GET',
    path: '/api/v1/throttle-comparison-data',
    summary: 'Throttle comparison (JSON)',
    group: 'V1 — FastF1',
    auth: true,
    params: sessionParams,
  },
  {
    id: 'v1-qualifying-data',
    method: 'GET',
    path: '/api/v1/qualifying-results-data',
    summary: 'Qualifying results (JSON)',
    group: 'V1 — FastF1',
    auth: true,
    params: sessionParams,
  },
  {
    id: 'v1-speeddist-data',
    method: 'GET',
    path: '/api/v1/speed-distribution-data',
    summary: 'Speed distribution (JSON)',
    group: 'V1 — FastF1',
    auth: true,
    params: [
      ...sessionParams,
      { name: 'driver', in: 'query', required: false, type: 'string', description: '3-letter driver code' },
    ],
  },
  {
    id: 'v1-laptimes',
    method: 'GET',
    path: '/api/v1/laptimes',
    summary: 'Lap times for a single driver',
    group: 'V1 — FastF1',
    auth: true,
    params: [
      ...sessionParams,
      { name: 'driver', in: 'query', required: true, type: 'string', description: '3-letter driver code', example: 'VER' },
    ],
  },
  {
    id: 'v1-2driver-data',
    method: 'GET',
    path: '/api/v1/throttleBrake-comparison-2drivers-data',
    summary: '2-driver throttle/brake comparison',
    group: 'V1 — FastF1',
    auth: true,
    params: [
      ...sessionParams,
      { name: 'driver1', in: 'query', required: true, type: 'string', example: 'VER' },
      { name: 'driver2', in: 'query', required: true, type: 'string', example: 'LEC' },
    ],
  },
  {
    id: 'v1-seasons',
    method: 'GET',
    path: '/api/v1/seasons',
    summary: 'List all seasons',
    group: 'V1 — FastF1',
    auth: true,
    params: [],
  },
  {
    id: 'v1-season-drivers',
    method: 'GET',
    path: '/api/v1/season/{year}/drivers',
    summary: 'Drivers for season',
    group: 'V1 — FastF1',
    auth: true,
    params: [{ name: 'year', in: 'path', required: true, type: 'integer', example: 2025 }],
  },
  // V2
  {
    id: 'v2-top-speed-data',
    method: 'GET',
    path: '/api/v2/top-speed-telemetry-data',
    summary: 'Top speed from telemetry (JSON)',
    group: 'V2 — Direct F1',
    auth: true,
    params: sessionParams,
  },
  {
    id: 'v2-speed-trap',
    method: 'GET',
    path: '/api/v2/top-speed-st-data',
    summary: 'Speed trap (JSON)',
    group: 'V2 — Direct F1',
    auth: true,
    params: sessionParams,
  },
  {
    id: 'v2-throttle-data',
    method: 'GET',
    path: '/api/v2/throttle-comparison-data',
    summary: 'Throttle comparison (JSON)',
    group: 'V2 — Direct F1',
    auth: true,
    params: sessionParams,
  },
  {
    id: 'v2-speeddist',
    method: 'GET',
    path: '/api/v2/speed-distribution-data',
    summary: 'Speed distribution (JSON)',
    group: 'V2 — Direct F1',
    auth: true,
    params: sessionParams,
  },
  {
    id: 'v2-season-events',
    method: 'GET',
    path: '/api/v2/seasons/{year}/events',
    summary: 'Season event list',
    group: 'V2 — Direct F1',
    auth: true,
    params: [{ name: 'year', in: 'path', required: true, type: 'integer', example: 2025 }],
  },
  // Static
  {
    id: 'static-drivers',
    method: 'GET',
    path: '/api/static/drivers',
    summary: 'All drivers',
    group: 'Static',
    auth: true,
    params: [{ name: 'year', in: 'query', required: false, type: 'integer', example: 2025 }],
  },
  {
    id: 'static-teams',
    method: 'GET',
    path: '/api/static/teams',
    summary: 'All constructors',
    group: 'Static',
    auth: true,
    params: [{ name: 'year', in: 'query', required: false, type: 'integer', example: 2025 }],
  },
  {
    id: 'static-circuits',
    method: 'GET',
    path: '/api/static/circuits',
    summary: 'All circuits',
    group: 'Static',
    auth: true,
    params: [],
  },
  // Monitoring
  {
    id: 'mon-load',
    method: 'GET',
    path: '/api/monitoring/load',
    summary: 'Current load + error rate',
    group: 'Monitoring',
    auth: true,
    params: [],
  },
  {
    id: 'mon-system',
    method: 'GET',
    path: '/api/monitoring/system',
    summary: 'System CPU/RAM/disk',
    group: 'Monitoring',
    auth: true,
    params: [],
  },
];

// Parse a (partial) OpenAPI v3 spec into our internal EndpointDef[].
export function parseOpenApi(spec: any): EndpointDef[] {
  if (!spec || typeof spec !== 'object' || !spec.paths) return [];
  const out: EndpointDef[] = [];
  for (const [pathKey, pathItem] of Object.entries<any>(spec.paths)) {
    for (const method of ['get', 'post', 'delete', 'put', 'patch']) {
      const op = pathItem?.[method];
      if (!op) continue;
      const params: EndpointParam[] = (op.parameters ?? []).map((p: any) => ({
        name: p.name,
        in: (p.in === 'path' ? 'path' : 'query') as ParamLoc,
        required: !!p.required,
        type: (p.schema?.type ?? 'string') as EndpointParam['type'],
        description: p.description,
        example: p.example ?? p.schema?.example,
        enum: p.schema?.enum,
      }));
      out.push({
        id: op.operationId || `${method}-${pathKey}`.replace(/[^a-z0-9]/gi, '-'),
        method: method.toUpperCase() as EndpointDef['method'],
        path: pathKey,
        summary: op.summary || op.description || pathKey,
        group: (op.tags && op.tags[0]) || 'API',
        auth: !!(op.security && op.security.length),
        params,
      });
    }
  }
  return out;
}
