import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={clsx(styles.heroBanner)}>
      <div className={clsx('container', styles.heroContainer)}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Documentacao viva do backend</p>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <div className={styles.heroActions}>
            <Link className="button button--primary button--lg" to="/docs/intro">
              Abrir documentacao
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/operacoes/runbook-operacional">
              Ver runbook
            </Link>
          </div>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Escopo</span>
            <strong>Backend NestJS + TypeORM</strong>
            <p>Arquitetura, operacao, IA, cobranca, estoque e contratos de API.</p>
          </div>

          <div className={styles.metricGrid}>
            <div className={styles.metricItem}>
              <span>Documentos</span>
              <strong>8</strong>
            </div>
            <div className={styles.metricItem}>
              <span>Modulos</span>
              <strong>14</strong>
            </div>
            <div className={styles.metricItem}>
              <span>Swagger</span>
              <strong>OpenAPI</strong>
            </div>
            <div className={styles.metricItem}>
              <span>Foco</span>
              <strong>Operacao real</strong>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomeHighlights() {
  const highlights = [
    {
      title: 'Arquitetura por dominio',
      description:
        'Controllers, services, DTOs e entidades organizados por modulo para sustentar evolucao do produto.',
      href: '/docs/arquitetura/visao-arquitetural',
    },
    {
      title: 'Operacao guiada',
      description:
        'Runbooks, ambientes, Docker, migrations e fluxos de sincronizacao descritos com foco em execucao real.',
      href: '/docs/operacoes/ambientes-e-execucao',
    },
    {
      title: 'Integracoes criticas',
      description:
        'Chat com IA, estoque por feed, prontidao de Asaas e comunicacao por SMTP com contexto de negocio.',
      href: '/docs/integracoes/cobranca-e-comunicacao',
    },
  ];

  return (
    <section className={styles.highlightsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Mapa rapido</p>
          <Heading as="h2">O que ja esta organizado</Heading>
          <p>
            A documentacao foi redesenhada para apoiar onboarding tecnico, evolucao de produto e
            operacao do time sem depender de contexto oral.
          </p>
        </div>

        <div className={styles.highlightGrid}>
          {highlights.map((item) => (
            <Link key={item.title} className={styles.highlightCard} to={item.href}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span>Ler secao</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  const links = [
    {label: 'Visao geral do backend', href: '/docs/getting-started/visao-geral'},
    {label: 'Subindo o ambiente local', href: '/docs/getting-started/subindo-o-backend'},
    {label: 'Arquitetura do chat IA', href: '/docs/arquitetura/ia-chat'},
    {label: 'Swagger e contratos', href: '/docs/api/swagger-e-contratos'},
  ];

  return (
    <section className={styles.quickLinksSection}>
      <div className="container">
        <div className={styles.quickLinksPanel}>
          <div>
            <p className={styles.sectionEyebrow}>Acesso rapido</p>
            <Heading as="h2">Entre pelos pontos mais usados</Heading>
          </div>
          <div className={styles.quickLinksGrid}>
            {links.map((item) => (
              <Link key={item.href} className={styles.quickLink} to={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description="Portal de documentacao do backend Auto Scan com arquitetura, operacao, integracoes e API.">
      <HomepageHeader />
      <main>
        <HomeHighlights />
        <QuickLinks />
      </main>
    </Layout>
  );
}
