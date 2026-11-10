import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as ts from "typescript";

const root = process.cwd();
const routesDir = path.join(root, "src/routes");
const middlewarePath = path.join(root, "src/middlewares/validate.middleware.ts");
const files = fs.readdirSync(routesDir).filter((name) => name.endsWith(".routes.ts"));
const sourceFiles = new Map<string, ts.SourceFile>();
const schemaCache = new Map<string, Promise<any>>();
const modules = new Map<string, any>();

function source(file: string): ts.SourceFile {
  const absolute = path.resolve(file);
  let value = sourceFiles.get(absolute);
  if (!value) {
    value = ts.createSourceFile(absolute, fs.readFileSync(absolute, "utf8"), ts.ScriptTarget.Latest, true);
    sourceFiles.set(absolute, value);
  }
  return value;
}

function resolveSourceModule(fromFile: string, modulePath: string): string {
  const base = path.resolve(path.dirname(fromFile), modulePath);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.mts`,
    `${base}.cts`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  const resolved = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!resolved) throw new Error(`Cannot resolve TypeScript import '${modulePath}' from ${fromFile}`);
  return resolved;
}

function importMap(file: string): Map<string, { file: string; exported: string }> {
  const map = new Map<string, { file: string; exported: string }>();
  for (const statement of source(file).statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const modulePath = statement.moduleSpecifier.text;
    if (!modulePath.startsWith(".")) continue;
    const resolved = resolveSourceModule(file, modulePath);
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const item of bindings.elements) map.set(item.name.text, { file: resolved, exported: (item.propertyName ?? item.name).text });
    } else if (bindings && ts.isNamespaceImport(bindings)) {
      map.set(bindings.name.text, { file: resolved, exported: "default" });
    } else if (statement.importClause?.name) {
      map.set(statement.importClause.name.text, { file: resolved, exported: "default" });
    }
  }
  return map;
}

function imported(file: string, name: string): { file: string; exported: string } | undefined {
  return importMap(file).get(name);
}

function paramsSchemaNames(): Set<string> {
  const sf = source(middlewarePath);
  const names = new Set<string>();
  const imports = importMap(middlewarePath);
  function visit(node: ts.Node): void {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "paramsSchemas" && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      for (const element of node.initializer.elements) if (ts.isIdentifier(element)) names.add(element.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  // Keep module-qualified identities so schemas with the same local name cannot collide.
  return new Set([...names].map((name) => {
    const ref = imports.get(name);
    return ref ? `${path.resolve(ref.file)}#${ref.exported}` : name;
  }));
}
const paramsNames = paramsSchemaNames();

