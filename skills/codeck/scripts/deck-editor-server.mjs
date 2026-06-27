/**
 * [INPUT]: 依赖 deck-editor-core.mjs、assemble.sh 和一个 codeck deck room。
 * [OUTPUT]: 提供本地 HTTP deck editor 页面与 /api/selection、/api/events、/api/inbox、/api/revisions 等端点。
 * [POS]: skills/codeck/scripts 的本地 deck editor 服务,让浏览器主画布的当前指向与 agent room 共享状态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  appendEvent,
  checkoutRevision,
  createRevision,
  ensureRoom,
  listPendingChanges,
  listRevisions,
  readUiSelection,
  resolveDeckDir,
  saveAsset,
  saveFeedbackMarkdown,
  saveInboxMessage,
  saveUiSelection,
  slugify,
} from "./deck-editor-core.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assembleScript = path.join(__dirname, "assemble.sh");
const deckDir = resolveDeckDir({ deckDir: process.argv[2] });
const fileStem = slugify(process.argv[3] || path.basename(deckDir));
const port = Number(process.argv[4] || process.env.CODECK_EDITOR_PORT || 43218);
const lang = process.env.CODECK_LANG || "zh-CN";
const title = process.env.CODECK_TITLE || fileStem;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-cache");
  res.end(JSON.stringify(payload, null, 2));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 60 * 1024 * 1024) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readJsonBody(req) {
  const text = await readRequestBody(req);
  return text ? JSON.parse(text) : {};
}

function assembleHtml() {
  return new Promise((resolve, reject) => {
    execFile("bash", [assembleScript, deckDir, title, lang], { maxBuffer: 80 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout);
    });
  });
}

async function handleApi(req, res, url) {
  if (url.pathname === "/api/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true, deckDir, fileStem, port });
    return true;
  }

  if (url.pathname === "/api/deck/current" && req.method === "GET") {
    const revisions = await listRevisions(deckDir);
    sendJson(res, 200, {
      deckDir,
      fileStem,
      title,
      lang,
      currentRevision: revisions.at(-1)?.id || null,
      revisions,
    });
    return true;
  }

  if (url.pathname === "/api/pending" && req.method === "GET") {
    sendJson(res, 200, await listPendingChanges(deckDir));
    return true;
  }

  if (url.pathname === "/api/selection" && req.method === "GET") {
    sendJson(res, 200, { deckDir, selection: await readUiSelection(deckDir) });
    return true;
  }

  if (url.pathname === "/api/selection" && req.method === "POST") {
    const payload = await readJsonBody(req);
    const result = await saveUiSelection(deckDir, payload);
    sendJson(res, 200, { ok: true, ...result });
    return true;
  }

  if (url.pathname === "/api/events" && req.method === "POST") {
    const payload = await readJsonBody(req);
    const result = await appendEvent(deckDir, payload);
    let feedback = null;
    if (payload.markdown && (payload.kind === "feedback" || payload.kind === "editor-feedback")) {
      feedback = await saveFeedbackMarkdown(deckDir, {
        markdown: payload.markdown,
        deck: payload.deck,
        stem: fileStem,
        revision: payload.revision,
        fileName: payload.fileName,
      });
    }
    sendJson(res, 200, { ok: true, ...result, feedback });
    return true;
  }

  if (url.pathname === "/api/inbox" && req.method === "POST") {
    const payload = await readJsonBody(req);
    const result = await saveInboxMessage(deckDir, payload);
    sendJson(res, 200, { ok: true, ...result });
    return true;
  }

  if (url.pathname === "/api/assets" && req.method === "POST") {
    const payload = await readJsonBody(req);
    const result = await saveAsset(deckDir, payload);
    sendJson(res, 200, { ok: true, ...result });
    return true;
  }

  if (url.pathname === "/api/revisions" && req.method === "GET") {
    sendJson(res, 200, { deckDir, revisions: await listRevisions(deckDir) });
    return true;
  }

  if (url.pathname === "/api/revisions" && req.method === "POST") {
    const payload = await readJsonBody(req);
    const html = payload.html || await assembleHtml();
    const revision = await createRevision(deckDir, {
      html,
      label: payload.label,
      note: payload.note,
      fileStem,
      source: "editor-service",
    });
    sendJson(res, 200, { ok: true, revision });
    return true;
  }

  if (url.pathname === "/api/checkout" && req.method === "POST") {
    const payload = await readJsonBody(req);
    const result = await checkoutRevision(deckDir, payload.revision);
    sendJson(res, 200, { ok: true, ...result });
    return true;
  }

  return false;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      if (await handleApi(req, res, url)) return;
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("allow", "GET");
      res.end();
      return;
    }

    const html = await assembleHtml();
    res.statusCode = 200;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("cache-control", "no-cache");
    res.end(html);
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

await ensureRoom(deckDir);

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`codeck deck editor: http://127.0.0.1:${port}/\n`);
  process.stdout.write(`codeck deck room: ${deckDir}\n`);
});
