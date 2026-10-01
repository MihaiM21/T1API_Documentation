import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import ApiVersionBadge from '@site/src/components/ApiVersionBadge';
import styles from './index.module.css';

const features = [
  {
    title: 'Real-Time Telemetry',
    desc: 'Live speed, throttle, brake, gear, and DRS data direct from F1’s livetiming servers via the V2 pipeline.',
  },
  {
    title: 'PNG + JSON Responses',
    desc: 'Every analysis endpoint returns both a production-ready PNG visualization and a structured JSON payload.',
  },
  {
    title: 'Multi-Season History',
    desc: 'Historical race data from 2018 onwards — lap times, sector splits, speed traps, and full telemetry archives.',
  },
  {
    title: 'Secure & Tiered',
    desc: 'API key authentication with three tiers: Public, Standard, and Premium — each with independent rate limits.',
  },
  {
    title: 'Dual Data Pipelines',
    desc: 'V1 uses the FastF1 library for broad compatibility. V2 uses a custom direct client to livetiming.formula1.com.',
  },
  {
    title: 'Production Monitoring',
    desc: 'Prometheus metrics, per-endpoint statistics, request tracing, and Sentry error tracking built in.',
  },
];

const v1Endpoints = [
  ['GET', '/api/v1/top-speed-data', 'Top speed per driver'],
  ['GET', '/api/v1/throttle-comparison-plot', 'Throttle application'],
  ['GET', '/api/v1/qualifying-results-data', 'Qualifying results'],
  ['GET', '/api/v1/track-comparison-2drivers-plot', 'Head-to-head track map'],
  ['GET', '/api/v1/laptimes', 'Lap-by-lap timing'],
  ['GET', '/api/v1/season/{year}/drivers', 'Season driver roster'],
];

const v2Endpoints = [
  ['GET', '/api/v2/top-speed-telemetry-data', 'Telemetry top speed'],
  ['GET', '/api/v2/top-speed-st-data', 'Speed trap measurements'],
  ['GET', '/api/v2/throttle-comparison-data', 'Throttle from telemetry'],
  ['GET', '/api/v2/speed-distribution-data', 'Speed distribution'],
  ['GET', '/api/v2/seasons/{year}/events', 'Season event list'],
  ['GET', '/api/static/circuits', 'Circuit reference data'],
];

const plans = [
  {
    name: 'Public',
    price: 'Free',
    desc: 'Health checks and unauthenticated endpoints. No API key required.',
    features: ['30 req / min', '500 req / hour', 'Health check', 'No API key needed'],
    cta: 'Explore the docs',
    href: '/docs/intro',
    highlight: false,
  },
  {
    name: 'Standard',
    price: 'API Key',
    desc: 'Full access to all V1 and V2 endpoints with a valid API key.',
    features: ['100 req / min', '2,000 req / hour', 'All V1 & V2 endpoints', 'PNG + JSON responses', 'Historical data (2018+)', 'Data endpoints: 60 req/min'],
    cta: 'Request access',
    href: 'https://turnonehub.com/dashboard',
    highlight: true,
  },
  {
    name: 'Premium',
    price: 'Priority',
    desc: 'High-volume access for production sites and integrations.',
    features: ['300 req / min', '10,000 req / hour', 'All Standard features', 'Priority processing', 'Dedicated SLA: 99.9%'],
    cta: 'Contact us',
    href: 'https://turnonehub.com',
    highlight: false,
  },
];

function CodePreview() {
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalBar}>
        <span className={styles.dot} style={{ background: '#ff5f57' }} />
        <span className={styles.dot} style={{ background: '#febc2e' }} />
        <span className={styles.dot} style={{ background: '#28c840' }} />
        <span className={styles.terminalLabel}>terminal</span>
      </div>
      <pre className={styles.terminalBody}>
{`# Get top speed data for Bahrain 2025 Qualifying
curl "https://api.t1f1.com/api/v2/top-speed-telemetry-data?year=2025&gp=1&session=Q" \\
  -H "X-API-Key: your_api_key_here"

# Response
{
  "drivers": [
    { "driver_code": "VER", "top_speed": 326.4, "session": "Q" },
    { "driver_code": "LEC", "top_speed": 324.1, "session": "Q" }
  ]
}`}
      </pre>
    </div>
  );
}

