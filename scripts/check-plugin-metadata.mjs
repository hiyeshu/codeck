// check-plugin-metadata.mjs — 发布工具，非 skill 运行时。
//
// [INPUT]: 依赖 .claude-plugin/{plugin,marketplace}.json、.codex-plugin/plugin.json、
//          .agents/plugins/marketplace.json、skills/*/SKILL.md frontmatter
// [OUTPUT]: 四份清单 + skill frontmatter 的一致性断言；不一致时非零退出
// [POS]: scripts/ 的唯一成员，CI 与本地发布前的守门人
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const SEMVER = /^\d+\.\d+\.\d+$/;

const claudePlugin = readJson(".claude-plugin/plugin.json");
const claudeMarket = readJson(".claude-plugin/marketplace.json");
const codexPlugin = readJson(".codex-plugin/plugin.json");
const agentsMarket = readJson(".agents/plugins/marketplace.json");

// ── 两份 plugin.json 必须逐字段一致 ──────────────────────────────
for (const [label, p] of [["claude", claudePlugin], ["codex", codexPlugin]]) {
  assert.equal(p.name, "codeck", `${label} plugin.json name`);
  assert.match(p.version, SEMVER, `${label} plugin.json version semver`);
  assert.equal(p.license, "MIT", `${label} plugin.json license`);
  assert.equal(p.repository, "https://github.com/hiyeshu/codeck", `${label} plugin.json repository`);
  assert.equal(p.skills, "./skills/", `${label} plugin.json skills path`);
}
assert.equal(claudePlugin.version, codexPlugin.version, "bundle version must match across plugin.json files");

// ── Claude marketplace：自指 source ─────────────────────────────
assert.equal(claudeMarket.name, "codeck", "claude marketplace name");
assert.ok(claudeMarket.owner?.name, "claude marketplace owner.name");
const claudeEntry = (claudeMarket.plugins ?? []).find((p) => p.name === "codeck");
assert.ok(claudeEntry, "claude marketplace must list plugin 'codeck'");
assert.ok(["./", "."].includes(claudeEntry.source), "claude marketplace source must be self ('./')");

// ── Agents marketplace：cowart 式 local 自指 ────────────────────
assert.equal(agentsMarket.name, "codeck-github", "agents marketplace name");
const agentsEntry = (agentsMarket.plugins ?? []).find((p) => p.name === "codeck");
assert.ok(agentsEntry, "agents marketplace must list plugin 'codeck'");
assert.equal(agentsEntry.source?.source, "local", "agents marketplace source.source");
assert.ok(["./", "."].includes(agentsEntry.source?.path), "agents marketplace source.path must be self");
assert.equal(agentsEntry.policy?.installation, "AVAILABLE", "agents marketplace policy.installation");
assert.equal(agentsEntry.policy?.authentication, "ON_INSTALL", "agents marketplace policy.authentication");
assert.equal(agentsEntry.category, codexPlugin.interface?.category, "agents category must match codex interface.category");

// ── skill frontmatter：name 与目录一致，version 为严格 semver ───
const skillsDir = join(root, "skills");
const skillDirs = readdirSync(skillsDir).filter((d) => {
  try {
    return statSync(join(skillsDir, d, "SKILL.md")).isFile();
  } catch {
    return false;
  }
});
assert.ok(skillDirs.length >= 6, `expected >= 6 skills, found ${skillDirs.length}`);
for (const dir of skillDirs) {
  const text = readFileSync(join(skillsDir, dir, "SKILL.md"), "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(fm, `${dir}/SKILL.md must open with YAML frontmatter`);
  const name = fm[1].match(/^name:\s*(\S+)\s*$/m)?.[1];
  const version = fm[1].match(/^version:\s*(\S+)\s*$/m)?.[1];
  assert.equal(name, dir, `${dir}/SKILL.md frontmatter name must match directory`);
  assert.match(version ?? "", SEMVER, `${dir}/SKILL.md frontmatter version semver`);

  // 硬编码安装路径不得复活：唯一合法出现是统一 bootstrap 探测列表内的兜底项
  for (const line of text.split("\n")) {
    if (/\$HOME\/\.(claude|codex|agents)\/skills\//.test(line)) {
      assert.ok(
        /^\s*"\$HOME\/\.(agents|codex|claude)\/skills\/codeck(-\w+)?"( \\)?;? do$|^\s*"\$HOME\/\.(agents|codex|claude)\/skills\/codeck(-\w+)?"/.test(line.trim()),
        `${dir}/SKILL.md hard-codes an install path outside the probe list: ${line.trim()}`
      );
    }
  }
}

console.log(`codeck plugin metadata OK (${claudePlugin.version}, ${skillDirs.length} skills)`);
