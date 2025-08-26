/**
 * SUMMARY
 * Full-screen reboot overlay with flicker/fade. Respects prefers-reduced-motion.
 */
import React from 'react';

export function RebootOverlay(): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 grid place-items-center"
      style={{
        backgroundColor: 'rgb(var(--background))',
        color: 'rgb(var(--text))',
        animation: 'reboot-fade var(--duration-slow) ease-in-out infinite alternate',
      }}
    >
      <div style={{ fontWeight: 600, letterSpacing: 1 }}>Rebooting…</div>
      <style>{`
@keyframes reboot-fade { from { opacity: .85 } to { opacity: 1 } }
@media (prefers-reduced-motion: reduce) {
  .fixed.inset-0 { animation: none !important; }
}
      `}</style>
    </div>
  );
}


