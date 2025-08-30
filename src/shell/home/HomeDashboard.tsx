/**
 * SUMMARY
 * Responsive Home Dashboard grid used by Desktop and Mobile. Supports a
 * session-only Customize mode with keyboardable reorder controls and
 * minimize/hide per-card to demonstrate grow-on-close.
 */
import React, { useMemo, useRef, useState } from 'react';

export type HomeCardSpec = { id: 'icon'|'selector'|'terminal'|'dimension'; component: React.ReactNode; featured?: boolean };

export function HomeDashboard(props: {
  cards: HomeCardSpec[];
  customize: boolean;
  onReorder: (nextOrder: string[]) => void;
}): JSX.Element {
  const { cards, customize, onReorder } = props;
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [order, setOrder] = useState<string[]>(() => cards.map((c) => c.id));
  const liveRef = useRef<HTMLDivElement | null>(null);

  const visibleCards = useMemo(() => cards.filter((c) => !hidden[c.id]).sort((a,b) => order.indexOf(a.id) - order.indexOf(b.id)), [cards, hidden, order]);

  const move = (id: string, delta: number) => {
    const idx = order.indexOf(id);
    if (idx < 0) return;
    const next = [...order];
    const target = Math.max(0, Math.min(order.length - 1, idx + delta));
    next.splice(idx, 1);
    next.splice(target, 0, id);
    setOrder(next);
    onReorder(next);
    if (liveRef.current) liveRef.current.textContent = `Moved ${id} to position ${target + 1}`;
  };

  return (
    <div>
      <div className="home-grid" role="list" aria-label="Home Dashboard">
        {visibleCards.map((c) => (
          <section key={c.id} role="listitem" className={`home-card ${c.featured ? 'home-card--featured' : ''}`} aria-label={`${c.id} card`}>
            <div className="home-card__inner">
              {customize ? (
                <div className="home-card__toolbar">
                  <button className="btn" aria-label={`Move ${c.id} up`} onClick={() => move(c.id, -1)}>↑</button>
                  <button className="btn" aria-label={`Move ${c.id} down`} onClick={() => move(c.id, +1)}>↓</button>
                  <button className="btn" aria-label={`Hide ${c.id}`} onClick={() => setHidden((h) => ({ ...h, [c.id]: true }))}>Minimize</button>
                </div>
              ) : null}
              <div className="home-card__content">{c.component}</div>
            </div>
          </section>
        ))}
      </div>
      <div ref={liveRef} aria-live="polite" className="sr-only" />
    </div>
  );
}

export default HomeDashboard;


