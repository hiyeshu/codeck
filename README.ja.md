<div align="center">

# codeck

**skill は channel。codeck は deck room。**

[Live demo →](https://codeck.sh/codeck-intro)

[English](README.md) | [简体中文](README.zh.md) | [繁體中文](README.zh-TW.md) | 日本語 | [한국어](README.ko.md)

</div>

フォルダにメモ、ドキュメント、データ、画像がある。プレゼンを作りたい。`/codeck` と打つ。

codeck は永続的な deck room を開く。各 codeck skill は、その room に channel として入る。outline、design、review、speech、export。

channel にはアドレス、書き込み境界、room files、handoff がある。room は現在の deck state を `~/.codeck/projects/{slug}/` に保持するので、chat memory に頼らず次の実行でも続きから作業できる。

出力は単一の HTML ファイル。テンプレートなし。スライドタイプの制約なし。各ページは自由な HTML で構成される。AI はあなたのコンテンツに必要などんな視覚表現でも発明できる。

## 使い方

`/codeck` が room を開き、プロジェクトを読む。outline channel がストーリーを形にする。design channel がストーリーに視覚形式を与える。review channel が最も手厳しい聴衆のように問い返す。speech と export channel が発表と配布を準備する。

handoff は chat history ではなく room に残る。

## 3つのアイデア

**skill は channel。** codeck は、チームのふりをした長い prompt ではない。各 skill は room の中に 1 つの channel を持つ。何を受け取り、何を書き、誰へ handoff するかが決まっている。

**同型写像。** デザインの前に、codeck はコンテンツの*形式構造*を分析する。テンションカーブ、情報密度、感情のアーク。そして別の領域から構造的に対応するものを見つける。楽曲、絵画様式、建築原理。スライドはあなたの議論を*格納する*だけでなく、議論と*同じ形をしている*。（ホフスタッター『ゲーデル、エッシャー、バッハ』に触発。）

**スキーマの天井がない。** 多くのスライドツールはブロックタイプの語彙を与える——タイトル、箇条書き、画像、引用。codeck は AI に自由な HTML を渡す。コンテンツがまだ名前のない視覚形式を必要とするなら、AI がそれを発明する。

## インストール

[Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Cursor](https://cursor.com)、[Codex](https://openai.com/codex)、[その他 40 以上のエージェント](https://skills.sh)に対応。

```bash
npx skills add hiyeshu/codeck
```

`/codeck` と打てば始まる。

## HTML ファイル

出力は自己完結型の HTML ファイル。ブラウザで開くだけ。サーバーもビルドツールも不要。

### キーボードショートカット

| キー | 操作 |
|------|------|
| `→` `↓` `Space` `Enter` | 次のステップ（フラグメントまたはスライド） |
| `←` `↑` `Backspace` | 前のステップ |
| `Esc` | オーバービュー |
| `F` | フルスクリーン |
| `P` | プレゼンターモード |

タッチ：左右スワイプで操作。フローティングツールバーはデスクトップではホバーで表示、モバイルでは常時表示。

### プレゼンターモード

`P` を押すとプレゼンターウィンドウが開く：

- **現在のスライド** — 現在のフラグメントステップの大きなプレビュー
- **次のプレビュー** — 次のフラグメントまたは次のスライド
- **スピーカーノート** — スクロール可能、ズーム対応（`+` / `-`）
- **タイマー** — 初回ナビゲーションで自動開始、クリックで一時停止、ダブルクリックでリセット
- **テーマ切替** — ツールバー・オーバービュー・プレゼンターパネルのライト/ダークを一括切替

プレゼンターウィンドウは BroadcastChannel でメインウィンドウと同期。どちらからでも操作可能。

### オーバービューモード

`Esc` で全スライドのサムネイルグリッドを表示。クリックでジャンプ。

## License

MIT
