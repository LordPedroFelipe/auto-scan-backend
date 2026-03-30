import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/visao-geral',
        'getting-started/subindo-o-backend',
      ],
    },
    {
      type: 'category',
      label: 'Arquitetura',
      items: [
        'arquitetura/visao-arquitetural',
        'arquitetura/ia-chat',
      ],
    },
    {
      type: 'category',
      label: 'Operacoes',
      items: [
        'operacoes/ambientes-e-execucao',
        'operacoes/deploy',
        'operacoes/variaveis-de-ambiente',
        'operacoes/migrations',
        'operacoes/estoque-e-operacao',
        'operacoes/runbook-de-cobranca',
        'operacoes/runbook-operacional',
        'operacoes/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Integracoes',
      items: [
        'integracoes/cobranca-e-comunicacao',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/swagger-e-contratos',
      ],
    },
  ],
};

export default sidebars;
