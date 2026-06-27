/**
 * [INPUT]: 依赖 skills/codeck/scripts/deck-editor-core.mjs 的 deck room 文件操作。
 * [OUTPUT]: 提供 get/apply/list/checkout/save 五个 codeck deck editor MCP tools,其中 get 会返回最新 UI selection。
 * [POS]: mcp 层的 stdio 入口,把 Codex tool call 映射为本地 room 状态读写。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import readline from "node:readline";
import { readFile } from "node:fs/promises";
import {
  checkoutRevision,
  createRevision,
  listPendingChanges,
  listRevisions,
  resolveDeckDir,
  saveAsset,
} from "../skills/codeck/scripts/deck-editor-core.mjs";

const SERVER_NAME = "codeck deck editor";
const SERVER_VERSION = "0.1.0";

const TOOL_GET_PENDING = "get_codeck_pending_changes";
const TOOL_APPLY_REVISION = "apply_codeck_revision";
const TOOL_LIST_REVISIONS = "list_codeck_revisions";
const TOOL_CHECKOUT_REVISION = "checkout_codeck_revision";
const TOOL_SAVE_ASSET = "save_codeck_asset";

const JsonRpcError = {
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
};

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function sendResult(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

function textResult(text, structuredContent = {}) {
  return {
    content: [{ type: "text", text }],
    structuredContent,
  };
}

function deckDirSchema() {
  return {
    deckDir: {
      type: "string",
      description: "Absolute deck room path. Defaults to CODECK_DECK_DIR or ~/.codeck/projects/<cwd-name>.",
    },
    projectDir: {
      type: "string",
      description: "Project directory used to derive the default deck room when deckDir is omitted.",
    },
  };
}

function toolDefinitions() {
  return [
    {
      name: TOOL_GET_PENDING,
      title: "Get codeck pending changes",
      description: "Read latest UI selection, unconsumed browser events, agent inbox messages, and feedback sidecars from a codeck deck room.",
      inputSchema: {
        type: "object",
        properties: deckDirSchema(),
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    {
      name: TOOL_APPLY_REVISION,
      title: "Apply codeck revision",
      description: "Snapshot current slides.html, custom.css, assets, and optional built HTML as a new deck revision.",
      inputSchema: {
        type: "object",
        properties: {
          ...deckDirSchema(),
          label: { type: "string", description: "Short revision label." },
          note: { type: "string", description: "Agent note explaining why the revision exists." },
          htmlPath: { type: "string", description: "Optional built HTML path to copy into the revision." },
          html: { type: "string", description: "Optional built HTML content to store in the revision." },
          fileStem: { type: "string", description: "Output file stem for stored HTML." },
        },
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    {
      name: TOOL_LIST_REVISIONS,
      title: "List codeck revisions",
      description: "List revision snapshots for a codeck deck room.",
      inputSchema: {
        type: "object",
        properties: deckDirSchema(),
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    {
      name: TOOL_CHECKOUT_REVISION,
      title: "Checkout codeck revision",
      description: "Restore slides.html, custom.css, and assets from a revision snapshot.",
      inputSchema: {
        type: "object",
        properties: {
          ...deckDirSchema(),
          revision: { type: "string", description: "Revision id such as r001." },
        },
        required: ["revision"],
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    {
      name: TOOL_SAVE_ASSET,
      title: "Save codeck asset",
      description: "Save a local file or data URL into the deck room assets directory.",
      inputSchema: {
        type: "object",
        properties: {
          ...deckDirSchema(),
          fileName: { type: "string", description: "Requested destination file name." },
          sourcePath: { type: "string", description: "Local source file path." },
          dataUrl: { type: "string", description: "Data URL payload to decode and save." },
        },
        additionalProperties: false,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
  ];
}

async function handleToolCall(id, params = {}) {
  const args = params.arguments ?? {};

  if (params.name === TOOL_GET_PENDING) {
    const deckDir = resolveDeckDir(args);
    const pending = await listPendingChanges(deckDir);
    const count = pending.events.length + pending.inbox.length + pending.feedback.length + (pending.selection ? 1 : 0);
    sendResult(id, textResult(`${count} pending codeck item(s) in ${deckDir}.`, pending));
    return;
  }

  if (params.name === TOOL_APPLY_REVISION) {
    const deckDir = resolveDeckDir(args);
    let html = typeof args.html === "string" ? args.html : null;
    if (!html && typeof args.htmlPath === "string" && args.htmlPath.trim()) {
      html = await readFile(args.htmlPath, "utf8");
    }
    const revision = await createRevision(deckDir, {
      html,
      label: args.label,
      note: args.note,
      fileStem: args.fileStem,
      source: "mcp",
    });
    sendResult(id, textResult(`Created codeck revision ${revision.id}.`, revision));
    return;
  }

  if (params.name === TOOL_LIST_REVISIONS) {
    const deckDir = resolveDeckDir(args);
    const revisions = await listRevisions(deckDir);
    sendResult(id, textResult(`${revisions.length} codeck revision(s) in ${deckDir}.`, { deckDir, revisions }));
    return;
  }

  if (params.name === TOOL_CHECKOUT_REVISION) {
    const deckDir = resolveDeckDir(args);
    const result = await checkoutRevision(deckDir, args.revision);
    sendResult(id, textResult(`Checked out ${result.revision} into ${deckDir}.`, result));
    return;
  }

  if (params.name === TOOL_SAVE_ASSET) {
    const deckDir = resolveDeckDir(args);
    const asset = await saveAsset(deckDir, args);
    sendResult(id, textResult(`Saved ${asset.fileName} into ${deckDir}/assets.`, asset));
    return;
  }

  sendError(id, JsonRpcError.INVALID_PARAMS, `Unknown tool: ${params.name ?? ""}`);
}

async function handleRequest(message) {
  const { id, method, params } = message;

  if (method === "initialize") {
    sendResult(id, {
      protocolVersion: params?.protocolVersion ?? "2025-11-25",
      capabilities: { tools: {} },
      serverInfo: {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
      instructions:
        "Read and write codeck deck editor room state. Use pending changes as instructions, then update source files and create a revision snapshot.",
    });
    return;
  }

  if (method === "ping") {
    sendResult(id, {});
    return;
  }

  if (method === "tools/list") {
    sendResult(id, { tools: toolDefinitions() });
    return;
  }

  if (method === "tools/call") {
    try {
      await handleToolCall(id, params);
    } catch (error) {
      sendError(id, JsonRpcError.INVALID_PARAMS, error instanceof Error ? error.message : String(error));
    }
    return;
  }

  if (id !== undefined) {
    sendError(id, JsonRpcError.METHOD_NOT_FOUND, `Method not found: ${method}`);
  }
}

const lines = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

lines.on("line", (line) => {
  if (line.trim().length === 0) return;

  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return;
  }

  handleRequest(message).catch((error) => {
    if (message.id !== undefined) {
      sendError(message.id, JsonRpcError.INVALID_PARAMS, error instanceof Error ? error.message : String(error));
    }
  });
});
