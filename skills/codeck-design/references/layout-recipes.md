<!--
[INPUT]: Depends on deck.md slide purpose, skeleton rhythm, and DESIGN.md layout choices.
[OUTPUT]: Provides named page recipes that guide slides.html structure without copying template code.
[POS]: codeck-design/references visual library; richer than skeleton families, lighter than fixed templates.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Layout Recipes

Use these recipes as page-structure ingredients. They are not templates, class names, or engine code. Pick by rhetorical job, then adapt spacing, tone, media slots, and motion in DESIGN.md.

Record selected recipes in DESIGN.md:

```markdown
## Layout
Layout recipes: cover-signal, proof-stat-tower, process-spine, closing-manifesto
Recipe mapping:
- Slide 1 cover-signal — opens with one promise and one visual anchor.
- Slide 3 proof-stat-tower — makes the core metric unavoidable.
```

## Opening Recipes

| Recipe | Use When | Structure | Guardrail |
|--------|----------|-----------|-----------|
| `cover-signal` | The deck needs a clear promise in the first five seconds. | One title, one subtitle, one anchor mark or image slot, optional source/context foot. | No feature list; no more than two text blocks. |
| `cover-field-note` | The topic is operational, field-tested, or product-in-practice. | Small timestamp/context line, large claim, one artifact-like visual, short note. | Should feel like a dispatch, not a marketing hero. |
| `opening-problem-wall` | The audience already feels pain but lacks structure. | Three to five compact pain fragments around one central question. | Do not solve on this slide; let tension breathe. |
| `opening-quote-cut` | A human sentence is stronger than a thesis. | Large quote, tiny source, one supporting visual or blank space. | Quote must be source-backed or explicitly synthetic. |

## Argument Recipes

| Recipe | Use When | Structure | Guardrail |
|--------|----------|-----------|-----------|
| `statement-slab` | One sentence should dominate the page. | Oversized statement, narrow evidence strip, one accent line. | If it needs three paragraphs, use rowline or explain-panel instead. |
| `proof-stat-tower` | A number is the object. | Label, giant value, one note, optional comparison baseline. | One primary number; secondary numbers stay small. |
| `duo-compare` | Two worlds, versions, or decisions must be contrasted. | Two equal panels, same grammar, one verdict line. | Never compare non-parallel items. |
| `before-after-evidence` | The deck shows transformation. | Before state, after state, changed mechanism in the middle or foot. | Keep before/after visual scale identical. |
| `constraint-wall` | Tradeoffs or requirements define the story. | Grid of constraints, grouped by type, with one highlighted bottleneck. | Avoid tag soup; group into three to five clusters. |
| `myth-fact-split` | Audience has a wrong assumption. | Left myth, right fact, bottom implication. | Fact needs support; don't make it a slogan fight. |
| `evidence-strip` | Several artifacts prove one claim. | Horizontal or vertical strip of screenshots, quotes, logs, or examples. | Each artifact needs a one-line caption. |
| `lens-stack` | Same object needs multiple interpretations. | Repeated object area with stacked lenses: user, system, business, risk. | The object stays stable; only lens changes. |

## Explanation Recipes

| Recipe | Use When | Structure | Guardrail |
|--------|----------|-----------|-----------|
| `process-spine` | The audience must understand sequence. | One visible spine, numbered stages, current stage emphasized. | More than six stages means merge or split. |
| `loop-diagram` | The mechanism is cyclical. | Circular or orbital steps, one input, one output, one feedback note. | Do not fake circularity if the process is linear. |
| `system-map` | Relationships matter more than steps. | Nodes grouped by ownership, edges labeled by exchange, one legend. | No unlabeled arrows. |
| `layer-cake` | The concept builds in layers. | Horizontal stacked layers, each with role and dependency. | Lowest layer must be foundation, not chronology. |
| `exploded-view` | A product or artifact has meaningful parts. | Center object decomposed into named parts around it. | Use for real components, not vague benefits. |
| `decision-tree-lite` | Three or fewer branches matter. | Root question, two to three branches, explicit default path. | More than three branches needs a different slide. |
| `workflow-board` | The story is about work moving through states. | Columns or swimlanes, cards as units of work, status chips. | Use stable card dimensions; no decorative card pile. |

## Product And Demo Recipes

| Recipe | Use When | Structure | Guardrail |
|--------|----------|-----------|-----------|
| `product-frame` | A UI or output needs inspection. | Large product frame, minimal title, callouts pinned to real UI zones. | UI screenshots use contain fit; never blur the evidence. |
| `demo-path` | The audience needs the happy path. | Start state, three to five action beats, final output. | Keep actions concrete; avoid abstract verbs. |
| `capability-matrix` | A product spans several jobs. | Rows are jobs, columns are capabilities or states, one emphasis row. | Matrix must fit without tiny text. |
| `user-day-slice` | A persona journey matters. | Timeline of one user's day, product touchpoints, pain/relief markers. | One persona only. |
| `roadmap-rail` | Future work matters but should not dominate. | Now / next / later rail, one confidence signal per stage. | Keep uncertainty visible. |
| `integration-handoff` | The product connects tools or teams. | Source, transform, destination, responsibility labels. | Don't draw magic arrows; name the contract. |

## Closing Recipes

| Recipe | Use When | Structure | Guardrail |
|--------|----------|-----------|-----------|
| `closing-manifesto` | The deck ends with belief. | One sentence, three supporting clauses, minimal visual anchor. | No recap list. |
| `closing-ask` | The deck needs action. | Specific ask, why now, first step, contact/context line. | Ask must be executable by the audience. |
| `takeaway-stack` | The audience needs memory handles. | Three short takeaways, each with a concrete noun and verb. | Avoid generic "faster/better/easier" phrasing. |
| `open-question` | The deck should leave tension alive. | Large question, one image or blank field, optional next conversation cue. | Use only when no immediate CTA is needed. |

## Recipe Selection Rules

- Pick 4-8 recipes for a normal deck. A 5-slide deck should rarely use more than 5.
- Repeat one recipe intentionally if it creates rhythm; do not rotate recipes mechanically.
- The cover and close should not use the same visual weight unless the argument is circular.
- Prefer `statement-slab` over generic title-body pages when one claim matters.
- Prefer `process-spine`, `system-map`, or `workflow-board` over a bullet list for mechanisms.
- Prefer `product-frame` or `evidence-strip` over decorative imagery when real artifacts exist.
