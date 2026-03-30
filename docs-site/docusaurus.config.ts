import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Auto Scan Backend Docs',
  tagline: 'Arquitetura, operacao e integracoes do backend em um portal unico.',
  favicon: 'img/favicon.ico',
  future: {
    v4: true,
  },
  url: 'http://localhost',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Auto Scan Backend',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentacao',
        },
        {to: '/docs/api/swagger-e-contratos', label: 'API', position: 'left'},
        {to: '/docs/operacoes/runbook-operacional', label: 'Runbook', position: 'left'},
        {
          href: 'http://localhost:3000/api/docs',
          label: 'Swagger Local',
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
            {
              label: 'Visao geral',
              to: '/docs/intro',
            },
            {
              label: 'Arquitetura',
              to: '/docs/arquitetura/visao-arquitetural',
            },
          ],
        },
        {
          title: 'Operacao',
          items: [
            {
              label: 'Subindo o backend',
              to: '/docs/getting-started/subindo-o-backend',
            },
            {
              label: 'Runbook operacional',
              to: '/docs/operacoes/runbook-operacional',
            },
          ],
        },
        {
          title: 'Integracoes',
          items: [
            {
              label: 'Estoque e operacao',
              to: '/docs/operacoes/estoque-e-operacao',
            },
            {
              label: 'Cobranca e comunicacao',
              to: '/docs/integracoes/cobranca-e-comunicacao',
            },
          ],
        },
      ],
      copyright: `Auto Scan Backend Docs ${new Date().getFullYear()} · Documentacao viva do backend.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
