<div align="center">

# codeck

**一個 skill 是一個 channel。codeck 是一個 deck room。**

[線上演示 →](https://codeck.sh/codeck-intro)

[English](README.md) | [简体中文](README.zh.md) | 繁體中文 | [日本語](README.ja.md) | [한국어](README.ko.md)

</div>

你有一個資料夾，裡面是筆記、文件、資料、圖片。你想做一套簡報。你輸入 `/codeck`。

codeck 打開一個持久的 deck room。每個 codeck skill 都作為一個 channel 進入這個 room：outline、design、review、speech、export。

channel 有地址、寫入邊界、房間檔案和 handoff。room 把當前 deck 狀態保存在 `~/.codeck/projects/{slug}/`，所以跨執行繼續工作，不依賴聊天記憶。

產出是一個 HTML 檔案。沒有模板。沒有固定的投影片類型。每頁自由 HTML——AI 可以為你的內容發明任何視覺形式。

## 怎麼用

`/codeck` 打開 room 並讀取專案。outline channel 組織故事，design channel 賦予視覺形式，review channel 像最難搞的聽眾一樣追問。speech 和 export channel 準備交付。

handoff 留在 room 裡，不靠聊天歷史。

## 三個想法

**一個 skill 是一個 channel。** codeck 不是一個超長 prompt 假裝成團隊。每個 skill 在 room 裡擁有一個 channel：它回應什麼、寫什麼、交給誰。

**同構映射。** 設計之前，codeck 分析你內容的*形式結構*——張力曲線、資訊密度、情緒弧線。然後從另一個領域找到結構上的對應：一首樂曲、一種繪畫風格、一個建築原則。你的投影片不只是*裝著*你的論證——它們*長得像*你的論證。（受侯世達《乙乙乙》啟發。）

**沒有 schema 天花板。** 大多數投影片工具給你一套積木：標題、要點、圖片、引言。codeck 給 AI 自由 HTML。如果你的內容需要一種還沒有名字的視覺形式，AI 可以發明它。

## 安裝

支援 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Cursor](https://cursor.com)、[Codex](https://openai.com/codex) 及 [40+ 其他 agent](https://skills.sh)。

```bash
npx skills add hiyeshu/codeck
```

輸入 `/codeck` 開始。

## HTML 檔案

產出是一個自包含的 HTML 檔案。任何瀏覽器開啟即用，不需要伺服器或建置工具。

### 快捷鍵

| 按鍵 | 功能 |
|------|------|
| `→` `↓` `Space` `Enter` | 下一步（片段或頁） |
| `←` `↑` `Backspace` | 上一步 |
| `Esc` | 總覽檢視 |
| `F` | 全螢幕 |
| `P` | 演講者模式 |

觸控螢幕：左右滑動翻頁。底部浮動工具列桌面端懸停顯示，行動裝置端常駐。

### 演講者模式

按 `P` 開啟演講者視窗：

- **當前頁** — 大預覽，顯示當前片段步驟
- **下一步預覽** — 下一個片段或下一頁
- **演講筆記** — 可捲動，支援縮放（`+` / `-`）
- **計時器** — 首次翻頁自動開始，點擊暫停，雙擊歸零
- **主題切換** — 一鍵切換所有 UI 元素（工具列、總覽、演講面板）的明暗模式

演講者視窗透過 BroadcastChannel 與主視窗同步，兩邊都能翻頁。

### 總覽模式

按 `Esc` 顯示全部頁面的縮圖網格，點擊跳轉。

## License

MIT
