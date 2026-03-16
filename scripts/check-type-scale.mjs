import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src");
const EXTENSIONS = new Set([".css", ".astro", ".jsx", ".tsx", ".js", ".ts"]);
const ALLOWED_VALUES = new Set(["inherit", "initial", "unset", "revert"]);

function collectFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, out);
      continue;
    }
    if (EXTENSIONS.has(path.extname(entry.name))) {
      out.push(fullPath);
    }
  }
  return out;
}

function isCommentLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("//");
}

function isAllowedFontSize(value) {
  if (value.startsWith("var(")) return true;
  return ALLOWED_VALUES.has(value);
}

const files = collectFiles(ROOT);
const violations = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (isCommentLine(line)) continue;
    if (!/font-size\s*:/i.test(line)) continue;

    const [, rawAfterColon = ""] = line.split(/font-size\s*:/i);
    const value = rawAfterColon.split(";")[0].trim().toLowerCase();
    if (!value || isAllowedFontSize(value)) continue;

    violations.push({
      filePath,
      line: index + 1,
      value,
    });
  }
}

if (violations.length > 0) {
  console.error("Type scale lint failed: use tokenized font sizes (e.g. var(--text-sm)).");
  for (const violation of violations) {
    const relativePath = path.relative(process.cwd(), violation.filePath);
    console.error(`- ${relativePath}:${violation.line} -> "${violation.value}"`);
  }
  process.exit(1);
}

console.log("Type scale lint passed.");
