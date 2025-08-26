/**
 * SUMMARY
 * Real countdown: loads schedule JSON, computes next flip, shows ticking timer
 * (dd:hh:mm:ss). Calls onEraFlip(nextEra) when it reaches zero.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Era } from '../themes/layoutProfiles';

type EraScheduleItem = { id: Era; start: string; end: string };

export function Countdown(props: { currentEra: Era; onEraFlip?: (nextEra: Era) => void }): JSX.Element {
  const url = import.meta.env.VITE_ERA_SCHEDULE_URL ?? '/era-schedule.json';
  const [schedule, setSchedule] = useState<EraScheduleItem[] | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`schedule load failed: ${res.status}`);
        const data = (await res.json()) as EraScheduleItem[];
        if (!cancelled) setSchedule(data);
      } catch {
        if (!cancelled) setSchedule(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { nextId, msRemaining } = useMemo(() => {
    if (!schedule) return { nextId: null as Era | null, msRemaining: null as number | null };
    const nowMs = now;
    const items = schedule.map((s) => ({ ...s, startMs: +new Date(s.start), endMs: +new Date(s.end) }));
    const current = items.find((s) => nowMs >= s.startMs && nowMs < s.endMs) ?? null;
    const next = items.find((s) => (current ? s.startMs >= current.endMs : s.startMs > nowMs)) ?? null;
    const remain = current ? Math.max(0, current.endMs - nowMs) : next ? Math.max(0, next.startMs - nowMs) : null;
    return { nextId: (next?.id ?? null) as Era | null, msRemaining: remain };
  }, [schedule, now]);

  useEffect(() => {
    if (msRemaining == null) return;
    if (msRemaining <= 0 && !firedRef.current && nextId) {
      firedRef.current = true;
      props.onEraFlip?.(nextId);
    }
  }, [msRemaining, nextId, props]);

  const total = msRemaining != null ? Math.ceil(msRemaining / 1000) : null;
  const dd = total != null ? Math.floor(total / 86400).toString().padStart(2, '0') : '--';
  const hh = total != null ? Math.floor((total % 86400) / 3600).toString().padStart(2, '0') : '--';
  const mm = total != null ? Math.floor((total % 3600) / 60).toString().padStart(2, '0') : '--';
  const ss = total != null ? Math.floor(total % 60).toString().padStart(2, '0') : '--';

  return (
    <div className="inline-flex items-center gap-3 px-3 py-1 rounded-token bg-surface-2" style={{ color: 'rgb(var(--text))' }}>
      <span className="text-muted-token">Countdown</span>
      <span className="font-mono">
        {dd}:{hh}:{mm}:{ss}
      </span>
    </div>
  );
}


