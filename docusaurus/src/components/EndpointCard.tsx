import React from 'react';
import MethodBadge from './MethodBadge';
import styles from './EndpointCard.module.css';

type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' | 'WSS';

export default function EndpointCard({
  method,
  path,
  description,
}: {
  method: Method;
  path: string;
  description?: string;
}) {
  return (
    <div className={styles.card}>
      <MethodBadge method={method} />
      <div className={styles.body}>
        <code className={styles.path}>{path}</code>
        {description && <p className={styles.desc}>{description}</p>}
      </div>
    </div>
  );
}
