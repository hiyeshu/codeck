<div align="center">

# codeck

**Turn a folder into a presentation, by talking.**

English | [中文](README.zh.md) | [日本語](README.ja.md)

</div>

You have a folder of notes, docs, data, and images. You want a presentation. You type `/codeck`.

codeck reads your files, figures out what your content is *really about*, then brings in the right people to help — an editor for structure, a designer for visuals, a reviewer who thinks like your toughest audience member. Each "person" is a role derived from your content's specific challenges, not picked from a list.

The result is a single HTML file. No templates. No slide-type vocabulary. Free HTML per slide — the AI can invent any visual form your content needs.

## How it works

```
/codeck          scan materials, diagnose content, recommend roles
    ↓
/codeck-outline  editor structures the narrative, smiths every title
    ↓
/codeck-design   designer finds visual form that mirrors your argument's shape
    ↓
/codeck-review   your toughest listener reviews every slide, fixes directly
    ↓
/codeck-export   PDF / PPTX
/codeck-speech   verbatim script with stage directions
```

## Three ideas

**Roles, not rules.** Instead of hard-coded design guidelines, codeck selects real people — thinkers, designers, editors — whose *way of thinking* matches your content's challenge. Say your argument needs to make the invisible feel obvious: codeck might bring in Feynman. Not because the topic is physics, but because that's what Feynman *does*. The name activates the AI's knowledge of how that person works.

**Isomorphic mapping.** Before designing, codeck analyzes the *formal structure* of your content — its tension curve, information density, emotional arc. Then it finds a structural match from another domain: a piece of music, a painting style, an architectural principle. Your slides don't just *contain* your argument — they *look like* it. (Inspired by Hofstadter's *GEB*.)

**No schema ceiling.** Most slide tools give you a vocabulary of block types — title, bullets, image, quote. codeck gives the AI free HTML. If your content needs a visual form that doesn't have a name yet, the AI can invent it.

## Install

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) + Node.js 18+.

```bash
npx skills add hiyeshu/codeck
```

Type `/codeck` to start.

## License

Apache-2.0
