import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'T1API',
  tagline: 'Formula 1 telemetry & timing API',
  favicon: 'img/logo.png',

  url: 'https://docs.t1f1.com',
  baseUrl: '/',

  organizationName: 't1api',
  projectName: 't1api-docs',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: undefined,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      logo: {
        alt: 'T1API',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        { to: '/playground', label: 'Playground', position: 'left' },
        { to: '/docs/changelog', label: 'Changelog', position: 'left' },
        {
          href: 'https://api.t1f1.com',
          label: 'API',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/docs/intro' },
            { label: 'Quick Start', to: '/docs/getting-started/quick-start' },
            { label: 'Endpoints', to: '/docs/endpoints/v1/top-speed' },
            { label: 'Schemas', to: '/docs/schemas/telemetry' },
          ],
        },
        {
          title: 'Tools',
          items: [
            { label: 'Playground', to: '/playground' },
            { label: 'Changelog', to: '/docs/changelog' },
            { label: 'SDKs', to: '/docs/sdks/javascript' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'API Status', href: 'https://api.t1f1.com' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} T1API. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.vsDark,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'json', 'python', 'go'],
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // Legacy long-anchor pages → first item of each section.
          // Hash fragments are dropped by static redirects; users land on the
          // section index and the local search covers the rest.
          { from: '/docs', to: '/docs/intro' },
          { from: '/docs/endpoints', to: '/docs/endpoints/v1/top-speed' },
          { from: '/docs/schemas', to: '/docs/schemas/telemetry' },
          { from: '/docs/websocket', to: '/docs/websocket/overview' },
          { from: '/docs/sdks', to: '/docs/sdks/javascript' },
        ],
      },
    ],
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        docsRouteBasePath: '/docs',
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],
};

export default config;
