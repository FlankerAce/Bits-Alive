import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const allowlist = [
  "index.html",
  "assets/icons/favicon.ico",
  "assets/img/EVA-fondo.png",
  "assets/img/eva-open.webp",
  "assets/img/eva-closed.webp",
  "assets/img/lucy-open.webp",
  "assets/img/lucy-closed.webp",
  "assets/sounds/eva-responde.mp3",
  "assets/sounds/eva-respira.mp3",
  "assets/sounds/eva-despide.mp3",
  "eva-frontend/index.html",
  "eva-frontend/app.js",
];

function pathKey(value) {
  const resolved = path.resolve(value);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

function isWithin(parent, target) {
  const relative = path.relative(parent, target);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function assertNoReparsePath(targetPath, allowedRoot) {
  const absoluteTarget = path.resolve(targetPath);
  const absoluteRoot = path.resolve(allowedRoot);
  assert.ok(
    absoluteTarget === absoluteRoot || isWithin(absoluteRoot, absoluteTarget),
    `Path escapes the authorized worktree: ${absoluteTarget}`,
  );

  const root = path.parse(absoluteTarget).root;
  const components = absoluteTarget.slice(root.length).split(path.sep).filter(Boolean);
  let current = root;
  const rootStat = lstatSync(current);
  assert.ok(!rootStat.isSymbolicLink(), `Refusing reparse point: ${current}`);

  for (const component of components) {
    current = path.join(current, component);
    let info;
    try {
      info = lstatSync(current);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    assert.ok(!info.isSymbolicLink(), `Refusing symlink, junction, or reparse point: ${current}`);

    const real = realpathSync(current);
    assert.equal(
      pathKey(real),
      pathKey(current),
      `Refusing redirected path component: ${current} resolves to ${real}`,
    );
  }

  const realRoot = realpathSync(absoluteRoot);
  const realTarget = existsSync(absoluteTarget) ? realpathSync(absoluteTarget) : absoluteTarget;
  assert.ok(
    pathKey(realTarget) === pathKey(realRoot) || isWithin(realRoot, realTarget),
    `Resolved path escapes the authorized worktree: ${realTarget}`,
  );
}

function removeExactlyOne(input, pattern, label) {
  const matches = [...input.matchAll(pattern)];
  assert.equal(matches.length, 1, `Expected exactly one ${label}, found ${matches.length}`);
  return input.replace(pattern, "");
}

function removeSectionById(html, id) {
  const pattern = new RegExp(`<section\\b(?=[^>]*\\bid="${id}")[^>]*>[\\s\\S]*?<\\/section>`, "g");
  return removeExactlyOne(html, pattern, `section#${id}`);
}

function removeElementById(html, tag, id) {
  const startPattern = new RegExp(`<${tag}\\b(?=[^>]*\\bid="${id}")[^>]*>`, "g");
  const starts = [...html.matchAll(startPattern)];
  assert.equal(starts.length, 1, `Expected exactly one ${tag}#${id}`);
  const start = starts[0].index;
  const tokenPattern = new RegExp(`<${tag}\\b[^>]*>|<\\/${tag}\\s*>`, "gi");
  let depth = 0;
  let end = -1;
  for (const token of html.slice(start).matchAll(tokenPattern)) {
    if (token[0].startsWith("</")) depth -= 1;
    else depth += 1;
    if (depth === 0) {
      end = start + token.index + token[0].length;
      break;
    }
  }
  assert.notEqual(end, -1, `Unclosed ${tag}#${id}`);
  return html.slice(0, start) + html.slice(end);
}

function removeNamedSection(html, marker) {
  const sections = [...html.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)];
  const matches = sections.filter((match) => match[0].includes(marker));
  assert.equal(matches.length, 1, `Expected exactly one section containing ${marker}`);
  return html.replace(matches[0][0], "");
}

function removeFunction(script, name) {
  const pattern = new RegExp(`(^|\\n)[\\t ]*function\\s+${name}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?^\\}`, "gm");
  return removeExactlyOne(script, pattern, `function ${name}`);
}

function derivePublicHtml(source) {
  let html = source;
  html = removeNamedSection(html, "🔐 Colaboradores del proyecto");
  html = removeSectionById(html, "lucyAsistente");
  html = removeSectionById(html, "lucyEditor");
  html = removeElementById(html, "div", "devLogin");

  const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scriptMatches.length, 1, "Expected exactly one inline EVA script");
  let script = scriptMatches[0][1];
  for (const functionName of [
    "toggleColabClave",
    "toggleDevClave",
    "loginColaborador",
    "logoutColaborador",
    "loginDesarrollador",
    "logoutDesarrollador",
    "parpadeoLucy",
    "generarLucyJson",
  ]) {
    script = removeFunction(script, functionName);
  }
  script = removeExactlyOne(script, /^\s*parpadeoLucy\(\);\s*$/gm, "MiniLucy animation invocation");
  script = script.replace(
    /^[\t ]*\/\/ (?:👁️ Mostrar\/ocultar claves|🔐 Login colaborador|🔐 Login desarrollador \(con acceso a JSON\)|🧠 Generar JSON MiniLucy)[\t ]*$/gm,
    "",
  );
  html = html.replace(scriptMatches[0][1], script);

  assert.doesNotMatch(html, /leandrolapeyra|leoylucyfriends|colaborador"\s*&&\s*clave\s*===\s*"bitsalive/i);
  assert.doesNotMatch(html, /loginColaborador|loginDesarrollador|toggleColabClave|toggleDevClave/);
  assert.doesNotMatch(html, /id="(?:colabUsuario|colabClave|devUsuario|devClave|lucyAsistente|lucyEditor|devLogin)"/);
  assert.match(html, /id="evaChat"/);
  assert.match(html, /id="chatInput"/);
  assert.match(html, /function procesarMensaje\(/);
  assert.match(html, /function iniciarParpadeoEmocional\(/);
  return html
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n*$/, "\n");
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function checkInlineChat(inlineScript) {
  new vm.Script(inlineScript, { filename: "dist/index.html:inline-script" });

  const timers = [];
  const audios = [];
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        value: "",
        style: {},
        classList: { add() {}, remove() {} },
        addEventListener(type, listener) { this.listener = listener; },
        appendChild(child) { this.child = child; },
      });
    }
    return elements.get(id);
  }
  const document = {
    getElementById: element,
    createElement: (tag) => ({ tag, style: {}, classList: { add() {} } }),
  };
  class AudioMock {
    constructor(source) { this.source = source; audios.push(this); }
    play() { this.played = true; }
  }
  const randomValues = [0, 0, 0, 1];
  const context = vm.createContext({
    document,
    Date,
    Math: Object.create(Math, { random: { value: () => randomValues.shift() ?? 0.5 } }),
    Audio: AudioMock,
    setInterval: () => 0,
    setTimeout: (callback, delay) => { timers.push({ callback, delay }); return timers.length; },
  });
  vm.runInContext(inlineScript, context, { filename: "dist/index.html:inline-script" });

  const chat = element("chatInput");
  const avatar = element("evaAvatar");
  const response = element("evaRespuesta");
  assert.equal(typeof chat.listener, "function", "Chat key handler was not attached");
  chat.value = "estoy triste";
  let prevented = false;
  chat.listener.call(chat, { key: "Enter", shiftKey: false, preventDefault() { prevented = true; } });
  assert.equal(prevented, true, "Enter should submit a local chat message");
  assert.equal(chat.value, "", "Submitted chat message should be cleared");
  assert.equal(avatar.src, "assets/img/eva-closed.webp", "EVA blink should close the avatar");
  assert.ok(audios.some((audio) => audio.source === "assets/sounds/eva-respira.mp3" && audio.played),
    "First interaction should play EVA's breathing sound");

  const blinkTimerIndex = timers.findIndex((timer) => timer.delay === 300);
  assert.notEqual(blinkTimerIndex, -1, "EVA blink animation did not schedule its open frame");
  timers.splice(blinkTimerIndex, 1)[0].callback();
  assert.equal(avatar.src, "assets/img/eva-open.webp", "EVA blink should reopen the avatar");

  const responseTimerIndex = timers.findIndex((timer) => timer.delay === 2000);
  assert.notEqual(responseTimerIndex, -1, "Chat response was not scheduled");
  timers.splice(responseTimerIndex, 1)[0].callback();
  assert.match(response.child.textContent, /EVA: Estoy acá/, "EVA should render a local chat response");
  assert.ok(audios.some((audio) => audio.source === "assets/sounds/eva-responde.mp3" && audio.played),
    "Chat response should play its sound");
}

