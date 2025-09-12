/**
 * SUMMARY
 * OG AppShell wrapper with CRT scanlines overlay and retro cursor base styles.
 */
import React from 'react';
import styles from './styles/AppShell.module.scss';

export function AppShell(props: { children: React.ReactNode }): JSX.Element {
  return (
    <div className={styles.root}>
      {props.children}
      <div className={styles.crtOverlay} aria-hidden />
    </div>
  );
}
