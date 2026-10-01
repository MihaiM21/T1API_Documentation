import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  FALLBACK_ENDPOINTS,
  parseOpenApi,
  type EndpointDef,
} from '@site/src/components/playground/endpoints';
import styles from './playground.module.css';

const API_BASE = 'https://api.t1f1.com';
const KEY_STORAGE = 't1api.key';
const HIST_STORAGE = 't1api.history.v1';

interface HistoryItem {
  id: string;
  ts: number;
  method: string;
  url: string;
  status: number | null;
  durationMs: number | null;
  ok: boolean;
}

function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setVal(JSON.parse(raw));
    } catch {}
  }, [key]);
  const update = useCallback(
    (v: T) => {
      setVal(v);
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {}
    },
    [key]
  );
  return [val, update];
}

function PlaygroundInner() {
  const [endpoints, setEndpoints] = useState<EndpointDef[]>(FALLBACK_ENDPOINTS);
  const [specLoaded, setSpecLoaded] = useState<'fallback' | 'live' | 'loading'>('loading');
  const [apiKey, setApiKey] = useLocalStorage<string>(KEY_STORAGE, '');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>(HIST_STORAGE, []);

  const [selectedId, setSelectedId] = useState<string>(FALLBACK_ENDPOINTS[0].id);
  const [params, setParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<{
    status: number;
    headers: Record<string, string>;
    body: string;
    contentType: string;
    durationMs: number;
    blobUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try to load real OpenAPI spec at runtime
  useEffect(() => {
    let cancelled = false;
    fetch('/openapi.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((spec) => {
        if (cancelled) return;
        const parsed = parseOpenApi(spec);
        if (parsed.length) {
          setEndpoints(parsed);
          setSpecLoaded('live');
        } else {
          setSpecLoaded('fallback');
        }
      })
      .catch(() => {
        if (!cancelled) setSpecLoaded('fallback');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => endpoints.find((e) => e.id === selectedId) ?? endpoints[0],
    [selectedId, endpoints]
  );

  // Reset params on selection change with example defaults
  useEffect(() => {
    if (!selected) return;
    const init: Record<string, string> = {};
    for (const p of selected.params) {
      if (p.example !== undefined) init[p.name] = String(p.example);
    }
    setParams(init);
    setResponse(null);
    setError(null);
  }, [selectedId, selected]);

  const grouped = useMemo(() => {
    const m = new Map<string, EndpointDef[]>();
    for (const e of endpoints) {
      const arr = m.get(e.group) ?? [];
      arr.push(e);
      m.set(e.group, arr);
    }
    return Array.from(m.entries());
  }, [endpoints]);

  const buildUrl = useCallback((): string => {
    if (!selected) return '';
    let path = selected.path;
    const qs: string[] = [];
    for (const p of selected.params) {
      const v = params[p.name];
      if (v === undefined || v === '') continue;
      if (p.in === 'path') {
        path = path.replace(`{${p.name}}`, encodeURIComponent(v));
      } else {
        qs.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(v)}`);
      }
    }
    return API_BASE + path + (qs.length ? '?' + qs.join('&') : '');
  }, [selected, params]);

  const send = useCallback(async () => {
    if (!selected) return;
    const url = buildUrl();
    if (!url) return;

    const missing = selected.params.filter((p) => p.required && !params[p.name]);
    if (missing.length) {
      setError(`Missing required parameter(s): ${missing.map((p) => p.name).join(', ')}`);
      return;
    }
    if (selected.auth && !apiKey) {
      setError('This endpoint requires an API key. Paste yours above.');
      return;
    }

    setError(null);
    setLoading(true);
    setResponse(null);
    const t0 = performance.now();
    try {
      const headers: Record<string, string> = { Accept: 'application/json, image/png;q=0.9, */*;q=0.5' };
      if (selected.auth && apiKey) headers['X-API-Key'] = apiKey;

      const res = await fetch(url, { method: selected.method, headers });
      const durationMs = Math.round(performance.now() - t0);
      const contentType = res.headers.get('content-type') ?? '';
      const headerObj: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headerObj[k] = v;
      });

      let body = '';
      let blobUrl: string | undefined;
      if (contentType.startsWith('image/')) {
        const blob = await res.blob();
        blobUrl = URL.createObjectURL(blob);
        body = `<binary ${blob.size} bytes>`;
      } else if (contentType.includes('application/json')) {
        const text = await res.text();
        try {
          body = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          body = text;
        }
      } else {
        body = await res.text();
      }

      setResponse({ status: res.status, headers: headerObj, body, contentType, durationMs, blobUrl });

      const item: HistoryItem = {
        id: Math.random().toString(36).slice(2),
        ts: Date.now(),
        method: selected.method,
        url,
        status: res.status,
        durationMs,
        ok: res.ok,
      };
      setHistory([item, ...history].slice(0, 10));
    } catch (e: any) {
      setError(e?.message ?? 'Request failed (possibly a CORS error). Check the API allows browser requests from this origin.');
    } finally {
      setLoading(false);
    }
  }, [selected, buildUrl, apiKey, params, history, setHistory]);

  if (!selected) return null;

  const previewUrl = buildUrl();
  const statusClass =
    response &&
    (response.status < 300 ? styles.statusOk : response.status < 400 ? styles.statusRedirect : styles.statusErr);

  return (
    <div className={styles.layout}>
      {/* Left rail */}
      <aside className={styles.left}>
        <div className={styles.leftHeader}>
          <h3 className={styles.leftTitle}>Endpoints</h3>
          <span className={styles.specTag} data-state={specLoaded}>
            {specLoaded === 'live' ? 'live spec' : specLoaded === 'fallback' ? 'fallback' : 'loading'}
          </span>
        </div>
        {grouped.map(([group, items]) => (
          <div key={group} className={styles.group}>
            <div className={styles.groupTitle}>{group}</div>
            {items.map((e) => (
              <button
                key={e.id}
                className={`${styles.endpointBtn} ${e.id === selectedId ? styles.endpointBtnActive : ''}`}
                onClick={() => setSelectedId(e.id)}
                title={e.summary}
              >
                <span className={styles.miniMethod}>{e.method}</span>
                <span className={styles.endpointPath}>{e.path}</span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Auth bar */}
        <div className={styles.authBar}>
          <label className={styles.authLabel}>API Key</label>
          <input
            type="password"
            className={styles.keyInput}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your X-API-Key (stored locally, never sent anywhere except api.t1f1.com)"
            autoComplete="off"
            spellCheck={false}
          />
          {apiKey && (
            <button className={styles.clearBtn} onClick={() => setApiKey('')} title="Clear stored key">
              Clear
            </button>
          )}
        </div>

        {/* Endpoint header */}
        <div className={styles.endpointHeader}>
          <span className={`${styles.bigMethod} ${styles[`method_${selected.method.toLowerCase()}`]}`}>
            {selected.method}
          </span>
          <code className={styles.bigPath}>{selected.path}</code>
        </div>
        <p className={styles.summary}>{selected.summary}</p>

        {/* Params */}
        {selected.params.length > 0 && (
          <div className={styles.paramSection}>
            <h4 className={styles.sectionTitle}>Parameters</h4>
            <div className={styles.paramGrid}>
              {selected.params.map((p) => (
                <div key={p.name} className={styles.paramRow}>
                  <label className={styles.paramLabel}>
                    <span className={styles.paramName}>{p.name}</span>
                    <span className={styles.paramMeta}>
                      {p.in} · {p.type}
                      {p.required && <span className={styles.required}> *</span>}
                    </span>
                  </label>
                  {p.enum ? (
                    <select
                      className={styles.paramInput}
                      value={params[p.name] ?? ''}
                      onChange={(e) => setParams({ ...params, [p.name]: e.target.value })}
                    >
                      <option value="">—</option>
                      {p.enum.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={p.type === 'integer' || p.type === 'number' ? 'number' : 'text'}
                      className={styles.paramInput}
                      value={params[p.name] ?? ''}
                      onChange={(e) => setParams({ ...params, [p.name]: e.target.value })}
                      placeholder={p.example !== undefined ? String(p.example) : p.description}
                    />
                  )}
                  {p.description && <span className={styles.paramDesc}>{p.description}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview URL + Send */}
        <div className={styles.previewBar}>
          <code className={styles.previewUrl}>{previewUrl}</code>
          <button className={styles.sendBtn} onClick={send} disabled={loading}>
            {loading ? 'Sending…' : 'Send request'}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* Response */}
        {response && (
          <div className={styles.responsePanel}>
            <div className={styles.responseHead}>
              <span className={`${styles.statusBadge} ${statusClass}`}>{response.status}</span>
              <span className={styles.responseMeta}>
                {response.durationMs} ms · {response.contentType || 'unknown'}
              </span>
            </div>

            {response.blobUrl ? (
              <div className={styles.imagePreview}>
                <img src={response.blobUrl} alt="Response" />
              </div>
            ) : (
              <pre className={styles.responseBody}>{response.body}</pre>
            )}

            <details className={styles.headersBlock}>
              <summary>Response headers</summary>
              <pre>
                {Object.entries(response.headers)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join('\n')}
              </pre>
            </details>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className={styles.historyPanel}>
            <h4 className={styles.sectionTitle}>Recent requests</h4>
            <ul className={styles.historyList}>
              {history.map((h) => (
                <li key={h.id} className={styles.historyItem}>
                  <span className={`${styles.miniMethod} ${h.ok ? styles.histOk : styles.histErr}`}>
                    {h.method}
                  </span>
                  <span className={styles.histUrl}>{h.url.replace(API_BASE, '')}</span>
                  <span className={styles.histMeta}>
                    {h.status} · {h.durationMs}ms
                  </span>
                </li>
              ))}
            </ul>
            <button className={styles.clearBtn} onClick={() => setHistory([])}>
              Clear history
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PlaygroundPage(): JSX.Element {
  return (
    <Layout title="API Playground" description="Try T1API endpoints live from your browser">
      <BrowserOnly>{() => <PlaygroundInner />}</BrowserOnly>
    </Layout>
  );
}