function assertSafeTree(directory, allowedFiles, allowedRoot) {
  assertNoReparsePath(directory, allowedRoot);
  const foundFiles = [];
  function visit(current, prefix = "") {
    assertNoReparsePath(current, allowedRoot);
    const info = lstatSync(current);
    assert.ok(info.isDirectory() && !info.isSymbolicLink(), `Expected a real directory: ${current}`);
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const entryPath = path.join(current, entry.name);
      assertNoReparsePath(entryPath, allowedRoot);
      const entryInfo = lstatSync(entryPath);
      assert.ok(!entryInfo.isSymbolicLink(), `Refusing symlink, junction, or reparse point: ${entryPath}`);
      if (entryInfo.isDirectory()) visit(entryPath, relative);
      else {
        assert.ok(entryInfo.isFile(), `Unexpected non-file in distribution: ${relative}`);
        assert.ok(allowedFiles.includes(relative), `Unexpected file in distribution: ${relative}`);
        foundFiles.push(relative);
      }
    }
  }
  visit(directory);
  return foundFiles.sort();
}

function validateCandidate(projectRoot, candidate, sourceHashes) {
  const foundFiles = assertSafeTree(candidate, allowlist, projectRoot);
  assert.deepEqual(foundFiles, [...allowlist].sort(), "dist must contain exactly the allowlisted files");

  for (const relativePath of allowlist.filter((file) => file !== "index.html")) {
    assert.equal(sha256(path.join(candidate, relativePath)), sourceHashes.get(relativePath),
      `Allowlisted file differs from source: ${relativePath}`);
  }

  const distRootHtml = readFileSync(path.join(candidate, "index.html"), "utf8");
  const distFrontendHtml = readFileSync(path.join(candidate, "eva-frontend/index.html"), "utf8");
  const distFirebaseJs = readFileSync(path.join(candidate, "eva-frontend/app.js"), "utf8");
  assert.doesNotMatch(distRootHtml, /leandrolapeyra|leoylucyfriends|colaborador"\s*&&\s*clave\s*===\s*"bitsalive/i);
  assert.doesNotMatch(distRootHtml, /(?:loginColaborador|loginDesarrollador|toggleColabClave|toggleDevClave)\s*\(/);
  assert.match(distFrontendHtml, /type="module"\s+src="app\.js"/);
  for (const [name, content] of [
    ["index.html", distRootHtml],
    ["eva-frontend/index.html", distFrontendHtml],
    ["eva-frontend/app.js", distFirebaseJs],
  ]) {
    assert.doesNotMatch(content, /(?:password|clave)\s*[:=]\s*["'][^"']+["']/i,
      `${name} must not contain a hard-coded password`);
    assert.doesNotMatch(content, /leandrolapeyra|leoylucyfriends|colaborador"\s*&&\s*clave\s*===\s*"bitsalive/i,
      `${name} contains an insecure historical login credential`);
  }

  const firebaseImports = [...distFirebaseJs.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]).sort();
  assert.deepEqual(firebaseImports, [
    "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js",
    "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js",
  ].sort(), "Firebase prototype should keep only its existing pinned Firebase modules");

  const referencedAssets = new Set([
    ...[...distRootHtml.matchAll(/assets\/(?:icons|img|sounds)\/[A-Za-z0-9._-]+/g)].map((match) => match[0]),
    ...[...distRootHtml.matchAll(/url\(['"]?(assets\/(?:icons|img|sounds)\/[A-Za-z0-9._-]+)/g)].map((match) => match[1]),
  ]);
  for (const reference of referencedAssets) {
    assert.ok(allowlist.includes(reference), `Referenced asset is not allowlisted: ${reference}`);
    assert.ok(readFileSync(path.join(candidate, reference)), `Missing referenced asset: ${reference}`);
  }
  assert.ok(allowlist.includes("assets/img/EVA-fondo.png"));
  assert.ok(allowlist.includes("eva-frontend/app.js"));

  const inlineScript = [...distRootHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(inlineScript.length, 1, "Expected one preserved local EVA script");
  checkInlineChat(inlineScript[0][1]);

  const scratch = mkdtempSync(path.join(tmpdir(), "bits-alive-dist-syntax-"));
  try {
    assertNoReparsePath(scratch, tmpdir());
    const firebaseCheckFile = path.join(scratch, "firebase-app.mjs");
    writeFileSync(firebaseCheckFile, distFirebaseJs, { flag: "wx" });
    const syntaxCheck = spawnSync(process.execPath, ["--check", firebaseCheckFile], { encoding: "utf8" });
    assert.equal(syntaxCheck.status, 0, `Firebase app.js syntax check failed: ${syntaxCheck.stderr}`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function validateHistoricalSources(projectRoot, verifyGitSources) {
  if (!verifyGitSources) return;
  try {
    execFileSync("git", ["diff", "--quiet", "--", "index.html", "eva-frontend/index.html", "eva-frontend/app.js"], { cwd: projectRoot });
    execFileSync("git", ["diff", "--cached", "--quiet", "--", "index.html", "eva-frontend/index.html", "eva-frontend/app.js"], { cwd: projectRoot });
  } catch (error) {
    throw new Error("Historical source files changed; inspect the worktree and restore only with authorization.", { cause: error });
  }
}

function validateExistingDistribution(dist, projectRoot) {
  if (!existsSync(dist)) return;
  assertNoReparsePath(dist, projectRoot);
  const info = lstatSync(dist);
  assert.ok(info.isDirectory() && !info.isSymbolicLink(), `Refusing non-directory or reparse point: ${dist}`);

  const foundFiles = [];
  function visit(directory, prefix = "") {
    assertNoReparsePath(directory, projectRoot);
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const entryPath = path.join(directory, entry.name);
      assertNoReparsePath(entryPath, projectRoot);
      const entryInfo = lstatSync(entryPath);
      assert.ok(!entryInfo.isSymbolicLink(), `Refusing reparse point in existing dist: ${entryPath}`);
      if (entryInfo.isDirectory()) visit(entryPath, relativePath);
      else {
        assert.ok(entryInfo.isFile(), `Refusing non-file in existing dist: ${relativePath}`);
        assert.ok(allowlist.includes(relativePath), `Refusing to replace dist with unexpected file: ${relativePath}`);
        foundFiles.push(relativePath);
      }
    }
  }
  visit(dist);
}

function buildDistribution(projectRoot, options = {}) {
  const { verifyGitSources = true, rename = renameSync } = options;
  const root = path.resolve(projectRoot);
  assertNoReparsePath(root, root);
  const dist = path.join(root, "dist");
  assertNoReparsePath(dist, root);
  validateExistingDistribution(dist, root);

  const sources = new Map();
  for (const relativePath of allowlist) {
    const sourcePath = path.join(root, relativePath);
    assertNoReparsePath(sourcePath, root);
    const info = lstatSync(sourcePath);
    assert.ok(info.isFile() && !info.isSymbolicLink(), `Required regular source file is missing: ${relativePath}`);
    sources.set(relativePath, readFileSync(sourcePath));
  }

  const sourceHashes = new Map([...sources].map(([relativePath, content]) => [
    relativePath,
    createHash("sha256").update(content).digest("hex"),
  ]));
  const publicRootHtml = derivePublicHtml(sources.get("index.html").toString("utf8"));

  validateHistoricalSources(root, verifyGitSources);

  const stageRoot = mkdtempSync(path.join(root, ".dist-stage-"));
  assertNoReparsePath(stageRoot, root);
  const candidate = path.join(stageRoot, "candidate");
  const backup = path.join(stageRoot, "previous-dist");
  let keepStageForRecovery = false;
  try {
    mkdirSync(candidate);
    assertNoReparsePath(candidate, root);
    for (const relativePath of allowlist) {
      const target = path.join(candidate, relativePath);
      assertNoReparsePath(target, root);
      mkdirSync(path.dirname(target), { recursive: true });
      assertNoReparsePath(path.dirname(target), root);
      if (relativePath === "index.html") writeFileSync(target, publicRootHtml, { flag: "wx" });
      else copyFileSync(path.join(root, relativePath), target);
      assertNoReparsePath(target, root);
    }

    validateCandidate(root, candidate, sourceHashes);
    validateExistingDistribution(dist, root);
    validateHistoricalSources(root, verifyGitSources);

    let previousMoved = false;
    if (existsSync(dist)) {
      assertNoReparsePath(dist, root);
      rename(dist, backup);
      previousMoved = true;
    }

    try {
      assertNoReparsePath(dist, root);
      assertNoReparsePath(candidate, root);
      rename(candidate, dist);
    } catch (promotionError) {
      if (previousMoved) {
        try {
          assertNoReparsePath(backup, root);
          assertNoReparsePath(dist, root);
          rename(backup, dist);
          previousMoved = false;
        } catch (rollbackError) {
          keepStageForRecovery = true;
          throw new AggregateError(
            [promotionError, rollbackError],
            `Could not install the validated distribution or restore the previous one. Previous distribution preserved at ${backup}`,
          );
        }
      }
      throw promotionError;
    }

    if (previousMoved) {
      assertNoReparsePath(backup, root);
      rmSync(backup, { recursive: true });
    }
  } finally {
    if (!keepStageForRecovery) {
      assertNoReparsePath(stageRoot, root);
      rmSync(stageRoot, { recursive: true, force: true });
    }
  }

  console.log(`Built ${allowlist.length} allowlisted files in ${dist}.`);
  console.log("Verified: exact allowlist, copied-file hashes, credential removal, relative assets, JavaScript syntax, EVA chat/blink, and unchanged historical sources.");
}

function testSnapshot(directory) {
  const files = assertSafeTree(directory, allowlist, directory);
  return new Map(files.map((relativePath) => [relativePath, sha256(path.join(directory, relativePath))]));
}

function assertSnapshot(directory, expected) {
  const actual = testSnapshot(directory);
  assert.deepEqual(actual, expected, "Existing distribution changed during a failed build");
}

function prepareFixture(destination) {
  mkdirSync(destination);
  const projectRoot = path.join(destination, "project");
  mkdirSync(projectRoot);
  const sourceRoot = path.resolve(path.dirname(scriptPath), "..");
  for (const relativePath of allowlist) {
    const source = path.join(sourceRoot, relativePath);
    const target = path.join(projectRoot, relativePath);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
  return projectRoot;
}

function runNegativeTests() {
  const sandbox = mkdtempSync(path.join(tmpdir(), "bits-alive-dist-negative-"));
  try {
    assertNoReparsePath(sandbox, tmpdir());

    const symlinkFixture = prepareFixture(path.join(sandbox, "symlink-case"));
    const redirectedTarget = path.join(symlinkFixture, "redirect-target");
    mkdirSync(redirectedTarget);
    writeFileSync(path.join(redirectedTarget, "sentinel.txt"), "unchanged", { flag: "wx" });
    symlinkSync(redirectedTarget, path.join(symlinkFixture, "dist"), process.platform === "win32" ? "junction" : "dir");
    assert.throws(
      () => buildDistribution(symlinkFixture, { verifyGitSources: false }),
      /symlink, junction, or reparse point|redirected path component/i,
    );
    assert.equal(readFileSync(path.join(redirectedTarget, "sentinel.txt"), "utf8"), "unchanged");

    const routeFixture = prepareFixture(path.join(sandbox, "route-case"));
    buildDistribution(routeFixture, { verifyGitSources: false });
    const assetRedirect = path.join(routeFixture, "asset-redirect");
    mkdirSync(assetRedirect);
    writeFileSync(path.join(assetRedirect, "sentinel.txt"), "unchanged", { flag: "wx" });
    const assetsPath = path.join(routeFixture, "dist", "assets");
    rmSync(assetsPath, { recursive: true });
    symlinkSync(assetRedirect, assetsPath, process.platform === "win32" ? "junction" : "dir");
    assert.throws(
      () => buildDistribution(routeFixture, { verifyGitSources: false }),
      /symlink, junction, or reparse point|redirected path component/i,
    );
    assert.equal(readFileSync(path.join(assetRedirect, "sentinel.txt"), "utf8"), "unchanged");

    const validationFixture = prepareFixture(path.join(sandbox, "validation-case"));
    buildDistribution(validationFixture, { verifyGitSources: false });
    const previousDistribution = testSnapshot(path.join(validationFixture, "dist"));
    const sourceHtml = path.join(validationFixture, "index.html");
    writeFileSync(sourceHtml, readFileSync(sourceHtml, "utf8").replace('id="evaChat"', 'id="chat-renamed"'));
    assert.throws(
      () => buildDistribution(validationFixture, { verifyGitSources: false }),
      /Expected exactly one|The input did not match/,
    );
    assertSnapshot(path.join(validationFixture, "dist"), previousDistribution);
    assert.equal(readdirSync(validationFixture).some((name) => name.startsWith(".dist-stage-")), false,
      "Failed validation should clean its staging directory");

    const promotionFixture = prepareFixture(path.join(sandbox, "promotion-case"));
    buildDistribution(promotionFixture, { verifyGitSources: false });
    const priorPromotionDistribution = testSnapshot(path.join(promotionFixture, "dist"));
    const promotionError = new Error("controlled promotion failure");
    assert.throws(
      () => buildDistribution(promotionFixture, {
        verifyGitSources: false,
        rename(from, to) {
          if (path.basename(from) === "candidate" && path.basename(to) === "dist") throw promotionError;
          renameSync(from, to);
        },
      }),
      (error) => error === promotionError,
    );
    assertSnapshot(path.join(promotionFixture, "dist"), priorPromotionDistribution);
    assert.equal(readdirSync(promotionFixture).some((name) => name.startsWith(".dist-stage-")), false,
      "Failed promotion should restore dist and clean its staging directory");

    console.log("Negative tests passed: redirected dist and nested destination rejected without touching their targets; validation failure preserves old dist; promotion failure rolls back old dist.");
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--self-test") {
  runNegativeTests();
} else {
  assert.equal(args.length, 0, "Usage: node scripts/build-dist.mjs [--self-test]");
  buildDistribution(path.resolve(path.dirname(scriptPath), ".."));
}
