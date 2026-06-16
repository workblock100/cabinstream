// Asserts the gzipped client JS stays within budget, so an accidental bundle
// regression — a heavy new dependency, or simple-icons losing tree-shaking — is
// caught in CI instead of slowing the car's load over cellular.
//
// Run AFTER a production build:  GH_PAGES=1 npm run build && npm run size
import { readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const STATIC_DIR = "out/_next/static";
// Current gzipped client JS is ~207 KB. Budget has generous headroom so normal
// build-to-build variation never trips it — only a real regression does.
const BUDGET_KB = 280;

function walkJs(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJs(p));
    else if (entry.name.endsWith(".js")) out.push(p);
  }
  return out;
}

let files;
try {
  files = walkJs(STATIC_DIR);
} catch {
  console.error(`No ${STATIC_DIR} — run \`GH_PAGES=1 npm run build\` first.`);
  process.exit(2);
}

const rows = files
  .map((f) => ({ f, kb: gzipSync(readFileSync(f)).length / 1024 }))
  .sort((a, b) => b.kb - a.kb);
const total = rows.reduce((s, r) => s + r.kb, 0);

console.log(`Gzipped client JS: ${total.toFixed(1)} KB across ${files.length} files (budget ${BUDGET_KB} KB)`);
for (const r of rows.slice(0, 5)) {
  console.log(`  ${r.kb.toFixed(1).padStart(7)} KB  ${r.f.split("/").pop()}`);
}

if (total > BUDGET_KB) {
  console.error(`\nBundle over budget: ${total.toFixed(1)} KB > ${BUDGET_KB} KB. Investigate what grew.`);
  process.exit(1);
}
console.log("Within budget.");
