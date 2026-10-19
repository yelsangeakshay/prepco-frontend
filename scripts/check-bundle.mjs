// Sizes use KiB (1024), like the `next build` report. Fails when any route's first-load JS (gzip) goes over the budget. Run after `pnpm build`.
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const BUDGET_KB = 170;
const manifest = JSON.parse(readFileSync(".next/app-build-manifest.json", "utf8")).pages;
const cache = new Map();
const gz = (file) => {
  if (!cache.has(file)) cache.set(file, gzipSync(readFileSync(`.next/${file}`)).length);
  return cache.get(file);
};

const rows = Object.entries(manifest)
  .filter(([key]) => key.endsWith("/page"))
  .map(([key, files]) => {
    const js = [...new Set(files)].filter((f) => f.endsWith(".js"));
    return {
      route: key.replace(/\/page$/, "").replace(/\([^)]*\)\//g, "") || "/",
      kb: js.reduce((n, f) => n + gz(f), 0) / 1024,
    };
  })
  .sort((a, b) => b.kb - a.kb);

const over = rows.filter((r) => r.kb > BUDGET_KB);
for (const r of rows.slice(0, 12))
  console.log(`${r.kb.toFixed(1).padStart(7)} KiB  ${r.route}${r.kb > BUDGET_KB ? "  OVER" : ""}`);
console.log(`\n${rows.length} routes, budget ${BUDGET_KB} KiB, ${over.length} over.`);
process.exit(over.length ? 1 : 0);
