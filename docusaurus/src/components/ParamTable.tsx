import React from 'react';
import styles from './ParamTable.module.css';

export interface Param {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  default?: string;
}

export default function ParamTable({ params }: { params: Param[] }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name}>
              <td>
                <code className={styles.name}>{p.name}</code>
              </td>
              <td>
                <code className={styles.type}>{p.type}</code>
              </td>
              <td>
                {p.required ? (
                  <span className={styles.yes}>Yes</span>
                ) : (
                  <span className={styles.no}>No</span>
                )}
              </td>
              <td className={styles.desc}>
                {p.description}
                {p.default !== undefined && (
                  <span className={styles.defaultVal}>
                    {' '}Default: <code>{p.default}</code>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
