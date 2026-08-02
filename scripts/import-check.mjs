import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const require = createRequire(import.meta.url);
let ts;
for (const candidate of [
  "typescript",
  "/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js",
]) {
  try {
    ts = require(candidate);
    break;
  } catch {}
}
if (!ts) throw new Error("TypeScript is required for the local import/export check.");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(path.join(root, "src")).filter(
  (file) => /\.tsx?$/.test(file) && !file.endsWith(".d.ts"),
);
const sourceMap = new Map(
  files.map((file) => [
    file,
    ts.createSourceFile(
      file,
      fs.readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    ),
  ]),
);

function resolveLocal(fromFile, specifier) {
  const base = specifier.startsWith("@/")
    ? path.join(root, "src", specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ]) {
    if (sourceMap.has(candidate)) return candidate;
  }
  return undefined;
}

function collectExports(sourceFile) {
  const names = new Set();
  let hasDefault = false;
  for (const statement of sourceFile.statements) {
    const modifiers = statement.modifiers?.map((modifier) => modifier.kind) ?? [];
    const isExported = modifiers.includes(ts.SyntaxKind.ExportKeyword);
    const isDefault = modifiers.includes(ts.SyntaxKind.DefaultKeyword);
    if (isExported) {
      if (isDefault) hasDefault = true;
      if (statement.name?.text) names.add(statement.name.text);
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
        }
      }
    }
    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements) names.add(element.name.text);
    }
    if (ts.isExportAssignment(statement)) hasDefault = true;
  }
  return { names, hasDefault };
}

const failures = [];
for (const [file, sourceFile] of sourceMap) {
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) continue;

    const specifier = statement.moduleSpecifier.text;
    if (!(specifier.startsWith(".") || specifier.startsWith("@/"))) continue;
    const target = resolveLocal(file, specifier);
    if (!target) {
      if (!specifier.endsWith(".css")) {
        failures.push(`${path.relative(root, file)} has unresolved local import ${specifier}`);
      }
      continue;
    }

    const exports = collectExports(sourceMap.get(target));
    const clause = statement.importClause;
    if (!clause) continue;
    if (clause.name && !exports.hasDefault) {
      failures.push(`${path.relative(root, file)} imports a missing default from ${specifier}`);
    }
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const element of clause.namedBindings.elements) {
        const original = (element.propertyName ?? element.name).text;
        if (!exports.names.has(original)) {
          failures.push(`${path.relative(root, file)} imports missing ${original} from ${specifier}`);
        }
      }
    }
  }
}

if (failures.length) {
  console.error("Local import/export verification failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Local import/export check passed for ${files.length} source files.`);
