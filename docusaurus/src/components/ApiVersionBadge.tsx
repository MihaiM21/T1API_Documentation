import React, { useEffect, useState } from 'react';
import styles from './ApiVersionBadge.module.css';

export default function ApiVersionBadge() {
  const [version, setVersion] = useState<string>('1.0');
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('https://api.t1f1.com/')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.version) {
          setVersion(String(data.version));
          setLive(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span className={styles.badge} title={live ? 'Live API version' : 'API version'}>
      <span className={styles.dot} data-live={live} />
      v{version}
    </span>
  );
}
