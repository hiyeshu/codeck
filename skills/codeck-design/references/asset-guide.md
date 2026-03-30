# Asset References Guide

outline.md asset list marks each resource's level:

## inline
Images use `assets/` path (assemble.sh auto-base64). SVG inline directly.
```html
<img src="assets/architecture.png" alt="System architecture" style="max-width:80%">
<svg viewBox="0 0 100 100">...</svg>
```

## poster
Video/audio/large files use cover image + play placeholder.
```html
<div class="media-poster">
  <img src="assets/demo-cover.jpg" alt="Demo video">
  <div class="play-icon">&#9654;</div>
  <p class="caption">demo.mp4</p>
</div>
```
Add `.media-poster` styles in custom.css (centered, rounded, semi-transparent play icon overlay).

## extract
Code uses `<pre><code>`, data uses tables or CSS charts.
```html
<pre><code class="lang-typescript">function resolve(state: State): Action {
  return state.match(patterns);
}</code></pre>

<div class="bar" style="--val:85%">Conversion rate 85%</div>
```
