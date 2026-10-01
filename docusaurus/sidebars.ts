import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/quick-start',
        'getting-started/authentication',
        'getting-started/rate-limits',
        'getting-started/errors',
      ],
    },
    {
      type: 'category',
      label: 'V1 Endpoints',
      collapsed: false,
      items: [
        'endpoints/v1/top-speed',
        'endpoints/v1/throttle',
        'endpoints/v1/qualifying',
        'endpoints/v1/speed-distribution',
        'endpoints/v1/lap-times',
        'endpoints/v1/two-driver',
        'endpoints/v1/seasonal',
        'endpoints/v1/analytics',
      ],
    },
    {
      type: 'category',
      label: 'V2 Endpoints',
      collapsed: false,
      items: [
        'endpoints/v2/top-speed-telemetry',
        'endpoints/v2/speed-trap',
        'endpoints/v2/throttle',
        'endpoints/v2/speed-distribution',
        'endpoints/v2/seasonal',
      ],
    },
    {
      type: 'category',
      label: 'Static Data',
      collapsed: true,
      items: [
        'endpoints/static/drivers',
        'endpoints/static/teams',
        'endpoints/static/circuits',
      ],
    },
    {
      type: 'category',
      label: 'Monitoring',
      collapsed: true,
      items: [
        'endpoints/monitoring/health',
        'endpoints/monitoring/metrics',
        'endpoints/monitoring/prometheus',
      ],
    },
    {
      type: 'category',
      label: 'Real-Time / WebSocket',
      collapsed: true,
      items: [
        'websocket/overview',
        'websocket/streams',
        'websocket/polling',
      ],
    },
    {
      type: 'category',
      label: 'Schemas',
      collapsed: true,
      items: [
        'schemas/telemetry',
        'schemas/timing',
        'schemas/session-params',
        'schemas/errors',
      ],
    },
    {
      type: 'category',
      label: 'SDKs',
      collapsed: true,
      items: [
        'sdks/javascript',
        'sdks/python',
        'sdks/go',
      ],
    },
    'changelog',
  ],
};

export default sidebars;
