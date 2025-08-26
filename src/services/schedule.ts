/**
 * SUMMARY
 * Era schedule loader and utilities. Reads JSON schedule from env URL and
 * computes the active era and time remaining. Pure logic, suitable for tests.
 */

export type EraScheduleItem = {
  id: string; // must match EraId
  start: string; // ISO
  end: string; // ISO
};

export async function loadEraSchedule(url: string): Promise<EraScheduleItem[]> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load era schedule: ${response.status}`);
  const data = (await response.json()) as EraScheduleItem[];
  return data;
}

export function getActiveEra(now: Date, schedule: EraScheduleItem[]): {
  active: EraScheduleItem | null;
  next: EraScheduleItem | null;
  msUntilFlip: number | null;
} {
  const time = now.getTime();
  const withMs = schedule.map((s) => ({
    ...s,
    startMs: new Date(s.start).getTime(),
    endMs: new Date(s.end).getTime(),
  }));
  const active = withMs.find((s) => time >= s.startMs && time < s.endMs) ?? null;
  const next = withMs.find((s) => (active ? s.startMs >= active.endMs : s.startMs > time)) ?? null;
  const msUntilFlip = active ? active.endMs - time : next ? next.startMs - time : null;
  return { active: active ?? null, next: next ?? null, msUntilFlip };
}


