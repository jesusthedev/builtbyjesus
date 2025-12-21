import { getCollection } from "astro:content";
import { minutesFromFact } from "./time";

export async function getTotalMinutes() {
  const entries = await getCollection("logbook");

  let total = 0;

  for (const e of entries) {
    for (const f of (e.data.facts || [])) {
      const s = String(f).toLowerCase();
      if (s.includes("time worked")) {
        total += minutesFromFact(String(f));
      }
    }
  }

  return total;
}

export function formatDuration(minutes: number) {
  const m = Math.max(0, Math.floor(minutes));
  const h = Math.floor(m / 60);
  const r = m % 60;

  if (h === 0) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
}
