/**
 * [INPUT]: 依赖 Node.js fs/path/child_process，读取 $DECK_DIR/pipeline.json 与各阶段输入输出文件状态
 * [OUTPUT]: 对外提供 pipeline CLI：read / done / status / rebuild / check-stale，并导出可测试的状态辅助函数
 * [POS]: skill/ 的 pipeline 状态层，负责记录 revision、inputs/outputs 与 stale 传播
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { execSync } from "child_process";
import { dirname, resolve } from "path";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "fs";
import { fileURLToPath } from "url";
import { resolveDeckDir } from "./home";
import { exitWith } from "./cli-util";

export const STAGES = ["outline", "design", "review", "export", "speech"] as const;

export type StageName = (typeof STAGES)[number];

export type StageStatus = "missing" | "done" | "stale" | "error";

export interface SkillState {
  status: StageStatus;
  revision: number;
  at?: string;
  inputs?: string[];
  outputs?: string[];
  hash?: string;
  staleBy?: string;
  staleReason?: string;
}

export interface Pipeline {
  version: 1;
  revision: number;
  currentStage?: string;
  stages: Record<string, SkillState>;
}

const DEPENDENCY_GRAPH: Record<StageName, StageName[]> = {
  outline: ["design"],
  design: ["review"],
  review: ["export"],
  export: ["speech"],
  speech: [],
};

let _deckDir: string | undefined;
let _projectRoot: string | undefined;

export function resetPipelineCaches(): void {
  _deckDir = undefined;
  _projectRoot = undefined;
}

export function getDeckDir(): string {
  return (_deckDir ??= resolveDeckDir());
}

export function getPipelinePath(): string {
  return resolve(getDeckDir(), "pipeline.json");
}

export function getProjectRoot(): string {
  if (_projectRoot) return _projectRoot;
  try {
    _projectRoot = execSync("git rev-parse --show-toplevel", {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    _projectRoot = process.cwd();
  }
  return _projectRoot;
}

export function staticStageIO(): Record<StageName, { inputs: string[]; outputs: string[] }> {
  const deckDir = getDeckDir();
  return {
    outline: {
      inputs: [],
      outputs: [
        `${deckDir}/outline.md`,
        `${deckDir}/outline.json`,
        `${deckDir}/intent.md`,
        `${deckDir}/intent.json`,
      ],
    },
    design: {
      inputs: [
        `${deckDir}/outline.md`,
        `${deckDir}/outline.json`,
        `${deckDir}/intent.md`,
        `${deckDir}/intent.json`,
      ],
      outputs: [`${deckDir}/deck.json`, `${deckDir}/design.json`],
    },
    review: {
      inputs: [
        `${deckDir}/deck.json`,
        `${deckDir}/design.json`,
        `${deckDir}/intent.md`,
        `${deckDir}/intent.json`,
      ],
      outputs: [`${deckDir}/review.md`],
    },
    export: {
      inputs: [
        `${deckDir}/deck.json`,
        `${deckDir}/design.json`,
        `${deckDir}/review.md`,
      ],
      outputs: [],
    },
    speech: {
      inputs: [
        `${deckDir}/deck.json`,
        `${deckDir}/design.json`,
        `${deckDir}/review.md`,
        `${deckDir}/intent.md`,
        `${deckDir}/intent.json`,
      ],
      outputs: [`${deckDir}/speech.md`],
    },
  };
}

function normalizePath(file: string): string {
  return resolve(file);
}

function normalizePaths(files: string[]): string[] {
  return [...new Set(files.map(normalizePath))];
}

export function dynamicOutputs(stage: StageName): string[] {
  const projectRoot = getProjectRoot();
  if (stage === "design") {
    const html = safeReadDir(projectRoot).find((file) => /^.+-r\d+\.html$/.test(file));
    return html ? [normalizePath(resolve(projectRoot, html))] : [];
  }
  if (stage === "export") {
    return safeReadDir(projectRoot)
      .filter((file) => /^.+-r\d+\.(pdf|pptx)$/.test(file))
      .map((file) => normalizePath(resolve(projectRoot, file)));
  }
  return [];
}

export function defaultInputs(stage: StageName): string[] {
  return normalizePaths(staticStageIO()[stage].inputs);
}

export function defaultOutputs(stage: StageName): string[] {
  return normalizePaths([...staticStageIO()[stage].outputs, ...dynamicOutputs(stage)]);
}

export function safeReadDir(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

export function readPipeline(): Pipeline {
  const pipelinePath = getPipelinePath();
  if (!existsSync(pipelinePath)) {
    return emptyPipeline();
  }
  try {
    return migratePipeline(JSON.parse(readFileSync(pipelinePath, "utf8")));
  } catch {
    return emptyPipeline();
  }
}

export function emptyPipeline(): Pipeline {
  return { version: 1, revision: 0, stages: {} };
}

export function migratePipeline(raw: unknown): Pipeline {
  if (!raw || typeof raw !== "object") return emptyPipeline();
  const data = raw as Record<string, unknown>;
  if (data.stages) {
    return {
      version: 1,
      revision: typeof data.revision === "number" ? data.revision : 0,
      currentStage: typeof data.currentStage === "string" ? data.currentStage : undefined,
      stages: data.stages as Record<string, SkillState>,
    };
  }
  if (!data.skills || typeof data.skills !== "object") return emptyPipeline();
  const legacy = data.skills as Record<string, any>;
  const stages: Record<string, SkillState> = {};
  for (const stage of Object.keys(legacy)) {
    const state = legacy[stage];
    stages[stage] = {
      status: state?.status === "none" ? "missing" : state?.status || "missing",
      revision: 0,
      at: state?.at,
      outputs: state?.output,
      hash: state?.hash,
      staleReason: state?.staleReason,
    };
  }
  return { version: 1, revision: 0, stages };
}

function writePipeline(pipeline: Pipeline): void {
  const pipelinePath = getPipelinePath();
  mkdirSync(dirname(pipelinePath), { recursive: true });
  pipeline.currentStage = computeCurrentStage(pipeline);
  writeFileSync(pipelinePath, JSON.stringify(pipeline, null, 2) + "\n");
}

export function computeCurrentStage(pipeline: Pipeline): string | undefined {
  return STAGES.find((stage) => {
    const status = pipeline.stages[stage]?.status || "missing";
    return status !== "done";
  });
}

export function parseListFlag(args: string[], flag: "--inputs" | "--outputs"): string[] {
  const index = args.indexOf(flag);
  if (index === -1 || !args[index + 1]) return [];
  return args[index + 1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function fileHash(path: string): string {
  try {
    return String(statSync(path).mtimeMs);
  } catch {
    return "";
  }
}

export function hashFiles(files: string[]): string {
  return files.map((file) => `${file}:${fileHash(file)}`).join("|");
}

export function stageInputs(pipeline: Pipeline, stage: StageName): string[] {
  return normalizePaths(pipeline.stages[stage]?.inputs || defaultInputs(stage));
}

export function stageOutputs(pipeline: Pipeline, stage: StageName): string[] {
  return normalizePaths(pipeline.stages[stage]?.outputs || defaultOutputs(stage));
}

export function getDownstream(stage: StageName): StageName[] {
  const direct = DEPENDENCY_GRAPH[stage];
  const nested = direct.flatMap(getDownstream);
  return [...new Set([...direct, ...nested])];
}

export function shouldInvalidate(outputs: string[], inputs: string[]): boolean {
  return outputs.some((output) => inputs.includes(output));
}

export function markStageStale(
  state: SkillState | undefined,
  revision: number,
  staleBy: string,
  staleReason: string,
): SkillState | undefined {
  if (!state || state.status !== "done" || state.revision >= revision) return state;
  return { ...state, status: "stale", staleBy, staleReason };
}

export function markDownstream(pipeline: Pipeline, stage: StageName, outputs: string[]): void {
  const revision = pipeline.revision;
  for (const downstream of getDownstream(stage)) {
    const inputs = stageInputs(pipeline, downstream);
    if (!shouldInvalidate(outputs, inputs)) continue;
    const staleReason = `${stage} updated inputs consumed by ${downstream}`;
    const updated = markStageStale(
      pipeline.stages[downstream],
      revision,
      stage,
      staleReason,
    );
    if (updated) {
      pipeline.stages[downstream] = updated;
    }
  }
}

export function markDone(stage: StageName, args: string[]): void {
  const pipeline = readPipeline();
  const revision = pipeline.revision + 1;
  const inputs = normalizePaths(parseListFlag(args, "--inputs"));
  const outputs = normalizePaths(parseListFlag(args, "--outputs"));
  const finalInputs = inputs.length ? inputs : defaultInputs(stage);
  const finalOutputs = outputs.length ? outputs : defaultOutputs(stage);

  pipeline.revision = revision;
  pipeline.stages[stage] = {
    status: "done",
    revision,
    at: new Date().toISOString(),
    inputs: finalInputs,
    outputs: finalOutputs,
    hash: hashFiles(finalOutputs),
  };

  markDownstream(pipeline, stage, finalOutputs);
  writePipeline(pipeline);
}

export function mtimeMs(file: string): number {
  try {
    return statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}

export function changedInputs(state: SkillState, inputs: string[]): string[] {
  const lastRun = state.at ? new Date(state.at).getTime() : 0;
  return inputs.filter((file) => mtimeMs(file) > lastRun);
}

export function findStaleBy(pipeline: Pipeline, changed: string[]): string | undefined {
  for (const stage of STAGES) {
    const outputs = stageOutputs(pipeline, stage);
    if (outputs.some((file) => changed.includes(file))) return stage;
  }
  return undefined;
}

export function checkStale(): void {
  const pipeline = readPipeline();
  const stale: Array<{ stage: string; staleBy?: string; reason: string }> = [];
  let dirty = false;

  for (const stage of STAGES) {
    const state = pipeline.stages[stage];
    if (!state || state.status !== "done") continue;
    const changed = changedInputs(state, stageInputs(pipeline, stage));
    if (!changed.length) continue;
    dirty = true;
    const staleBy = findStaleBy(pipeline, changed);
    const reason = `Inputs changed since last ${stage} run`;
    pipeline.stages[stage] = { ...state, status: "stale", staleBy, staleReason: reason };
    stale.push({ stage, staleBy, reason });
  }

  if (dirty) {
    writePipeline(pipeline);
  }
  console.log(JSON.stringify(stale, null, 2));
}

export function rebuild(): void {
  const pipeline = emptyPipeline();
  for (const stage of STAGES) {
    const outputs = defaultOutputs(stage);
    const hasOutput = outputs.some((file) => existsSync(file));
    pipeline.stages[stage] = {
      status: hasOutput ? "done" : "missing",
      revision: 0,
      inputs: defaultInputs(stage),
      outputs,
      hash: hasOutput ? hashFiles(outputs) : "",
    };
  }
  writePipeline(pipeline);
}

export function printStatus(stage: StageName): void {
  console.log(readPipeline().stages[stage]?.status || "missing");
}

export function runCli(): void {
  const [cmd, stage, ...rest] = process.argv.slice(2);
  if (cmd === "read") return console.log(JSON.stringify(readPipeline(), null, 2));
  if (cmd === "check-stale") return checkStale();
  if (cmd === "rebuild") {
    rebuild();
    return console.log("Pipeline rebuilt from filesystem");
  }
  if (cmd === "done") {
    if (!isStage(stage)) exitWith("Usage: pipeline.ts done <skill> [--inputs a,b] [--outputs c,d]");
    markDone(stage, rest);
    return console.log(`${stage}: done`);
  }
  if (cmd === "status") {
    if (!isStage(stage)) exitWith("Usage: pipeline.ts status <skill>");
    return printStatus(stage);
  }
  exitWith("Usage: pipeline.ts <read|done|status|rebuild|check-stale> [skill]");
}

export function isStage(value?: string): value is StageName {
  return !!value && STAGES.includes(value as StageName);
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return !!entry && resolve(entry) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  runCli();
}