function text(node: ts.Node | undefined): string { return node?.getText() ?? ""; }
function stringValue(node: ts.Expression | undefined): string | undefined {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined;
}
function callName(node: ts.Expression): string | undefined {
  if (!ts.isCallExpression(node)) return;
  return ts.isIdentifier(node.expression) ? node.expression.text : undefined;
}
function routerVariable(file: string): string | undefined {
  let result: string | undefined;
  function visit(node: ts.Node): void {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && callName(node.initializer) === "Router") result = node.name.text;
    ts.forEachChild(node, visit);
  }
  visit(source(file));
  return result;
}
function defaultRouter(file: string): string | undefined {
  for (const s of source(file).statements) {
    if (ts.isExportAssignment(s) && ts.isIdentifier(s.expression)) return s.expression.text;
  }
}
function routeOperations(file: string): ts.CallExpression[] {
  const router = routerVariable(file);
  const out: ts.CallExpression[] = [];
  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText() === router && ["get", "post", "put", "patch", "delete", "options", "head"].includes(node.expression.name.text)) out.push(node);
    ts.forEachChild(node, visit);
  }
  visit(source(file));
  return out;
}
function schemaUse(file: string, expr: ts.Expression): { ref: { file: string; exported: string }; target: string } | undefined {
  if (!ts.isCallExpression(expr) || !ts.isIdentifier(expr.expression) || expr.expression.text !== "validate") return;
  const ident = expr.arguments[0];
  if (!ident || !ts.isIdentifier(ident)) return;
  const ref = imported(file, ident.text);
  if (!ref) return;
  const key = `${path.resolve(ref.file)}#${ref.exported}`;
  // The middleware's paramsSchemas check overrides the explicit target.
  const target = paramsNames.has(key) ? "params" : (stringValue(expr.arguments[1]) ?? "body");
  return { ref, target };
}
async function loadSchema(ref: { file: string; exported: string }): Promise<any> {
  const key = `${path.resolve(ref.file)}#${ref.exported}`;
  if (!schemaCache.has(key)) schemaCache.set(key, (async () => {
    const url = pathToFileURL(ref.file).href;
    const mod = modules.get(url) ?? await import(url);
    modules.set(url, mod);
    const schema = mod[ref.exported];
    if (!schema || typeof schema.safeParse !== "function") throw new Error(`Could not load Zod schema ${ref.exported} from ${ref.file}`);
    return schema;
  })());
  return schemaCache.get(key)!;
}
function joinPath(prefix: string, part: string): string {
  const joined = `/${[prefix, part].map((x) => x.replace(/^\/+|\/+$/g, "")).filter(Boolean).join("/")}`;
  return joined.replace(/\/+/g, "/").replace(/:([A-Za-z0-9_]+)/g, "{$1}") || "/";
}
function schemaParameters(json: any, location: "path" | "query"): any[] {
  const properties: Record<string, any> = {};
  const required = new Set<string>();
  function collect(schema: any): void {
    if (!schema || typeof schema !== "object") return;
    Object.assign(properties, schema.properties ?? {});
    for (const name of schema.required ?? []) required.add(name);
    for (const part of schema.allOf ?? []) collect(part);
  }
  collect(json);
  return Object.entries(properties).map(([name, schema]: [string, any]) => ({
    name, in: location, required: location === "path" || required.has(name), schema,
  }));
}
function dedupeParameters(parameters: any[]): any[] {
  const byKey = new Map<string, any>();
  for (const parameter of parameters) {
    const key = `${parameter.in}:${parameter.name}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, parameter);
      continue;
    }
    const existingSchema = JSON.stringify(existing.schema);
    const nextSchema = JSON.stringify(parameter.schema);
    if (existingSchema !== nextSchema) {
      const schemas = [...(existing.schema?.allOf ?? [existing.schema]), ...(parameter.schema?.allOf ?? [parameter.schema])];
      existing.schema = { allOf: schemas };
    }
    existing.required ||= parameter.required;
  }
  return [...byKey.values()];
}
async function openApiSchema(ref: { file: string; exported: string }): Promise<any> {
  const schema = await loadSchema(ref);
  return (await import("zod")).z.toJSONSchema(schema, { io: "input", unrepresentable: "any" });
}

const paths: Record<string, any> = {};
const visited = new Set<string>();
async function walk(file: string, prefix: string, inherited: Array<{ ref: { file: string; exported: string }; target: string }>, depth = 0): Promise<void> {
  if (depth > 10) return;
  const visitKey = `${file}|${prefix}`;
  if (visited.has(visitKey)) return;
  visited.add(visitKey);
  const sf = source(file);
  for (const op of routeOperations(file)) {
    const method = (op.expression as ts.PropertyAccessExpression).name.text;
    const routePath = stringValue(op.arguments[0]);
    if (routePath === undefined) continue;
    const pathName = joinPath(prefix, routePath);
    const validations = [...inherited];
    for (const arg of op.arguments.slice(1)) {
      const use = schemaUse(file, arg);
      if (use) validations.push(use);
    }
    const operation: any = { responses: { "200": { description: "Successful response" }, "400": { description: "Validation error" } } };
    const parameters: any[] = [];
    for (const validation of validations) {
      const json = await openApiSchema(validation.ref);
      if (validation.target === "params") parameters.push(...schemaParameters(json, "path"));
      else if (validation.target === "query") parameters.push(...schemaParameters(json, "query"));
      else operation.requestBody = { required: true, content: { "application/json": { schema: json } } };
    }
    // Express path parameters are required even when no params schema is attached.
    for (const [, param] of pathName.matchAll(/\{([^}]+)\}/g)) if (!parameters.some((p) => p.in === "path" && p.name === param)) parameters.push({ name: param, in: "path", required: true, schema: { type: "string" } });
    if (parameters.length) operation.parameters = dedupeParameters(parameters);
    paths[pathName] ??= {};
    paths[pathName][method] = operation;
  }

  // Follow routers mounted by this router, retaining mount-level validate() middleware.
  const router = routerVariable(file);
  const imports = importMap(file);
  function findMounts(node: ts.Node): ts.CallExpression[] {
    const found: ts.CallExpression[] = [];
    function visit(n: ts.Node): void {
      if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.expression.getText() === router && n.expression.name.text === "use") found.push(n);
      ts.forEachChild(n, visit);
    }
    visit(node); return found;
  }
  for (const mount of findMounts(sf)) {
    const args = [...mount.arguments];
    let mountPath = "";
    if (stringValue(args[0]) !== undefined) mountPath = stringValue(args.shift())!;
    const validations = [...inherited];
    let child: { file: string; exported: string } | undefined;
    for (const arg of args) {
      const use = schemaUse(file, arg);
      if (use) validations.push(use);
      else if (ts.isIdentifier(arg)) child = imports.get(arg.text);
    }
    if (child) await walk(child.file, joinPath(prefix, mountPath), validations, depth + 1);
  }
}

async function main(): Promise<void> {
  const appRoute = path.join(routesDir, "app.routes.ts");
  const rootFile = files.includes("app.routes.ts") ? appRoute : path.join(routesDir, files[0] ?? "");
  if (!fs.existsSync(rootFile)) throw new Error("No *.routes.ts files found under src/routes");
  await walk(rootFile, "/api", []);
  const doc = {
    openapi: "3.0.3",
    info: { title: "TaskForge API", version: "1.0.0" },
    servers: [{ url: "/" }],
    paths,
  };
  const output = path.join(root, "swagger-output.json");
  fs.writeFileSync(output, `${JSON.stringify(doc, null, 2)}\n`);
  console.log(`Generated ${path.relative(root, output)} (${Object.keys(paths).length} paths)`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