function TrackDivider() {
  return (
    <svg className={styles.trackDivider} viewBox="0 0 1200 24" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="t1grad" x1="0" x2="1">
          <stop offset="0" stopColor="transparent" />
          <stop offset="0.5" stopColor="var(--t1-red)" />
          <stop offset="1" stopColor="transparent" />
        </linearGradient>
      </defs>
      <line x1="0" y1="12" x2="1200" y2="12" stroke="url(#t1grad)" strokeWidth="1" />
      <circle cx="600" cy="12" r="3" fill="var(--t1-red)" />
    </svg>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout
      title="T1API — Formula 1 Telemetry API"
      description="Production-grade Formula 1 telemetry, lap analysis, and visualization REST API."
    >
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.gridBg} aria-hidden />
          <div className={styles.glow} aria-hidden />

          <div className={styles.heroInner}>
            <div className={styles.versionRow}>
              <ApiVersionBadge />
              <span className={styles.tagline}>Turn One Hub · F1 Telemetry Platform</span>
            </div>

            <h1 className={styles.title}>
              Formula 1 Telemetry
              <br />
              <span className={styles.titleAccent}>API for Developers</span>
            </h1>

            <p className={styles.subtitle}>
              T1API is a production-grade FastAPI platform delivering real-time and historical F1
              telemetry, lap analysis, driver comparisons, and PNG visualizations — over a single
              unified REST API.
            </p>

            <div className={styles.ctas}>
              <Link to="/docs/intro" className={styles.ctaPrimary}>
                Read the docs →
              </Link>
              <Link to="/playground" className={styles.ctaSecondary}>
                Try the playground
              </Link>
              <Link to="/docs/endpoints/v1/top-speed" className={styles.ctaGhost}>
                Browse endpoints
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <div className={styles.statValue}>2018+</div>
                <div className={styles.statLabel}>Seasons covered</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>3.7Hz</div>
                <div className={styles.statLabel}>Telemetry rate</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>2</div>
                <div className={styles.statLabel}>Data pipelines</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statValue}>99.9%</div>
                <div className={styles.statLabel}>Uptime SLA</div>
              </div>
            </div>
          </div>
        </section>

        <TrackDivider />

        {/* Code preview */}
        <section className={styles.codeSection}>
          <div className={styles.container}>
            <CodePreview />
          </div>
        </section>

        {/* Features */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.h2}>Built for production</h2>
            <p className={styles.lede}>
              Everything you need to ship F1 data products — from observability to historical
              archives.
            </p>
            <div className={styles.featureGrid}>
              {features.map((f) => (
                <div key={f.title} className={styles.featureCard}>
                  <div className={styles.featureDot} />
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TrackDivider />

        {/* Endpoints */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.h2}>Two pipelines, one API</h2>
            <p className={styles.lede}>
              V1 for deep historical analysis. V2 for real-time current-season data. Pick the one
              that fits your use case — or use both.
            </p>
            <div className={styles.pipelineGrid}>
              <div className={styles.pipelineCard}>
                <div className={styles.pipelineHead}>
                  <span className={styles.pipelineTag}>V1</span>
                  <h3>FastF1 Pipeline</h3>
                  <p>Powered by the FastF1 Python library. Ideal for deep lap-level analysis.</p>
                </div>
                <ul className={styles.endpointList}>
                  {v1Endpoints.map(([method, path, desc]) => (
                    <li key={path}>
                      <span className={styles.method}>{method}</span>
                      <code>{path}</code>
                      <span className={styles.endpointDesc}>{desc}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/docs/endpoints/v1/top-speed" className={styles.cardLink}>
                  View V1 endpoints →
                </Link>
              </div>

              <div className={styles.pipelineCard}>
                <div className={styles.pipelineHead}>
                  <span className={styles.pipelineTag}>V2</span>
                  <h3>Direct F1 Client</h3>
                  <p>
                    Custom client connecting directly to livetiming.formula1.com for real-time data.
                  </p>
                </div>
                <ul className={styles.endpointList}>
                  {v2Endpoints.map(([method, path, desc]) => (
                    <li key={path}>
                      <span className={styles.method}>{method}</span>
                      <code>{path}</code>
                      <span className={styles.endpointDesc}>{desc}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/docs/endpoints/v2/top-speed-telemetry" className={styles.cardLink}>
                  View V2 endpoints →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <TrackDivider />

        {/* Pricing */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.h2}>Tiers & rate limits</h2>
            <p className={styles.lede}>
              Three access levels with independent quotas. Start free, scale when you need to.
            </p>
            <div className={styles.planGrid}>
              {plans.map((p) => (
                <div
                  key={p.name}
                  className={p.highlight ? styles.planCardHighlight : styles.planCard}
                >
                  {p.highlight && <div className={styles.popular}>Most Popular</div>}
                  <div className={styles.planName}>{p.name}</div>
                  <div className={styles.planPrice}>{p.price}</div>
                  <p className={styles.planDesc}>{p.desc}</p>
                  <ul className={styles.planFeatures}>
                    {p.features.map((feat) => (
                      <li key={feat}>{feat}</li>
                    ))}
                  </ul>
                  <Link to={p.href} className={p.highlight ? styles.planCtaPrimary : styles.planCta}>
                    {p.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaCard}>
              <h2 className={styles.h2}>Start shipping in two minutes</h2>
              <p className={styles.lede}>
                Read the quick start, paste your key in the playground, and make your first request.
              </p>
              <div className={styles.ctas}>
                <Link to="/docs/getting-started/quick-start" className={styles.ctaPrimary}>
                  Quick start →
                </Link>
                <Link to="/playground" className={styles.ctaSecondary}>
                  Open playground
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
