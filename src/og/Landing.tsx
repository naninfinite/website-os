/**
 * SUMMARY
 * OG Landing screen: background video with poster fallback; [ ENTER ] CTA.
 * Reduced-motion friendly; Enter key also triggers.
 */
import React, { useEffect, useRef } from 'react';
import styles from './styles/Landing.module.scss';

export function Landing(props: { onEnter: () => void }): JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') props.onEnter(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props]);

  return (
    <div className={styles.root}>
      <video
        ref={videoRef}
        className={styles.videoBg}
        autoPlay
        loop
        muted
        playsInline
        poster="/assets/landing-poster.jpg"
        onError={() => { /* graceful fallback: background stays solid */ }}
      >
        <source src="/assets/landing-bg.mp4" type="video/mp4" />
      </video>
      <div className={styles.panel}>
        <button className={styles.cta} onClick={props.onEnter} aria-label="Enter">
          [ ENTER ]
        </button>
      </div>
    </div>
  );
}
