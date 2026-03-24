/**
 * 触发准确率测试：模拟 Claude 的技能匹配逻辑
 * 用关键词匹配 description 中的触发词，评估每个 query 会触发哪个技能
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/* ─── 读取技能 description ─── */

interface SkillDef {
  name: string;
  keywords: string[];
}

function extractDescription(path: string): string {
  const content = readFileSync(resolve(path), "utf-8");
  const match = content.match(/description:\s*\|\n([\s\S]*?)---/);
  return match ? match[1].toLowerCase() : "";
}

const skills: SkillDef[] = [
  { name: "codeck", keywords: [] },
  { name: "codeck-outline", keywords: [] },
  { name: "codeck-design", keywords: [] },
  { name: "codeck-review", keywords: [] },
  { name: "codeck-speech", keywords: [] },
  { name: "codeck-export", keywords: [] },
];

const skillPaths: Record<string, string> = {
  "codeck": "skills/codeck/SKILL.md",
  "codeck-outline": "skills/codeck-outline/SKILL.md",
  "codeck-design": "skills/codeck-design/SKILL.md",
  "codeck-review": "skills/codeck-review/SKILL.md",
  "codeck-speech": "skills/codeck-speech/SKILL.md",
  "codeck-export": "skills/codeck-export/SKILL.md",
};

/* 从 description 提取引号内的触发词 + 关键短语 */
for (const skill of skills) {
  const desc = extractDescription(skillPaths[skill.name]);
  /* 提取引号内的词 */
  const quoted = [...desc.matchAll(/"([^"]+)"/g)].map(m => m[1].toLowerCase());
  /* 提取 "or wants to ..." 后面的短语 */
  const wantsMatch = desc.match(/or wants to ([^—.]+)/);
  const wants = wantsMatch ? wantsMatch[1].trim().split(/\s+/) : [];
  /* 提取其他关键词 */
  const extraWords = desc
    .replace(/use whenever.*$/s, "")
    .split(/[\s,.()|]+/)
    .filter(w => w.length > 2)
    .filter(w => !["the", "and", "for", "with", "from"].includes(w));
  skill.keywords = [...new Set([...quoted, ...wants, ...extraWords])];
}

/* ─── 读取 trigger_evals ─── */

const evals = JSON.parse(readFileSync(resolve("skills/evals/evals.json"), "utf-8"));
const triggerEvals = evals.trigger_evals as Array<{
  query: string;
  should_trigger: string | null;
  reason: string;
}>;

/* ─── 匹配逻辑 ─── */

function matchSkill(query: string): string | null {
  const q = query.toLowerCase();
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const skill of skills) {
    let score = 0;
    for (const kw of skill.keywords) {
      if (q.includes(kw)) {
        score += kw.length; /* 更长的匹配权重更高 */
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = skill.name;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

/* ─── 执行测试 ─── */

let pass = 0;
let fail = 0;
const results: string[] = [];

for (const te of triggerEvals) {
  const actual = matchSkill(te.query);
  const expected = te.should_trigger;
  const ok = actual === expected;
  if (ok) pass++;
  else fail++;
  const icon = ok ? "✓" : "✗";
  results.push(`${icon} "${te.query}" → expected: ${expected ?? "none"}, got: ${actual ?? "none"}${ok ? "" : " ← MISS"}`);
}

console.log("=== 触发准确率测试 ===\n");
for (const r of results) console.log(r);
console.log(`\n总计: ${pass + fail} | 通过: ${pass} | 失败: ${fail} | 准确率: ${((pass / (pass + fail)) * 100).toFixed(0)}%`);
