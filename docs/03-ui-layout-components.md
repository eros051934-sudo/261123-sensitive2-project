# 03. 화면 구성 · 컴포넌트 (UI 구현 지침 ②)

> 값은 `02-design-system.md`의 CSS 변수만 씁니다. 화면 문구는 `04-content-questions.md`가 정본입니다.
> 아래 **HTML 구조(id, class)는 정본**입니다. 바꾸려면 먼저 질문합니다.

---

## 1. 화면(뷰) 6개

페이지는 `public/index.html` 1개이고, 그 안의 `<section>` 6개 중 **항상 하나만** 보입니다 (`hidden` 속성으로 전환).

| 뷰 id | 이름 | 폭 |
|---|---|---|
| `#view-intro` | 시작 | 좁은 칸 (`--narrow-max` 640px, 가운데) |
| `#view-quiz` | 질문 (7단계) | 좁은 칸 |
| `#view-loading` | 로딩 | 좁은 칸 |
| `#view-error` | 오류 (첫 추천 실패 시) | 좁은 칸 |
| `#view-result` | 결과 | 넓은 칸 (`--container-max` 1280px) |
| `#view-plan` | 계획 | 좁은 칸 |

공통: 헤더(64px) → `main` → 푸터(항상 밝게). 시작·질문·로딩·오류·결과는 **어두운 테마**, 계획은 **밝은 테마** (`02` 문서 1장).

---

## 2. 와이어프레임

### 2-1. 질문 화면 (모든 너비 공통, 640px 칸)
```
┌──────────────────────────────────────┐
│ [4 / 11]  ██████░░░░░░░░░░░░░░        │ ← 단계 알약 + 진행 막대(노랑)
│ 주변에서 자주 듣는 말에 가장 가까운 건?    │ ← heading-lg
│ 딱 맞지 않아도 괜찮아요. …              │ ← caption
│ [꼼꼼하고 정리를 잘한다            ✓]   │ ← 칩: 한 줄에 하나, 너비 꽉 채움
│ [아이디어가 많고 새롭다              ]   │
│ …                                     │   (몰입 순간 질문만 2줄 타일, 768px 이상 2열)
│                    ( 이전 ) (  다음  )   │
└──────────────────────────────────────┘
```

### 2-2. 결과 화면 — 768px 이상 (Binance 메인 패널 + 사이드 레일)
```
 나에게 맞는 방향을 찾았어요
┌ 마음 건강 안내 (조건부, 전체 폭) ──────────────────────────────┐
┌───────────────────────────────────┐ ┌──────────────────────┐
│▌나에게 맞는 방향 (노랑 왼쪽 띠)        │ │▔ 유형 카드 (노랑 윗띠)  │
│ 왜 이 방향인지 2~3문장 …              │ │ [나의 잠재력 나침반]    │
│ 눈여겨볼 분야                         │ │ 구조를 세우는 …(노랑)  │
│ [서비스 기획][콘텐츠 기획][데이터 분석] │ │ 한 줄 설명 …          │
└───────────────────────────────────┘ │ #구조화 #실행력 …      │
┌───────────────────────────────────┐ └──────────────────────┘
│ [진로 탐색] [네트워킹·…] [가벼운 첫 걸음]│ ┌──────────────────────┐
│ 관심 직무 1:1 커피챗 인터뷰            │ │ [다른 방향 추천 받기]   │
│ 시작 예상 비용  3만 원 이하(노랑)       │ │ (진단 결과 복사하기)    │
│ 추천 이유 …                          │ │ (처음부터 다시)        │
│ ▌해보면 알 수 있는 것 …               │ └──────────────────────┘
│ ┌ 오늘의 첫 걸음 (10분) ──────────┐   │
│ └──────────────────────────────┘   │
│ 팁 · …                              │
│ (▼ 별로예요|▲ 끌려요) [이걸로 시도해볼래요]│
└───────────────────────────────────┘
  … 카드 2, 카드 3
```
- 768px 미만: 위에서 아래로 **유형 카드 → 방향 카드 → 추천 카드 3개 → 버튼 묶음** 1열.
- 구현: `.result-layout`은 모바일에서 세로 flex(간격 `--space-sm`). 768px 이상에서 `display: grid; grid-template-columns: minmax(0, 1fr) var(--sidebar-width);` 그리고:
  - `#type-card`: `grid-column: 2; grid-row: 1;`
  - `#result-actions`: `grid-column: 2; grid-row: 2;`
  - `.result-feed`(방향 카드 + 추천 카드 목록): `grid-column: 1; grid-row: 1 / span 3;` 세로 flex 간격 `--space-md`
  - `grid-template-rows: auto auto 1fr; gap: var(--space-lg); align-items: start;`

