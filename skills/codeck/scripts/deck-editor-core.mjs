/**
 * [INPUT]: 依赖 node fs/path/os/crypto 原语与 codeck deck room 文件结构。
 * [OUTPUT]: 提供 deck editor 服务和 MCP 共享的 source patch、selection、event、inbox、asset、revision 操作。
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function parseElementPath(elementPath) {
  return String(elementPath || "")
    .split("-")
    .filter(Boolean)
    .map((part) => {
      const match = /^(.+?)([0-9]{2})$/.exec(part);
      if (!match) throw new Error(`Invalid element path segment: ${part}`);
      return { tagName: match[1].toLowerCase(), nth: Number(match[2]) };
    });
}

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function isVoidOpenTag(tagName, openTag) {
  return VOID_TAGS.has(tagName.toLowerCase()) || /\/\s*>$/.test(openTag);
}

function findElementEnd(html, openStart, openEnd, tagName) {
  const openTag = html.slice(openStart, openEnd);
  if (isVoidOpenTag(tagName, openTag)) {
    return { closeStart: openEnd, closeEnd: openEnd };
  }

  const tagRe = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "gi");
  tagRe.lastIndex = openEnd;
  let depth = 1;
  let match;
  while ((match = tagRe.exec(html))) {
    const token = match[0];
    if (/^<\//.test(token)) {
      depth -= 1;
      if (depth === 0) {
        return { closeStart: match.index, closeEnd: tagRe.lastIndex };
      }
    } else if (!isVoidOpenTag(tagName, token)) {
      depth += 1;
    }
  }
  throw new Error(`Unclosed <${tagName}> element.`);
}

function findDirectChildRange(html, tagName, nth) {
  const tagRe = /<\/?([a-zA-Z][\w:-]*)\b[^>]*>/g;
  let depth = 0;
  let count = 0;
  let match;
  while ((match = tagRe.exec(html))) {
    const token = match[0];
    const name = match[1].toLowerCase();
    const closing = /^<\//.test(token);
    if (closing) {
      if (depth > 0) depth -= 1;
      continue;
    }

    if (depth === 0 && name === tagName) {
      count += 1;
      if (count === nth) {
        const openStart = match.index;
        const openEnd = tagRe.lastIndex;
        const end = findElementEnd(html, openStart, openEnd, name);
        return {
          tagName: name,
          start: openStart,
          openEnd,
          closeStart: end.closeStart,
          closeEnd: end.closeEnd,
          openTag: token,
          isVoid: end.closeStart === openEnd && end.closeEnd === openEnd,
        };
      }
    }

    if (!isVoidOpenTag(name, token)) depth += 1;
  }
  return null;
}

function findRangeByElementPath(html, elementPath) {
  const parts = parseElementPath(elementPath);
  if (!parts.length) throw new Error("Missing elementPath.");

  let current = html;
  let offset = 0;
  let range = null;
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    range = findDirectChildRange(current, part.tagName, part.nth);
    if (!range) throw new Error(`Element path not found: ${elementPath}`);

    const absolute = {
      ...range,
      start: offset + range.start,
      openEnd: offset + range.openEnd,
      closeStart: offset + range.closeStart,
      closeEnd: offset + range.closeEnd,
    };
    if (i === parts.length - 1) return absolute;
    if (range.isVoid) throw new Error(`Element path crosses void tag: ${elementPath}`);
    current = current.slice(range.openEnd, range.closeStart);
    offset += range.openEnd;
  }
  return range;
}

function hasSlideClass(openTag) {
  const classMatch = /\bclass\s*=\s*(["'])(.*?)\1/is.exec(openTag);
  return !!classMatch && classMatch[2].split(/\s+/).includes("slide");
}

function findSlideRange(html, slideNumber) {
  const wanted = Number(slideNumber || 1);
  const sectionRe = /<section\b[^>]*>/gi;
  let count = 0;
  let match;
  while ((match = sectionRe.exec(html))) {
    const openTag = match[0];
    if (!hasSlideClass(openTag)) continue;
    count += 1;
    if (count !== wanted) continue;
    const end = findElementEnd(html, match.index, sectionRe.lastIndex, "section");
    return {
      start: match.index,
      openEnd: sectionRe.lastIndex,
      closeStart: end.closeStart,
      closeEnd: end.closeEnd,
    };
  }
  throw new Error(`Slide not found: ${wanted}`);
}

function replaceRange(text, start, end, replacement) {
  return `${text.slice(0, start)}${replacement}${text.slice(end)}`;
}

function sourceMapFromPayload(payload = {}) {
  const node = payload.node && typeof payload.node === "object" ? payload.node : {};
  const sourceMap = payload.sourceMap && typeof payload.sourceMap === "object" ? payload.sourceMap : node.sourceMap || {};
  return { node, sourceMap };
}

function sourceTarget(slidesHtml, payload = {}) {
  const { node, sourceMap } = sourceMapFromPayload(payload);
  const slide = findSlideRange(slidesHtml, sourceMap.slide || node.slide || payload.slide || 1);
  const elementPath = sourceMap.elementPath || payload.elementPath;
  if (!elementPath || elementPath === "slide") throw new Error("Expected a non-slide elementPath.");
  const slideInner = slidesHtml.slice(slide.openEnd, slide.closeStart);
  const localRange = findRangeByElementPath(slideInner, elementPath);
  return {
    node,
    sourceMap,
    elementPath,
    slide,
    range: {
      ...localRange,
      start: slide.openEnd + localRange.start,
      openEnd: slide.openEnd + localRange.openEnd,
      closeStart: slide.openEnd + localRange.closeStart,
      closeEnd: slide.openEnd + localRange.closeEnd,
    },
  };
}

function setHtmlAttribute(openTag, name, value) {
  const attrRe = new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, "is");
  if (attrRe.test(openTag)) {
    return openTag.replace(attrRe, ` ${name}="${escapeAttr(value)}"`);
  }
  return openTag.replace(/\s*\/?>$/, (end) => ` ${name}="${escapeAttr(value)}"${end}`);
}

export async function applyTextEdit(deckDir, payload = {}) {
  await ensureRoom(deckDir);
  const slidesPath = path.join(deckDir, "slides.html");
  const slidesHtml = await readFile(slidesPath, "utf8");
  const text = String(payload.text ?? payload.after ?? payload.details?.text ?? "");
  const target = sourceTarget(slidesHtml, payload);
  if (target.range.isVoid) throw new Error("Cannot write text into a void element.");

  const nextHtml = replaceRange(slidesHtml, target.range.openEnd, target.range.closeStart, escapeHtml(text));
  await writeFile(slidesPath, nextHtml);
  const event = await appendEvent(deckDir, {
    kind: "source-text-updated",
    node: target.node,
    sourceMap: target.sourceMap,
    text,
  });
  return { ok: true, filePath: slidesPath, node: target.node, sourceMap: target.sourceMap, event: event.event };
}

export async function applyImageReplacement(deckDir, payload = {}) {
  await ensureRoom(deckDir);
  const asset = payload.assetSrc
    ? { src: String(payload.assetSrc), fileName: path.basename(String(payload.assetSrc)) }
    : await saveAsset(deckDir, {
      dataUrl: payload.dataUrl,
      sourcePath: payload.sourcePath,
      fileName: payload.fileName,
    });

  const slidesPath = path.join(deckDir, "slides.html");
  const slidesHtml = await readFile(slidesPath, "utf8");
  const target = sourceTarget(slidesHtml, payload);
  let nextHtml = slidesHtml;
  let action = "replace-src";

  if (target.range.tagName === "img") {
    const openTag = slidesHtml.slice(target.range.start, target.range.openEnd);
    let nextOpenTag = setHtmlAttribute(openTag, "src", asset.src);
    if (payload.alt) nextOpenTag = setHtmlAttribute(nextOpenTag, "alt", payload.alt);
    nextHtml = replaceRange(slidesHtml, target.range.start, target.range.openEnd, nextOpenTag);
  } else if (!target.range.isVoid) {
    action = "insert-img";
    const img = `<img src="${escapeAttr(asset.src)}"${payload.alt ? ` alt="${escapeAttr(payload.alt)}"` : ""}>`;
    nextHtml = replaceRange(slidesHtml, target.range.openEnd, target.range.openEnd, img);
  } else {
    throw new Error(`Cannot insert image into <${target.range.tagName}>.`);
  }

  await writeFile(slidesPath, nextHtml);
  const event = await appendEvent(deckDir, {
    kind: "source-image-updated",
    action,
    node: target.node,
    sourceMap: target.sourceMap,
    asset,
  });
  return { ok: true, filePath: slidesPath, asset, action, node: target.node, sourceMap: target.sourceMap, event: event.event };
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
