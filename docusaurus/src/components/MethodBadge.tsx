import React from 'react';
import styles from './MethodBadge.module.css';
import clsx from 'clsx';

type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' | 'WSS';

export default function MethodBadge({ method }: { method: Method }) {
  return (
    <span className={clsx(styles.badge, styles[`m_${method.toLowerCase()}`])}>
      {method}
    </span>
  );
}
