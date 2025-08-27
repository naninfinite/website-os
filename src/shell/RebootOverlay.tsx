/**
 * SUMMARY
 * Full-screen reboot overlay (fade). Respects prefers-reduced-motion.
 */
import React from 'react';

export function RebootOverlay(): JSX.Element {
  return (
    <div role="status" aria-live="polite" className="reboot-overlay">
      <div style={{ fontWeight: 600, letterSpacing: 1 }}>Rebooting…</div>
    </div>
  );
}