### 2-3. 계획 화면 (밝은 테마, 640px 칸)
```
← 다른 방향 보기
{활동 이름}, 이렇게 시작해요
완벽한 확신보다, 일단 오늘 10분의 …
┌▌이 경험으로 확인할 것 ─────────────┐
│ {discover}                        │
└───────────────────────────────────┘
┌ 실천 3단계 로드맵 ─────────────────┐
│ [□ 오늘 (10분) …] [□ 이번 주 …] [□ 2주 안 …] │
│ ┊→ 잘 맞는다면, 그다음엔  {nextIf}  ┊│ ← 점선 상자
│ 팁 · … / 체크 표시는 저장되지 않아요. │
└───────────────────────────────────┘
┌ 언제 첫 발을 내딛을까요? … 캘린더 버튼 ┐
┌ 실행 계획 복사하기 ─────────────────┐
```

---

## 3. HTML 구조 (`public/index.html`)

아래가 `public/index.html` 전체입니다. `id`와 `js-*` 클래스는 `app.js`가 찾으므로 바꾸지 않습니다 (`AGENTS.md` X-12).

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>해볼까 — 내가 좋아하는 것과 다음 방향을 찾는 2분</title>
  <meta name="description" content="취미든 앞으로의 일이든, 내가 뭘 좋아하는지 아직 모르겠는 사람을 위한 2분 자기 탐색. 나에게 맞는 방향과 직접 해볼 경험 3가지를 알려드려요.">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/style.css">
  <script type="module" src="/js/app.js"></script>
