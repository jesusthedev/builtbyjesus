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
    .slice(0, 80) || "entry";
}

function yyyy_mm_dd(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function safeText(s) {
  // Keep YAML calm: no unescaped newlines; wrap in quotes.
  return String(s ?? "").replace(/\r?\n/g, " ").trim();
}

const title = arg("title");
if (!title) {
  console.error('Missing --title. Example: npm run log:new -- --title "Foundation shipped" --type release --status DONE --projects builtby');
  process.exit(1);
}

const type = arg("type", "note"); // milestone|decision|build|fix|release|note
const status = arg("status", "DONE"); // DONE|WIP|PAUSED
const projectsRaw = arg("projects", "");
const projects = projectsRaw
  ? projectsRaw.split(",").map(s => s.trim()).filter(Boolean)
  : [];

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
  ? `projects:\n${projects.map(p => `  - "${safeText(p)}"`).join("\n")}\n`
  : "";

const content =
`---
title: "${safeText(title)}"
date: ${today}
type: "${safeText(type)}"
status: "${safeText(status)}"
${projectsBlock}facts:
  - "TODO"
neuron_stretch: "TODO"
---

## Summary
TODO

## Facts
- TODO

## Next
- TODO
`;

fs.writeFileSync(outPath, content, "utf8");
console.log(`Created: ${path.relative(process.cwd(), outPath)}`);
