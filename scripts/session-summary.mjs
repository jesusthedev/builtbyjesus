import fs from "node:fs";
import path from "node:path";

function arg(name, fallback = "") {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const v = process.argv[idx + 1];
  return (v && !v.startsWith("--")) ? v : fallback;
}
function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "session";
}
function yyyy_mm_dd(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
function safeText(s) {
  return String(s ?? "").replace(/\r?\n/g, " ").trim();
}
function yamlLine(s) {
  return `"${safeText(s).replace(/"/g, '\\"')}"`;
}

const minutesRaw = arg("minutes");
const minutes = minutesRaw ? Number(minutesRaw) : NaN;

const title = arg("title", "Session summary");
const type = arg("type", "milestone"); // milestone is a nice default for sessions
const status = arg("status", "DONE");
const projectsRaw = arg("projects", "");
const projects = projectsRaw
  ? projectsRaw.split(",").map(s => s.trim()).filter(Boolean)
  : [];

const highlightsRaw = arg("highlights", "");
// Use | as delimiter to avoid YAML colons and Windows quoting pain.
const highlights = highlightsRaw
  ? highlightsRaw.split("|").map(s => safeText(s)).filter(Boolean)
  : [];

if (!Number.isFinite(minutes) || minutes <= 0) {
  console.error('Missing/invalid --minutes. Example: npm run log:session -- --minutes 95 --title "Session summary" --projects builtby --highlights "Did X|Fixed Y|Shipped Z"');
  process.exit(1);
}

const today = yyyy_mm_dd();
const fileSlug = `${today}-${slugify(title)}`;
const outDir = path.join(process.cwd(), "src", "content", "logbook");
const outPath = path.join(outDir, `${fileSlug}.md`);

fs.mkdirSync(outDir, { recursive: true });

if (fs.existsSync(outPath)) {
  console.error(`File already exists: ${outPath}`);
  process.exit(1);
}

const projectsBlock = projects.length
  ? `projects:\n${projects.map(p => `  - ${yamlLine(p)}`).join("\n")}\n`
  : "";

const hrs = Math.floor(minutes / 60);
const mins = minutes % 60;
const durationStr = hrs ? `${hrs}h ${mins}m` : `${mins}m`;

const facts = [
  `Time worked ${durationStr}`,
  ...(highlights.length ? highlights.slice(0, 8) : ["TODO"])
];

const factsBlock = facts.map(f => `  - ${yamlLine(f)}`).join("\n");
const highlightBullets = highlights.length
  ? highlights.map(h => `- ${h}`).join("\n")
  : "- TODO";

const content =
`---
title: ${yamlLine(title)}
date: ${today}
type: ${yamlLine(type)}
status: ${yamlLine(status)}
${projectsBlock}facts:
${factsBlock}
neuron_stretch: ${yamlLine("TODO")}
---

## Time worked
${durationStr}

## Highlights
${highlightBullets}

## Next
- TODO
`;

fs.writeFileSync(outPath, content, "utf8");
console.log(`Created: ${path.relative(process.cwd(), outPath)}`);
