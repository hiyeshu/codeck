/**
 * [INPUT]: 依赖 Node.js fs/path，读取 JSON 文件并提供统一的 CLI 退出工具
 * [OUTPUT]: 对外提供 readJson 与 exitWith，供 skill CLI 共享
 * [POS]: skills/ 的共享命令行工具层，避免重复实现文件读取和退出逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { readFileSync } from "fs";
import { resolve } from "path";

export function readJson<T = any>(path: string): T {
  return JSON.parse(readFileSync(resolve(path), "utf8")) as T;
}

export function exitWith(message: string, code = 1): never {
  console.error(message);
  process.exit(code);
}
