// src/lib/timeByProject.ts
import { getCollection } from "astro:content";
import { minutesFromFact } from "./time";

/**
 * Reads logbook entries and totals minutes per project slug.
 * Allocation rule:
 * - If a session summary lists multiple projects, split minutes evenly.
 * - First project gets any remainder minute(s).
 */
export async function getMinutesByProject() {
  const entries = await getCollection("logbook");
  const map: Record<string, number> = {};

  for (const e of entries) {
    const facts = e.data.facts || [];
    const projects = e.data.projects || [];

    // Only entries that contain a "Time worked ..." fact contribute time.
    const timeFact = facts.find((f) =>
      String(f).toLowerCase().includes("time worked")
    );
    if (!timeFact) continue;

    const minutes = minutesFromFact(String(timeFact));
    if (!minutes) continue;

    // Must have at least one project tag to allocate time.
    if (!projects.length) continue;

    const share = Math.floor(minutes / projects.length);
    const remainder = minutes - share * projects.length;

    projects.forEach((slug, idx) => {
      const add = share + (idx === 0 ? remainder : 0);
      map[slug] = (map[slug] || 0) + add;
    });
  }

  return map;
}

export function formatDuration(minutes: number) {
  const m = Math.max(0, Math.floor(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;

  if (h === 0) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
}
