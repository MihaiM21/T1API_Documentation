import React from 'react';
import clsx from 'clsx';
import styles from './Callout.module.css';

type Variant = 'info' | 'warning' | 'tip' | 'danger';

const LABELS: Record<Variant, string> = {
  info: 'Info',
  warning: 'Warning',
  tip: 'Tip',
  danger: 'Danger',
};

export default function Callout({
  variant = 'info',
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={clsx(styles.callout, styles[variant])}>
      <p className={styles.title}>{title ?? LABELS[variant]}</p>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
