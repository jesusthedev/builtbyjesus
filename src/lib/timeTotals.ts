import { getCollection } from "astro:content";
import { minutesFromFact } from "./time";

export async function getTotalMinutes() {
  const entries = await getCollection("logbook");

  let total = 0;

  for (const e of entries) {
    for (const f of (e.data.facts || [])) {
      if (String(f).toLowerCase().includes("time worked")) {
        total += minutesFromFact(f);
      }
    }
  }

  return total;
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
