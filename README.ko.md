<div align="center">

# codeck

**skill은 channel이다. codeck은 deck room이다.**

[Live demo →](https://codeck.sh/codeck-intro)

[English](README.md) | [简体中文](README.zh.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | 한국어

</div>

폴더에 메모, 문서, 데이터, 이미지가 있다. 프레젠테이션을 만들고 싶다. `/codeck`을 입력한다.

codeck은 지속되는 deck room을 연다. 각 codeck skill은 그 room에 channel로 들어간다: outline, design, review, speech, export.

channel에는 주소, 쓰기 경계, room files, handoff가 있다. room은 현재 deck state를 `~/.codeck/projects/{slug}/`에 보관하므로 chat memory에 의존하지 않고 다음 실행에서도 이어서 작업할 수 있다.

결과물은 하나의 HTML 파일. 템플릿 없음. 슬라이드 타입 제약 없음. 각 페이지는 자유로운 HTML로 구성된다. AI는 당신의 콘텐츠에 필요한 어떤 시각적 형식이든 만들어낼 수 있다.

## 사용법

`/codeck`은 room을 열고 프로젝트를 읽는다. outline channel은 이야기를 잡는다. design channel은 이야기에 시각 형식을 준다. review channel은 가장 까다로운 청중처럼 되묻는다. speech와 export channel은 발표와 배포를 준비한다.

handoff는 chat history가 아니라 room에 남는다.

## 세 가지 아이디어

**skill은 channel이다.** codeck은 팀인 척하는 긴 prompt가 아니다. 각 skill은 room 안에서 하나의 channel을 가진다. 무엇을 듣고, 무엇을 쓰고, 누구에게 handoff할지가 정해져 있다.

**동형 사상.** 디자인 전에 codeck은 콘텐츠의 *형식 구조*를 분석한다. 긴장 곡선, 정보 밀도, 감정 아크. 그리고 다른 영역에서 구조적으로 대응하는 것을 찾는다. 악곡, 회화 양식, 건축 원리. 슬라이드는 당신의 논증을 *담기만* 하는 게 아니라, 논증과 *같은 모양*을 한다. (호프스태터 『괴델, 에셔, 바흐』에서 영감.)

**스키마의 천장이 없다.** 대부분의 슬라이드 도구는 블록 타입 어휘를 준다 — 제목, 글머리 기호, 이미지, 인용. codeck은 AI에게 자유로운 HTML을 건넨다. 콘텐츠가 아직 이름 없는 시각 형식을 필요로 한다면, AI가 그것을 발명한다.

## 설치

### Claude Code (권장)

```
/plugin marketplace add hiyeshu/codeck
/plugin install codeck@codeck
```

`/codeck`을 입력하면 시작된다 (플러그인 네임스페이스에서는 `/codeck:codeck`으로 표시).

### Codex

```bash
codex plugin marketplace add hiyeshu/codeck --ref main
codex plugin add codeck@codeck-github
```

설치 후 새 태스크를 열어 스킬을 로드한 뒤 `/codeck`을 입력한다.

### 기타 에이전트

[Cursor](https://cursor.com) 및 [40개 이상의 에이전트](https://skills.sh) 지원.

```bash
npx skills add hiyeshu/codeck
```

## 로컬 개발 — clone 후 바로 편집

저장소 자체가 마켓플레이스다. 플러그인 source가 저장소 루트를 가리키므로, 로컬 clone이 그대로 편집 가능한 라이브 설치가 된다.

```bash
git clone https://github.com/hiyeshu/codeck && cd codeck
```

- **Claude Code 제자리 로드 (즉시 반영):** `claude --plugin-dir .` —— SKILL.md, engine.css, 참조 문서를 수정한 뒤 `/reload-plugins`.
- **Claude Code 마켓플레이스 경로:** `/plugin marketplace add /path/to/codeck` 후 `/plugin install codeck@codeck`. 이 방식은 플러그인 캐시로 복사되므로, 수정 후 `/plugin marketplace update codeck`과 재설치로 갱신.
- **Codex:** `codex plugin marketplace add /path/to/codeck`, 이어서 `codex plugin add codeck@codeck-github`. 수정 후 `codex plugin marketplace upgrade codeck-github`로 갱신.
- **만능 탈출구 (어떤 런타임이든 항상 라이브):** 스킬이 clone을 직접 가리키게 한다 —— 모든 Setup 블록은 이 세 환경 변수를 최우선으로 읽는다.

  ```bash
  export CODECK_SKILL_DIR=/path/to/codeck/skills/codeck
  export CODECK_DESIGN_DIR=/path/to/codeck/skills/codeck-design
  export CODECK_EXPORT_DIR=/path/to/codeck/skills/codeck-export
  ```

## HTML 파일

결과물은 자체 완결형 HTML 파일. 브라우저에서 바로 열면 된다. 서버나 빌드 도구 불필요.

### 키보드 단축키

| 키 | 동작 |
|----|------|
| `→` `↓` `Space` `Enter` | 다음 단계 (프래그먼트 또는 슬라이드) |
| `←` `↑` `Backspace` | 이전 단계 |
| `Esc` | 오버뷰 |
| `F` | 전체 화면 |
| `P` | 발표자 모드 |

터치: 좌우 스와이프로 탐색. 플로팅 툴바는 데스크톱에서 호버 시 표시, 모바일에서 상시 표시.

### 발표자 모드

`P`를 누르면 발표자 창이 열린다:

- **현재 슬라이드** — 현재 프래그먼트 단계의 큰 미리보기
- **다음 미리보기** — 다음 프래그먼트 또는 다음 슬라이드
- **발표 노트** — 스크롤 가능, 확대/축소 지원 (`+` / `-`)
- **타이머** — 첫 탐색 시 자동 시작, 클릭으로 일시정지, 더블클릭으로 초기화
- **테마 전환** — 툴바, 오버뷰, 발표자 패널의 라이트/다크 일괄 전환

발표자 창은 BroadcastChannel로 메인 창과 동기화. 양쪽에서 모두 조작 가능.

### 오버뷰 모드

`Esc`를 누르면 모든 슬라이드의 썸네일 그리드 표시. 클릭으로 이동.

## License

MIT