</head>
<body data-theme="dark">
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="logo" href="/" aria-label="해볼까 처음으로">
        <span class="logo__mark" aria-hidden="true">?</span>
        <span class="logo__text">해볼까</span>
      </a>
      <span class="site-header__tag">나만의 방향을 찾는 2분</span>
    </div>
  </header>

  <main class="container">
    <!-- 1. 시작 -->
    <section id="view-intro" class="view view--narrow" aria-labelledby="intro-title">
      <h1 id="intro-title" class="intro__title" tabindex="-1">내가 뭘 좋아하는지, 앞으로 뭘 해야 할지 아직 모르겠다면</h1>
      <p class="intro__lead">괜찮아요, 처음부터 답을 아는 사람은 없어요. 2분 질문으로 나를 알아본 뒤, 취미든 진로든 지금 나에게 맞는 방향과 그 방향을 직접 확인해 볼 경험 3가지, 그리고 어떻게 시작하면 되는지까지 알려드릴게요.</p>
      <ol class="card intro-steps">
        <li><strong>2분 동안 나를 알아보기</strong> 몰입하는 순간, 자주 듣는 강점, 금방 지치는 상황을 골라요.</li>
        <li><strong>나에게 맞는 방향 설명</strong> 왜 이 방향인지, 눈여겨볼 분야는 무엇인지 알려드려요.</li>
        <li><strong>경험으로 확인하기</strong> 추천 경험의 첫 걸음을 캘린더에 넣고, 잘 맞으면 다음 단계로 넘어가요.</li>
      </ol>
      <button id="start-button" type="button" class="btn btn--primary btn--pill btn--block">2분 만에 내 방향 찾아보기</button>
      <p class="caption">답변은 저장되지 않으며, 맞춤 추천을 위해 OpenAI로 전송돼요.</p>
    </section>

    <!-- 2. 질문 -->
    <section id="view-quiz" class="view view--narrow" aria-labelledby="quiz-title" hidden>
      <form id="quiz-form" class="card quiz" novalidate>
        <div class="quiz__top">
          <span id="quiz-step" class="step-pill">1 / 11</span>
          <div id="quiz-progress" class="progress" role="progressbar" aria-label="질문 진행" aria-valuemin="1" aria-valuemax="11" aria-valuenow="1">
            <span id="quiz-progress-fill" class="progress__fill"></span>
          </div>
        </div>
        <fieldset class="quiz__fieldset">
          <legend><h2 id="quiz-title" class="quiz__title" tabindex="-1"></h2></legend>
          <p id="quiz-hint" class="caption"></p>
          <div id="quiz-options" class="options"></div>
          <div id="quiz-note-field" class="note-field" hidden>
            <textarea id="quiz-note" class="textarea" rows="4" aria-labelledby="quiz-title" aria-describedby="quiz-hint note-count note-error"></textarea>
            <p id="note-count" class="counter">0 / 300자</p>
            <p id="note-error" class="field-error" hidden></p>
          </div>
        </fieldset>
        <div class="actions">
          <button id="quiz-prev" type="button" class="btn btn--secondary">이전</button>
          <button id="quiz-next" type="submit" class="btn btn--primary">다음</button>
        </div>
      </form>
    </section>

    <!-- 3. 로딩 -->
    <section id="view-loading" class="view view--narrow" aria-labelledby="loading-title" hidden>
      <div class="card loading">
        <span class="spinner spinner--lg" aria-hidden="true"></span>
        <h2 id="loading-title" class="loading__title" tabindex="-1">나에게 맞는 방향을 찾고 있어요…</h2>
        <p id="loading-message" class="loading__message"></p>
      </div>
    </section>

    <!-- 4. 오류 (첫 추천 실패) -->
    <section id="view-error" class="view view--narrow" aria-labelledby="error-title" hidden>
      <div class="error-banner" role="alert">
        <span class="error-banner__icon" aria-hidden="true">!</span>
        <div>
          <h2 id="error-title" class="error-banner__title" tabindex="-1">추천을 만들지 못했어요</h2>
          <p id="error-message" class="error-banner__message"></p>
        </div>
      </div>
      <div class="actions">
        <button id="error-edit" type="button" class="btn btn--secondary">답변 고치기</button>
        <button id="error-retry" type="button" class="btn btn--primary">다시 시도</button>
      </div>
    </section>

    <!-- 5. 결과 -->
    <section id="view-result" class="view" aria-labelledby="result-title" hidden>
      <h2 id="result-title" class="view__title" tabindex="-1">나에게 맞는 방향을 찾았어요</h2>
      <div id="mock-badge" class="badge badge--filled" hidden>테스트 모드</div>

      <aside id="wellbeing-notice" class="card wellbeing" aria-labelledby="wellbeing-title" hidden>
        <h3 id="wellbeing-title" class="card__title">요즘 많이 지치셨나요?</h3>
        <p>혼자 견디지 않아도 괜찮아요. 자살예방 상담전화 <a href="tel:109">109</a>, 정신건강 위기상담전화 <a href="tel:15770199">1577-0199</a>에서 24시간 이야기를 들어드려요.</p>
      </aside>

      <div class="result-layout">
        <article id="type-card" class="type-card" aria-labelledby="type-name">
          <span class="badge badge--featured">나의 잠재력 나침반</span>
          <h3 id="type-name" class="type-card__name"></h3>
          <p id="type-summary" class="type-card__summary"></p>
          <ul id="type-keywords" class="type-card__keywords"></ul>
        </article>

        <div class="result-feed">
          <section id="direction-card" class="card direction" aria-labelledby="direction-title">
            <h3 id="direction-title" class="card__title">나에게 맞는 방향</h3>
            <p id="direction-text" class="direction__text"></p>
            <div id="direction-fields-wrap" class="direction__fields-wrap">
              <h4 class="direction__subtitle">눈여겨볼 분야</h4>
              <ul id="direction-fields" class="direction__fields"></ul>
            </div>
            <p class="caption">아래 경험 3가지로 이 방향이 나에게 맞는지 하나씩 확인해 봐요.</p>
          </section>
          <p id="more-loading" class="more-loading" hidden><span class="spinner" aria-hidden="true"></span>새로운 방향을 찾고 있어요…</p>
          <div id="result-inline-error" class="error-banner" role="alert" hidden>
            <span class="error-banner__icon" aria-hidden="true">!</span>
            <div>
              <p class="error-banner__title">다른 추천을 가져오지 못했어요</p>
              <p id="result-inline-message" class="error-banner__message"></p>
              <button id="result-retry" type="button" class="btn btn--secondary">다시 시도</button>
            </div>
          </div>
          <ul id="activity-list" class="activity-list"></ul>
        </div>

        <div id="result-actions" class="card result-actions">
          <button id="more-button" type="button" class="btn btn--secondary btn--block">다른 방향 추천 받기</button>
          <button id="copy-result-button" type="button" class="btn btn--secondary btn--block">진단 결과 복사하기</button>
          <button id="restart-button" type="button" class="btn btn--text">처음부터 다시</button>
          <p id="copy-result-status" class="copy-status" aria-live="polite"></p>
        </div>
      </div>

      <!-- 추천 카드 틀 (JS가 복제해서 textContent로 채움) -->
      <template id="activity-template">
        <li class="activity-card" data-vote="none">
          <div class="activity-card__badges">
            <span class="badge badge--featured js-track"></span>
            <span class="badge badge--filled js-category"></span>
            <span class="badge badge--filled js-difficulty"></span>
          </div>
          <h3 class="activity-card__name js-name"></h3>
          <p class="cost"><span class="cost__caption">시작 예상 비용</span> <span class="cost__value js-cost"></span></p>
          <p class="activity-card__reason js-reason"></p>
          <div class="discover">
            <p class="discover__label">해보면 알 수 있는 것</p>
            <p class="discover__text js-discover"></p>
          </div>
          <div class="first-step">
            <p class="first-step__label">오늘의 첫 걸음 (10분)</p>
            <p class="first-step__text js-today"></p>
          </div>
          <p class="activity-card__tip js-tip"></p>
          <div class="activity-card__foot">
            <div class="vote" role="group" aria-label="이 방향, 끌리나요?">
              <button type="button" class="vote__btn vote__btn--down js-vote-down" aria-pressed="false">▼ 별로예요</button>
              <button type="button" class="vote__btn vote__btn--up js-vote-up" aria-pressed="false">▲ 끌려요</button>
            </div>
            <button type="button" class="btn btn--primary js-choose">이걸로 시도해볼래요</button>
          </div>
        </li>
      </template>
    </section>

    <!-- 6. 계획 -->
    <section id="view-plan" class="view view--narrow" aria-labelledby="plan-title" hidden>
      <button id="plan-back" type="button" class="btn btn--text">← 다른 방향 보기</button>
      <h2 id="plan-title" class="view__title" tabindex="-1"></h2>
      <p class="plan__lead">완벽한 확신보다, 일단 오늘 10분의 작은 행동으로 내 마음을 확인해 봐요.</p>

      <div class="card plan-discover">
        <h3 class="card__title">이 경험으로 확인할 것</h3>
        <p id="plan-discover" class="plan-discover__text"></p>
      </div>

      <div class="card">
        <h3 class="card__title">실천 3단계 로드맵</h3>
        <ol id="plan-steps" class="checklist"></ol>
        <div class="next-step">
          <p class="next-step__label">잘 맞는다면, 그다음엔</p>
          <p id="plan-next" class="next-step__text"></p>
        </div>
        <p id="plan-tip" class="activity-card__tip"></p>
        <p class="caption">체크 표시는 저장되지 않아요.</p>
      </div>

      <div class="card">
        <h3 class="card__title">언제 첫 발을 내딛을까요?</h3>
        <div class="datetime">
          <label class="field"><span class="field__label">날짜</span><input id="plan-date" class="input" type="date" aria-describedby="plan-time-error"></label>
          <label class="field"><span class="field__label">시간</span><input id="plan-time" class="input" type="time" step="600" aria-describedby="plan-time-error"></label>
        </div>
        <p id="plan-time-error" class="field-error" hidden></p>
        <div class="plan-actions">
          <button id="ics-button" type="button" class="btn btn--primary btn--pill btn--block">캘린더 파일 받기</button>
          <a id="gcal-link" class="btn btn--secondary btn--block" href="#" target="_blank" rel="noopener noreferrer">Google 캘린더에 추가</a>
        </div>
        <p class="caption">일정에 등록해두면 30분 전에 알림을 받아 작은 도전을 잊지 않고 실천할 수 있어요.</p>
      </div>

      <div class="card">
        <button id="copy-plan-button" type="button" class="btn btn--secondary btn--block">실행 계획 복사하기</button>
        <p id="copy-plan-status" class="copy-status" aria-live="polite"></p>
      </div>
    </section>

    <p id="sr-status" class="visually-hidden" aria-live="polite"></p>
  </main>

  <footer class="site-footer">
    <div class="container">
      <p class="site-footer__text">© 2026 해볼까 · 답변은 서버에 저장되지 않으며, 맞춤 추천을 위해 OpenAI로 전송돼요. 추천 내용은 나를 발견하기 위한 안내 아이디어입니다.</p>
    </div>
  </footer>
