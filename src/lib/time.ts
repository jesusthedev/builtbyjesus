// src/lib/time.ts
export function minutesFromFact(s: string): number {
  const str = String(s ?? "").toLowerCase();

  let minutes = 0;

  // Match "2h 30m", "2h", "30m"
  const h = str.match(/(\d+)\s*h/);
  const m = str.match(/(\d+)\s*m/);

  if (h) minutes += parseInt(h[1], 10) * 60;
  if (m) minutes += parseInt(m[1], 10);

  // If it's something like "Time worked 90" with no h/m
  if (!h && !m) {
    const raw = str.match(/(\d+)/);
    if (raw) minutes += parseInt(raw[1], 10);
  }

  return minutes;
}
