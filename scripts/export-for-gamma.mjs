/**
 * Export a slide-friendly Markdown snapshot of the project:
 * - PRD
 * - CHANGELOG (Unreleased + latest dated section)
 * - ADR summaries
 * - Recent daily logs (last N days or since a date)
 *
 * Usage:
 *   node scripts/export-for-gamma.mjs --logs=7 --include-adr --out=exports/gamma/export.md
 *   node scripts/export-for-gamma.mjs --since=2025-08-20 --out=exports/gamma/export.md
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);

// Options
const OUT_PATH = path.resolve(repoRoot, args.out || "exports/gamma/export.md");
const LOGS_DAYS = args.logs ? Number(args.logs) : null;     // e.g. 7
const SINCE_DATE = args.since || null;                      // e.g. 2025-08-20
const INCLUDE_ADR = Boolean(args["include-adr"] || true);   // default true

// Helpers
async function readIfExists(p) {
  try { return await fs.readFile(p, "utf8"); } catch { return null; }
}
function mdH2(title) { return `\n## ${title}\n`; }
function mdH1(title) { return `# ${title}\n`; }
function mdSep() { return `\n---\n`; }

async function collectPRD() {
  const prdPath = path.join(repoRoot, "docs", "dev", "PRD.md");
  const md = await readIfExists(prdPath);
  return md ? `${mdH1("Product Requirements (Snapshot)")}${md}` : "";
}

async function collectChangelog() {
  const p = path.join(repoRoot, "CHANGELOG.md");
  const md = await readIfExists(p);
  if (!md) return "";
  // Extract [Unreleased] and the most recent dated section
  const unreleasedMatch = md.match(/## \[Unreleased\][\s\S]*?(?=\n## |\n?$)/);
  const datedMatches = [...md.matchAll(/## \[(\d{4}-\d{2}-\d{2})\][\s\S]*?(?=\n## |\n?$)/g)];
  const latestDated = datedMatches.length ? datedMatches[0][0] : "";
  const body = [
    unreleasedMatch ? unreleasedMatch[0] : "",
    latestDated
  ].filter(Boolean).join("\n\n");
  return body ? `${mdH1("Changelog (Highlights)")}${body}` : "";
}

async function collectADRs() {
  if (!INCLUDE_ADR) return "";
  const dir = path.join(repoRoot, "docs", "decisions");
  let files = [];
  try {
    files = await fs.readdir(dir);
  } catch { return ""; }
  const adrFiles = files.filter(f => /^ADR-\d+.*\.md$/i.test(f)).sort();
  if (!adrFiles.length) return "";
  let out = mdH1("Architecture Decisions (ADRs)");
  for (const f of adrFiles) {
    const p = path.join(dir, f);
    const md = await readIfExists(p);
    if (!md) continue;
    // Take the first heading and the first Status/Decision lines for brevity
    const title = (md.match(/^#\s+(.+)$/m)?.[1] ?? f).trim();
    const status = (md.match(/^##\s*Status[\s\S]*?\n(.+)\n/m)?.[1] ?? "").trim();
    const decision = (md.match(/^##\s*Decision[\s\S]*?\n([\s\S]*?)(?:\n## |\n$)/m)?.[1] ?? "").trim();
    out += `\n### ${title}\n`;
    if (status) out += `- **Status:** ${status}\n`;
    if (decision) out += `\n**Decision Summary**\n\n${decision}\n`;
    out += mdSep();
  }
  return out;
}

function isIsoDateFileName(name) {
  return /^\d{4}-\d{2}-\d{2}\.md$/.test(name);
}

async function collectDailyLogs() {
  const dir = path.join(repoRoot, "docs", "log");
  let files = [];
  try { files = await fs.readdir(dir); } catch { return ""; }
  const dayFiles = files.filter(isIsoDateFileName).sort().reverse(); // newest first

  let selected = [];
  if (SINCE_DATE) {
    selected = dayFiles.filter(f => f >= `${SINCE_DATE}.md`);
  } else if (LOGS_DAYS && LOGS_DAYS > 0) {
    selected = dayFiles.slice(0, LOGS_DAYS);
  } else {
    selected = dayFiles.slice(0, 7); // default last 7 files
  }

  if (!selected.length) return "";
  let out = mdH1("Daily Log (Recent)");
  for (const f of selected.reverse()) { // chronological
    const md = await readIfExists(path.join(dir, f));
    if (!md) continue;
    const date = f.replace(".md", "");
    out += `\n### ${date}\n${md.trim()}\n${mdSep()}`;
  }
  return out;
}

async function ensureDir(filepath) {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
}

async function main() {
  const parts = [];

  // Cover page
  parts.push(
    mdH1("website-os — Process Deck Export"),
    "_Auto-generated snapshot for Gamma.ai deck creation._",
    mdSep()
  );

  // PRD
  parts.push(await collectPRD(), mdSep());

  // Changelog highlights
  parts.push(await collectChangelog(), mdSep());

  // ADRs
  parts.push(await collectADRs());

  // Daily logs
  parts.push(await collectDailyLogs());

  const final = parts.filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n");

  await ensureDir(OUT_PATH);
  await fs.writeFile(OUT_PATH, final, "utf8");

  console.log(`✅ Export ready: ${OUT_PATH}`);
  console.log(`Tip: Open this file, copy all, and paste into Gamma.ai as a new deck.`);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});