</body>
</html>
```

---

## 4. 레이아웃 규칙 (`style.css`)

- `body`: 배경 `--bg-page`, 글자 `--text-main`, `font-family: var(--font-sans)`, 16px/400, 줄 간격 1.5, `word-break: keep-all; overflow-wrap: anywhere;`, 세로 flex로 푸터를 아래에 고정.
- `.container`: `max-width: var(--container-max)`, 가운데, 좌우 여백 `--space-md`(모바일) / `--space-lg`(768px 이상).
- `.view`: 위·아래 여백 `--space-xxl`(결과 화면은 위 `--space-xl`), 세로 flex, 간격 `--space-md`.
- `.view--narrow`: `max-width: var(--narrow-max)`, 가운데 정렬.
- 기준점은 **768px 하나**: `@media (min-width: 768px)`. 360px에서 가로 스크롤이 생기면 안 됨.

---

## 5. 컴포넌트 명세 (Binance 기반)

> 모든 값은 `02` 문서 2-3장의 **테마 토큰**으로 씁니다. 그러면 계획 화면(`data-theme="light"`)에서 자동으로 밝게 바뀝니다.

| 컴포넌트 | 규칙 |
|---|---|
| 테마 전환 | `<body data-theme="dark">`가 기본. JS가 계획 화면에서만 `light`로 바꿈 (`05` 문서 3장). 헤더도 테마를 따라감 |
| 헤더 `.site-header` | Binance `top-nav`. 높이 64px, 배경 `--bg-page`, 아래 1px `--line`. `.logo__mark`: 28px 원(`--radius-pill`), 배경 `--accent`, 글자 `--on-accent` `?` 16px/700. `.logo__text`: 20px/700 `--accent`(어두운 테마) / `--text-strong`(밝은 테마). `.site-header__tag` 14px/500 `--text-sub`, 768px 미만 숨김 |
| 카드 `.card` | 배경 `--bg-card`, 테두리 `--border-card`, 모서리 `--radius-card`, 안쪽 `--space-lg`(24px), **그림자 없음**. `.card__title` 20px/600 `--text-strong` |
| 제목 | `.intro__title` `--text-display-lg`/700 `--text-strong`, 자간 -0.5px. `.view__title`, `.quiz__title`, `.loading__title` 24px/600 `--text-strong`. `tabindex="-1"` 요소는 `outline: none` |
| 본문 | 기본 16px/400 `--text-main`. 보조 문구(`.caption`, 안내) 12~14px `--text-sub` |
| `.intro-steps` | `.card` 안 번호 목록. 번호는 24px 원 `--bg-raised` 배경 + `--accent` 숫자 14px/700(`tabular-nums`). `strong`은 16px/600 `--text-strong` 줄바꿈 |
| 단계 알약 `.step-pill` | 배경 `--bg-raised`, 글자 `--text-sub` 12px/500 `tabular-nums`, `--radius-sm`, 안쪽 4px 8px |
| 진행 막대 `.progress` | 높이 4px, 트랙 `--bg-raised`, `--radius-pill`, `flex: 1`. `.progress__fill` 배경 `--accent`, 너비 JS, `transition: width 0.3s` |
| 선택지 공통 | 실제 `input`(radio/checkbox)은 `.visually-hidden`, `label`이 보이는 버튼. 최소 높이 44px, 배경 `--bg-card`, 테두리 `1px solid var(--field-border)`, 모서리 `--radius-lg`, 글자 `--text-main` 16px/500, 커서 pointer |
| 선택됨 | `input:checked + label`: 테두리 `1px solid var(--accent)`, 배경 `--bg-raised`, 글자 `--text-strong` 600, 오른쪽에 `✓`(`--accent`, CSS `::after`) |
| 포커스·비활성 | `input:focus-visible + label`: `box-shadow: 0 0 0 2px var(--focus-ring)`. `input:disabled + label`: 글자 `--color-muted`, 테두리 `--line`, 커서 `not-allowed`. 타일의 제목·설명 글자도 `--color-muted`로 흐리게 |
| `.option-label--chip` (하나 선택 질문) | 문장형 라벨이라 **한 줄에 하나, 너비 100%**, 안쪽 8px 16px, `justify-content: space-between`(✓가 오른쪽 끝). `.options`(타일 아님)는 세로 flex, 간격 `--space-xs` |
| `.option-label--tile` (몰입 순간 `flow`) | 안쪽 `--space-sm` `--space-md`, 왼쪽 정렬, 2줄: 라벨 16px/600 + 설명 14px/400 `--text-sub`. 768px 이상 2열 grid, 미만 1열 |
| 입력창 `.textarea`, `.input` | 너비 100%, 배경 `--bg-inset`(어두운 테마) / `--bg-card`(밝은 테마), 글자 `--text-main`, 테두리 `1px solid var(--field-border)`, 모서리 `--radius-field`, 안쪽 10px 16px, 높이 40px 이상(`textarea`는 rows 기준). placeholder `--text-sub`. 포커스: 테두리 `--focus-ring` + `box-shadow: 0 0 0 2px var(--focus-ring)`. 오류(`aria-invalid="true"`): 테두리 `--caution` |
| `.counter` | 12px/500 `--text-sub` `tabular-nums`, 오른쪽 정렬. `.counter--over`: `--caution`, 600 |
| `.field-error` | 14px/600 `--text-main`, 앞에 `!` 아이콘(16px 원 `--caution` + `--on-accent` 글자, CSS `::before`) |
| 버튼 `.btn` 공통 | inline-flex 가운데, 높이 40px(최소 터치 44px는 바깥 여백 포함), 안쪽 12px 24px, 모서리 `--radius-md`(6px), 14px/600, 테두리 없음, 밑줄 없음 |
| `.btn--primary` | Binance `button-primary`. 배경 `--accent`, 글자 `--on-accent`. hover·누름: 배경 `--accent-active`. 비활성: 배경 `--accent-disabled`, 글자 `--color-muted` (밝은 테마에서는 배경 `--bg-raised`) |
| `.btn--pill` | `.btn--primary`에 추가. 모서리 `--radius-pill`, 안쪽 14px 32px, 높이 48px. **`#start-button`, `#ics-button` 두 곳에만** |
| `.btn--secondary` | Binance `button-secondary`. 배경 `--bg-raised`, 글자 `--text-strong`. 밝은 테마: 배경 `--bg-card` + 테두리 `1px solid var(--line)`. hover: 글자 `--accent`(어두운 테마만) |
| `.btn--text` | 배경 없음, 글자 `--text-sub`, 안쪽 0, hover 시 `--text-main`. `align-self: flex-start` |
| `.btn--block` | 너비 100% |
| 포커스 (모든 버튼·링크) | `:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--focus-ring); }` |
| `.actions` | 가로 flex, 오른쪽 정렬, 간격 `--space-xs`. 768px 미만: 양쪽 채움, 오른쪽(주) 버튼 `flex: 1` |
| 스피너 | 20px 원, 테두리 2px `--bg-raised`, 윗변 `--accent`, 0.8초 회전. `.spinner--lg` 32px. 동작 줄이기 설정 시 회전 없음 |
| `.loading` | `.card`, 가운데 정렬, 세로 flex 간격 `--space-sm`, 안쪽 `--space-xxl` `--space-lg`. 메시지 16px `--text-sub` |
| 오류 `.error-banner` | 배경 `--bg-raised`, 왼쪽 3px `--caution` 띠, 모서리 `--radius-lg`, 안쪽 `--space-md`, 가로 flex 간격 `--space-sm`. 아이콘 24px 원 `--caution` 배경 + `--on-accent` `!`. 제목 16px/600 `--text-strong`, 메시지 14px/400 `--text-main` |
| 마음 건강 `.wellbeing` | `.card` + 왼쪽 3px `--focus-ring`(info 파랑) 띠. 링크는 `--accent` 600 밑줄 (Binance `text-link`) |
| 유형 카드 `.type-card` ★ | Binance "FUNDS ARE SAFU" 밴드처럼. 배경 `--bg-card`, 모서리 `--radius-xl`, 안쪽 `--space-lg`, 위쪽 4px `--accent` 띠(`border-top`). `.type-card__name` `--text-display-sm`/700 **`--accent`**. 768px 이상 사이드바에서는 28px. `.type-card__summary` 16px/400 `--text-main`. 키워드 `li`: 배경 `--bg-raised`, 글자 `--text-sub` 12px/500, `--radius-sm`, 안쪽 4px 8px, 앞에 `#` |
| `.badge` | 배경 `--bg-raised`, 글자 `--text-sub`, 12px/500, `--radius-sm`, 안쪽 4px 8px. `.badge--featured`(유형 표시): 테두리 `1px solid var(--accent)`, 글자 `--accent`, 배경 없음, `align-self: flex-start` |
| 방향 카드 `.direction` ★ | `.card` + 왼쪽 3px `--accent` 띠. `.direction__text` 16px/400 `--text-main` 줄 간격 1.7. `.direction__subtitle` 14px/600 `--text-sub`. 분야 `.direction__field`: 배경 `--bg-inset`, `--radius-lg`, 안쪽 `--space-sm` `--space-md`; 이름 16px/700 **`--accent`**, 이유 14px `--text-main`. 768px 이상 `repeat(auto-fit, minmax(180px, 1fr))` grid, 미만 1열 |
| 트랙 배지 `.js-track` | `.badge--featured`(노랑 테두리·노랑 글자). 카드 배지 중 맨 앞. 배지 묶음은 줄바꿈 허용 |
| `.discover` | 왼쪽 2px `--accent` 띠, 왼쪽 안쪽 `--space-sm`. 라벨 12px/600 `--accent`, 본문 14px `--text-main` |
| 추천 카드 `.activity-card` | 투표 전에도 왼쪽 3px 투명 띠(투표해도 내용이 밀리지 않게). 배경 `--bg-card`, 모서리 `--radius-xl`, 안쪽 `--space-lg`, 세로 flex 간격 `--space-sm`. 구역 사이 1px `--line` 구분선(비용 아래, 팁 아래). `.activity-card__name` 20px/600 `--text-strong` |
| 비용 `.cost` | Binance `stat-callout`. `.cost__caption` 12px/500 `--text-sub`, `.cost__value` 20px/700 **`--accent`** `tabular-nums` |
| `.first-step` | 배경 `--bg-inset`, `--radius-lg`, 안쪽 `--space-sm` `--space-md`. 라벨 12px/500 `--text-sub`, 본문 16px/400 `--text-main` |
| `.activity-card__tip` | 14px/400 `--text-sub`, 앞에 `팁 · ` (JS). 없으면 `hidden` |
| `.activity-card__foot` | 가로 flex, 양 끝 정렬, 줄바꿈 허용, 간격 `--space-xs`, 위 여백 `--space-xs` |
| 끌림 투표 `.vote` ★ | Binance 상승/하락. 묶음 배경 **`--color-canvas-dark`**(어두운 테마 전용 화면이라 고정), `--radius-pill`, 안쪽 4px, 가로 flex. `.vote__btn`: 높이 36px, 안쪽 0 14px, `--radius-pill`, 배경 없음, 14px/600. `--down` 글자 `--vote-down`, `--up` 글자 `--vote-up` |
| 투표 눌림 | `aria-pressed="true"`: 배경 = 그 색, 글자 **`--on-accent`(검정)**. 흰 글자 금지 |
| 카드 투표 표시 | `[data-vote="hot"]`: 카드 왼쪽 3px `--vote-up` 띠 / `[data-vote="cold"]`: 왼쪽 3px `--vote-down` 띠. 카드를 흐리게 만들지 않음 |
| 결과 버튼 묶음 `.result-actions` | `.card`, 세로 flex 간격 `--space-xs`. 다른 추천 받기·결과 복사하기 = `.btn--secondary`, 처음부터 다시 = `.btn--text` |
| `.copy-status` | 비어 있으면 높이 0. 글자가 있으면 14px/500 `--text-main`, 앞에 `✓`(`--accent`). **초록 쓰지 않음** |
| `.more-loading` | 가로 flex 간격 `--space-xs`, 14px/500 `--text-sub` |
| 체크리스트 `.checklist` (밝은 테마) | Binance `steps-card`. 항목: 배경 `--bg-inset`, `--radius-lg`, 안쪽 `--space-md`. 항목 안은 `label.checklist__label`(가로 flex)로 감싸 글자를 눌러도 체크됨. 체크박스 20px, `accent-color: var(--color-ink)`. 단계 이름 16px/600 `--text-strong`, 내용 16px/400 `--text-main`. 체크하면 내용에 취소선 + `--text-sub` |
| `.plan-discover` (밝은 테마) | `.card` + 왼쪽 3px `--accent-active` 띠. 본문 16px `--text-main` |
| `.next-step` | 1px 점선 `--field-border`, `--radius-lg`, 안쪽 `--space-sm` `--space-md`. 라벨 14px/600 `--text-strong` 앞에 `→`, 본문 14px `--text-main` |
| `.datetime` | 768px 이상 2열 grid, 미만 1열, 간격 `--space-sm`. `.field__label` 14px/600 `--text-strong` |
| `.plan-actions` | 세로 flex, 간격 `--space-xs`. `#gcal-link`는 `.btn--secondary` |
| 푸터 `.site-footer` | **항상 밝게**(Binance `footer-light`). 배경 `--footer-bg`, 글자 `--footer-text` 12px/400, 위 1px `--color-hairline-on-light`, 안쪽 `--space-xl` 0 |
| `.visually-hidden` / `[hidden]` | 표준 clip 패턴 / `display: none !important` |

## 6. 접근성 체크 포인트

| # | 항목 | 구현 |
|---|---|---|
| A-01 | 키보드 | 모든 흐름을 Tab/Shift+Tab/Space/Enter/방향키(라디오)로 진행 가능. `tabindex` 양수 금지 |
| A-02 | 화면 전환 포커스 | 뷰가 바뀌면 그 뷰의 제목(`tabindex="-1"`)으로 포커스 이동 + 맨 위로 스크롤 |
| A-03 | 선택지 | 진짜 `input type="radio"/"checkbox"` + `label` 사용 (div로 흉내 금지). `fieldset` + `legend` |
| A-04 | 투표 | `button` + `aria-pressed` |
| A-05 | 알림 | 결과 도착·복사 완료를 `aria-live`로 알림. 오류는 `role="alert"` |
| A-06 | 색만으로 구분 금지 | 투표는 색 + 글자 + ▲▼, 선택된 선택지는 테두리 + 굵기 + ✓ |
| A-07 | 움직임 | `prefers-reduced-motion: reduce`에서 스피너·진행 막대 전환 없음 |
