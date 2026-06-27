/**
 * [INPUT]: 依赖 node fs/path/os/crypto 原语与 codeck deck room 文件结构。
 * [OUTPUT]: 提供 deck editor 服务和 MCP 共享的 selection、event、inbox、asset、revision 操作。
 * [POS]: skills/codeck/scripts 的本地协作状态内核,统一浏览器感知状态与 agent 消费语义。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { randomUUID } from "node:crypto";
import {
  appendFile,
  copyFile,
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const ROOM_DIRS = ["assets", "events", "inbox", "revisions", "state"];

export function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function slugify(value, fallback = "deck") {
  return String(value || fallback)
    .trim()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || fallback;
}

export function defaultDeckDir(projectDir = process.cwd()) {
  return path.join(os.homedir(), ".codeck", "projects", slugify(path.basename(projectDir)));
}

export function resolveDeckDir(args = {}) {
  const explicit = nonEmptyString(args.deckDir) || nonEmptyString(process.env.CODECK_DECK_DIR);
  if (explicit) return path.resolve(explicit);
  const projectDir = nonEmptyString(args.projectDir) || process.env.CODECK_PROJECT_DIR || process.cwd();
  return defaultDeckDir(projectDir);
}

export async function ensureRoom(deckDir) {
  await mkdir(deckDir, { recursive: true });
  await Promise.all(ROOM_DIRS.map((dir) => mkdir(path.join(deckDir, dir), { recursive: true })));
}

export function datePart(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function stampPart(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\..+$/, "Z");
}

export function sanitizeFileName(name, fallbackName = "asset.bin") {
  const rawName = path.basename(String(name || fallbackName));
  const ext = path.extname(rawName) || path.extname(fallbackName) || ".bin";
  const base = rawName
    .slice(0, rawName.length - path.extname(rawName).length)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "asset"}${ext}`;
}

export function isSafeChildPath(parent, child) {
  const rel = path.relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

export async function writeJsonAtomic(filePath, payload) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempFile = `${filePath}.${process.pid}.${Date.now()}.${randomUUID()}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(payload, null, 2)}\n`);
  await rename(tempFile, filePath);
}

export async function readJsonFile(filePath, fallback) {
  const hasFallback = arguments.length > 1;
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT" && hasFallback) return fallback;
    throw error;
  }
}

export async function appendEvent(deckDir, event = {}) {
  await ensureRoom(deckDir);
  const now = new Date();
  const envelope = {
    id: event.id || `evt-${stampPart(now)}-${randomUUID().slice(0, 8)}`,
    receivedAt: now.toISOString(),
    source: event.source || "codeck-editor",
    kind: event.kind || event.type || "event",
    ...event,
  };
  const filePath = path.join(deckDir, "events", `${datePart(now)}.jsonl`);
  await appendFile(filePath, `${JSON.stringify(envelope)}\n`);
  return { event: envelope, filePath };
}

export async function readUiSelection(deckDir) {
  await ensureRoom(deckDir);
  return readJsonFile(path.join(deckDir, "state", "selection.json"), null);
}

export async function saveUiSelection(deckDir, payload = {}) {
  await ensureRoom(deckDir);
  const now = new Date();
  const selection = {
    id: payload.id || `sel-${stampPart(now)}-${randomUUID().slice(0, 8)}`,
    updatedAt: now.toISOString(),
    source: payload.source || "codeck-editor",
    kind: "ui-selection",
    ...payload,
  };
  const filePath = path.join(deckDir, "state", "selection.json");
  await writeJsonAtomic(filePath, selection);
  const event = await appendEvent(deckDir, selection);
  return { selection, filePath, event: event.event };
}

function markerLines(marker = {}) {
  const lines = [];
  if (marker.slide) lines.push(`- slide: ${marker.slide}`);
  if (marker.title) lines.push(`- title: ${marker.title}`);
  if (marker.type) lines.push(`- type: ${marker.type}`);
  if (marker.ckId) lines.push(`- ck_id: \`${marker.ckId}\``);
  if (marker.role) lines.push(`- role: ${marker.role}`);
  if (marker.selector) lines.push(`- selector: \`${marker.selector}\``);
  if (marker.sourceMap?.file) lines.push(`- source: \`${marker.sourceMap.file}\``);
  if (marker.sourceMap?.selector) lines.push(`- source_selector: \`${marker.sourceMap.selector}\``);
  if (marker.bbox) lines.push(`- bbox: \`${JSON.stringify(marker.bbox)}\``);
  if (marker.excerpt) {
    lines.push("");
    lines.push("```");
    lines.push(String(marker.excerpt).slice(0, 2000));
    lines.push("```");
  }
  return lines.join("\n");
}

export async function saveInboxMessage(deckDir, payload = {}) {
  await ensureRoom(deckDir);
  const now = new Date();
  const id = payload.id || `agent-${stampPart(now)}-${randomUUID().slice(0, 8)}`;
  const fileName = `${id}.md`;
  const filePath = path.join(deckDir, "inbox", fileName);
  const marker = payload.marker && typeof payload.marker === "object" ? payload.marker : {};
  const message = String(payload.message || "").trim();
  const markdown = [
    "---",
    `id: ${id}`,
    `created_at: ${now.toISOString()}`,
    "source: codeck-agent-dialog",
    `marker_slide: ${marker.slide || ""}`,
    "status: open",
    "---",
    "",
    "# Agent Request",
    "",
    message || "(empty)",
    "",
    "## Marker",
    "",
    markerLines(marker) || "(no marker)",
    "",
  ].join("\n");

  await writeFile(filePath, markdown);
  const event = await appendEvent(deckDir, {
    kind: "agent-message",
    inboxFile: path.relative(deckDir, filePath),
    message,
    marker,
  });
  return { id, filePath, event: event.event };
}

export async function saveFeedbackMarkdown(deckDir, payload = {}) {
  await ensureRoom(deckDir);
  const stem = slugify(payload.deck || payload.stem || "deck");
  const rev = slugify(payload.revision || "r1");
  const fileName = sanitizeFileName(payload.fileName || `feedback-${stem}-${rev}.md`, `feedback-${stem}-${rev}.md`);
  const filePath = path.join(deckDir, fileName);
  await writeFile(filePath, String(payload.markdown || ""));
  return { filePath, fileName };
}

async function readJsonl(filePath) {
  const text = await readFile(filePath, "utf8");
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function listFiles(dir, predicate = () => true) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && predicate(entry.name)).map((entry) => entry.name).sort();
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

export async function listPendingChanges(deckDir) {
  await ensureRoom(deckDir);
  const selection = await readUiSelection(deckDir);
  const eventNames = await listFiles(path.join(deckDir, "events"), (name) => name.endsWith(".jsonl"));
  const inboxNames = await listFiles(path.join(deckDir, "inbox"), (name) => name.endsWith(".md"));
  const feedbackNames = await listFiles(deckDir, (name) => /^feedback-.*\.md$/.test(name));

  const events = [];
  for (const name of eventNames) {
    const filePath = path.join(deckDir, "events", name);
    const rows = await readJsonl(filePath);
    rows.forEach((event) => events.push({ file: path.relative(deckDir, filePath), event }));
  }

  const inbox = [];
  for (const name of inboxNames) {
    const filePath = path.join(deckDir, "inbox", name);
    inbox.push({ file: path.relative(deckDir, filePath), content: await readFile(filePath, "utf8") });
  }

  const feedback = [];
  for (const name of feedbackNames) {
    const filePath = path.join(deckDir, name);
    feedback.push({ file: name, content: await readFile(filePath, "utf8") });
  }

  return { deckDir, selection, events, inbox, feedback };
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export async function listRevisions(deckDir) {
  const revisionsDir = path.join(deckDir, "revisions");
  try {
    const entries = await readdir(revisionsDir, { withFileTypes: true });
    const revisions = [];
    for (const entry of entries) {
      if (!entry.isDirectory() || !/^r[0-9]{3,}$/.test(entry.name)) continue;
      const dir = path.join(revisionsDir, entry.name);
      const manifest = await readJsonFile(path.join(dir, "manifest.json"), {});
      revisions.push({ id: entry.name, dir, ...manifest });
    }
    return revisions.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

export async function nextRevisionId(deckDir) {
  const revisions = await listRevisions(deckDir);
  const last = revisions
    .map((revision) => Number(String(revision.id).replace(/^r/, "")))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
    .at(-1) || 0;
  return `r${String(last + 1).padStart(3, "0")}`;
}

export async function createRevision(deckDir, options = {}) {
  await ensureRoom(deckDir);
  const id = options.revision || await nextRevisionId(deckDir);
  const revisionDir = path.join(deckDir, "revisions", id);
  await mkdir(revisionDir, { recursive: true });

  const copied = [];
  for (const name of ["slides.html", "custom.css", "deck.md", "DESIGN.md", "speech.md"]) {
    const source = path.join(deckDir, name);
    if (await exists(source)) {
      await copyFile(source, path.join(revisionDir, name));
      copied.push(name);
    }
  }
  const sourceAssets = path.join(deckDir, "assets");
  if (await exists(sourceAssets)) {
    await cp(sourceAssets, path.join(revisionDir, "assets"), { recursive: true, force: true });
    copied.push("assets/");
  }

  let htmlFile = null;
  if (typeof options.html === "string" && options.html.length > 0) {
    const stem = slugify(options.fileStem || path.basename(deckDir));
    htmlFile = `${stem}-${id}.html`;
    await writeFile(path.join(revisionDir, htmlFile), options.html);
    copied.push(htmlFile);
  }

  const manifest = {
    id,
    createdAt: new Date().toISOString(),
    source: options.source || "codeck-editor",
    label: options.label || "",
    note: options.note || "",
    htmlFile,
    copied,
  };
  await writeJsonAtomic(path.join(revisionDir, "manifest.json"), manifest);
  await appendEvent(deckDir, { kind: "revision-created", revision: id, manifest });
  return { id, dir: revisionDir, ...manifest };
}

export async function checkoutRevision(deckDir, revision) {
  const id = slugify(revision, "");
  if (!/^r[0-9]{3,}$/.test(id)) throw new Error(`Invalid revision id: ${revision}`);
  const revisionDir = path.join(deckDir, "revisions", id);
  if (!(await exists(revisionDir))) throw new Error(`Revision not found: ${id}`);

  for (const name of ["slides.html", "custom.css", "deck.md", "DESIGN.md", "speech.md"]) {
    const source = path.join(revisionDir, name);
    if (await exists(source)) await copyFile(source, path.join(deckDir, name));
  }

  const revisionAssets = path.join(revisionDir, "assets");
  const deckAssets = path.join(deckDir, "assets");
  if (await exists(revisionAssets)) {
    await rm(deckAssets, { recursive: true, force: true });
    await cp(revisionAssets, deckAssets, { recursive: true, force: true });
  }

  const event = await appendEvent(deckDir, { kind: "revision-checked-out", revision: id });
  return { deckDir, revision: id, event: event.event };
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;,]+)?(?:;[^,]*)?,(.*)$/s.exec(String(dataUrl || ""));
  if (!match) return null;
  const mimeType = match[1] || "application/octet-stream";
  const encoded = match[2];
  const isBase64 = /^data:[^,]*;base64,/i.test(dataUrl);
  const buffer = isBase64 ? Buffer.from(encoded, "base64") : Buffer.from(decodeURIComponent(encoded));
  return { buffer, mimeType };
}

function extFromMime(mimeType) {
  switch (mimeType) {
    case "image/png": return ".png";
    case "image/jpeg": return ".jpg";
    case "image/webp": return ".webp";
    case "image/gif": return ".gif";
    case "image/svg+xml": return ".svg";
    default: return ".bin";
  }
}

async function uniquePath(dir, requestedName) {
  const safe = sanitizeFileName(requestedName);
  const ext = path.extname(safe);
  const base = safe.slice(0, safe.length - ext.length);
  let fileName = safe;
  let counter = 2;
  while (await exists(path.join(dir, fileName))) {
    fileName = `${base}-v${counter}${ext}`;
    counter += 1;
  }
  return { fileName, filePath: path.join(dir, fileName) };
}

export async function saveAsset(deckDir, payload = {}) {
  await ensureRoom(deckDir);
  const assetsDir = path.join(deckDir, "assets");
  if (!isSafeChildPath(deckDir, assetsDir)) throw new Error(`Unsafe assets directory: ${assetsDir}`);

  let buffer = null;
  let fallbackName = payload.fileName || "asset.bin";
  let mimeType = "application/octet-stream";

  if (payload.dataUrl) {
    const parsed = parseDataUrl(payload.dataUrl);
    if (!parsed) throw new Error("Expected a valid data URL.");
    buffer = parsed.buffer;
    mimeType = parsed.mimeType;
    fallbackName = payload.fileName || `asset${extFromMime(mimeType)}`;
  } else if (payload.sourcePath) {
    const sourcePath = path.resolve(String(payload.sourcePath));
    const sourceStat = await stat(sourcePath);
    if (!sourceStat.isFile()) throw new Error(`sourcePath is not a file: ${sourcePath}`);
    fallbackName = payload.fileName || path.basename(sourcePath);
    const unique = await uniquePath(assetsDir, fallbackName);
    await copyFile(sourcePath, unique.filePath);
    await appendEvent(deckDir, { kind: "asset-saved", fileName: unique.fileName, path: path.relative(deckDir, unique.filePath) });
    return { fileName: unique.fileName, filePath: unique.filePath, src: `assets/${unique.fileName}` };
  } else {
    throw new Error("Provide dataUrl or sourcePath.");
  }

  const unique = await uniquePath(assetsDir, fallbackName);
  await writeFile(unique.filePath, buffer);
  await appendEvent(deckDir, {
    kind: "asset-saved",
    fileName: unique.fileName,
    mimeType,
    path: path.relative(deckDir, unique.filePath),
  });
  return { fileName: unique.fileName, filePath: unique.filePath, src: `assets/${unique.fileName}`, mimeType };
}
