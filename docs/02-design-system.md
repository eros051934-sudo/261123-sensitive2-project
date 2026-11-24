# 02. 디자인 시스템 (UI 구현 지침 ①)

> 참고 디자인: 사용자가 첨부한 **Binance 디자인 분석 문서**(`DESIGN-binance.md`).
> 이 문서는 그 디자인 언어를 "해볼까"에 맞게 옮긴 **정본**입니다. 색·글꼴·간격 값은 이 문서의 값만 씁니다.

---

## 1. 디자인 방향 — Binance에서 무엇을 가져오고, 무엇을 바꿨나

Binance는 **거의 검정에 가까운 어두운 바탕 + 단 하나의 노랑(#FCD535)** 으로 모든 핵심 행동을 표시하고, 상승은 초록·하락은 빨강으로 방향을 보여줍니다. 또 **둘러보는 화면은 어둡게, 실제로 결제·입금하는 화면은 밝게** 바꿉니다.
해볼까는 이 구조를 그대로 씁니다. **찾는 단계(시작·질문·결과)는 어두운 테마**, **실제로 해보는 단계(계획·캘린더 등록)는 밝은 테마**로 바꿔서 "이제 진짜 시작"이라는 느낌을 줍니다.

| Binance 원본 | 해볼까 적용 | 비고 |
|---|---|---|
| 어두운 바탕 `canvas-dark` + 카드 `surface-card-dark` | 시작·질문·로딩·오류·결과 화면 | 그림자 없이 **색 차이로** 카드 구분 |
| 거래 화면은 밝은 테마 | **계획 화면만 밝은 테마** | `body[data-theme="light"]` |
| Binance Yellow = 유일한 강조색 | 주 버튼, 로고, 진행 막대, **유형 이름**, 비용 숫자 | 노랑은 "핵심 행동·핵심 숫자"에만 |
| 노랑 버튼 + 검정 글자 | 모든 주 버튼 | 흰 글자 금지 |
| 노랑 알약 버튼 = "바로 이 행동" | '2분 만에 내 방향 찾아보기', '캘린더 파일 받기' 2곳만 | 나머지 버튼은 6px 모서리 |
| 상승 초록 ▲ / 하락 빨강 ▼ | **끌림 투표**: ▲ 끌려요(초록) / ▼ 별로예요(빨강) | 방향 신호로만 사용. 성공/오류 표시에 쓰지 않음 |
| 노랑 큰 숫자(`stat-callout`) | 첫 달 예상 비용 | 숫자는 고정폭 숫자(`tabular-nums`) |
| "FUNDS ARE SAFU"처럼 노랑 헤드라인 | 나의 해볼까 유형 이름 | — |
| 밝은 푸터(어두운 화면 아래도 밝게) | 그대로 | Binance의 대표 배치 |
| 파란 포커스 링 `info-ring` | 키보드 포커스 표시 | — |
| BinanceNova / BinancePlex | **Pretendard** (숫자는 `font-variant-numeric: tabular-nums`) | 별도 숫자 글꼴 없이 고정폭 숫자 기능으로 대신 |
| 청록 `accent-turquoise`, 노랑→검정 그라디언트, 코인 일러스트, Binance 로고·문구 | **사용 안 함** | 단일 제품 실험색·브랜드 자산 |

### 접근성 때문에 바꾼 부분
| 원본 | 문제 | 해볼까 |
|---|---|---|
| `muted`(#707a8a) 보조 글자 | 어두운 카드 위 3.65:1, 흰 바탕 4.34:1로 기준(4.5:1) 미달 | 어두운 테마 보조 글자는 `muted-strong`(#929aa5, 5.56:1), 밝은 테마는 파생 토큰 `#5e6673`(5.79:1). `muted`는 입력창 테두리(3:1 기준)로만 사용 |
| `trading-down`(#f6465d) 글자를 카드(#1e2329) 위에 | 4.48:1로 아슬아슬 미달 | 투표 버튼 묶음 바탕을 `canvas-dark`로 깔아 5.49:1 |
| 초록·빨강 위 흰 글자 | 2.13:1 / 3.53:1 | 투표가 눌리면 초록·빨강 바탕 + **검정(ink) 글자** (8.18 / 4.93) |
| 오류 상태 | 원본에 정의 없음(Known Gaps), 빨강은 하락 신호라 오류에 쓰면 안 됨 | 노랑 진한색(`primary-active`) 아이콘·왼쪽 띠 + 일반 글자색 |

---

## 2. 색상 토큰

### 2-1. 원본 팔레트 (Binance에서 가져온 값)

| 토큰 | HEX | 용도 |
|---|---|---|
| `--color-primary` | `#fcd535` | 주 버튼, 로고, 진행 막대, 유형 이름, 비용 숫자, 링크, 선택된 선택지 테두리 |
| `--color-primary-active` | `#f0b90b` | 주 버튼 누름·hover, 오류 아이콘·띠 |
| `--color-primary-disabled` | `#3a3a1f` | 비활성 주 버튼 배경 (어두운 테마) |
| `--color-ink` | `#181a20` | 노랑·초록·빨강 위 글자, 밝은 테마 제목·본문 |
| `--color-body` | `#eaecef` | 어두운 테마 본문 |
| `--color-muted` | `#707a8a` | 입력창·선택지 테두리, 비활성 글자 (일반 글자로 쓰지 않음) |
| `--color-muted-strong` | `#929aa5` | 어두운 테마 보조 글자 |
| `--color-hairline-on-light` | `#eaecef` | 밝은 테마 카드·구분선 1px |
| `--color-hairline-on-dark` | `#2b3139` | 어두운 테마 구분선 1px |
| `--color-canvas-light` | `#ffffff` | 밝은 테마 바탕·카드 |
| `--color-canvas-dark` | `#0b0e11` | 어두운 테마 바탕, 카드 안 움푹한 영역 |
| `--color-surface-card-dark` | `#1e2329` | 어두운 테마 카드 |
| `--color-surface-elevated-dark` | `#2b3139` | 카드 안 버튼·배지·선택된 선택지 배경 |
| `--color-surface-soft-light` | `#fafafa` | 푸터 |
| `--color-surface-strong-light` | `#f5f5f5` | 밝은 테마 오류 안내·체크리스트 항목 배경 |
| `--color-on-dark` | `#ffffff` | 어두운 테마 큰 제목 |
| `--color-trading-up` | `#0ecb81` | ▲ 끌려요 |
| `--color-trading-down` | `#f6465d` | ▼ 별로예요 |
| `--color-info` | `#3b82f6` | 포커스 링, 마음 건강 안내 왼쪽 띠 |

### 2-2. 파생 토큰 (이 프로젝트에서 추가한 유일한 색)
| 토큰 | HEX | 이유 |
|---|---|---|
| `--color-muted-on-light` | `#5e6673` | 밝은 테마 보조 글자. 원본 `muted`는 흰 바탕에서 4.34:1로 부족 |

### 2-3. 테마 토큰 — **CSS에서는 이 이름만 씁니다**

`:root`(어두운 테마)에 정의하고, `[data-theme="light"]`에서 값만 바꿉니다.

| 토큰 | 어두운 테마 | 밝은 테마 |
|---|---|---|
| `--bg-page` | canvas-dark | canvas-light |
| `--bg-card` | surface-card-dark | canvas-light |
| `--bg-raised` (카드 안 버튼·배지) | surface-elevated-dark | surface-strong-light |
| `--bg-inset` (카드 안 움푹한 영역) | canvas-dark | surface-strong-light |
| `--border-card` | `none` (색 차이로 구분) | `1px solid` hairline-on-light |
| `--line` (구분선 색) | hairline-on-dark | hairline-on-light |
| `--text-strong` (제목) | on-dark | ink |
| `--text-main` (본문) | body | ink |
| `--text-sub` (보조) | muted-strong | muted-on-light |
| `--field-border` | muted | muted |

공통(테마와 무관): `--accent: var(--color-primary)`, `--accent-active: var(--color-primary-active)`, `--on-accent: var(--color-ink)`, `--vote-up: var(--color-trading-up)`, `--vote-down: var(--color-trading-down)`, `--focus-ring: var(--color-info)`, `--caution: var(--color-primary-active)`.

### 2-4. 명도 대비 확인표 (AA: 글자 4.5:1, UI 요소 3:1)
| 조합 | 대비 | 결과 |
|---|---|---|
| ink / 노랑 (주 버튼) | 12.18 | ✅ |
| body / canvas-dark | 16.35 | ✅ |
| body / card | 13.36 | ✅ |
| muted-strong / card | 5.56 | ✅ |
| 노랑 / card (유형 이름·비용) | 11.08 | ✅ |
| 초록 / canvas-dark (투표) | 9.10 | ✅ |
| 빨강 / canvas-dark (투표) | 5.49 | ✅ |
| ink / 초록, ink / 빨강 (눌린 투표) | 8.18 / 4.93 | ✅ |
| ink / 흰색, muted-on-light / 흰색 (밝은 테마) | 17.39 / 5.79 | ✅ |
| muted-on-light / 푸터 | 5.55 | ✅ |
| muted 테두리 / card, / 흰색 (UI 요소) | 3.65 / 4.34 | ✅ |
| info 포커스 링 / card, / 흰색 (UI 요소) | 4.30 / 3.68 | ✅ |
| 흰 글자 / 초록·빨강 | 2.13 / 3.53 | ❌ 금지 |
| 노랑 글자 / 흰색 | 1.8 미만 | ❌ 밝은 테마에서 노랑 글자 금지 (노랑 바탕 + ink 글자만) |
| muted 글자 / card | 3.65 | ❌ 글자로 사용 금지 |

---

## 3. 글꼴 — Pretendard 웹폰트

Binance는 본문 400, 캡션·숫자 500, 제목·버튼 600, 큰 제목 700을 씁니다. 그래서 사용자가 제공한 Pretendard 정의 중 **400·500·600·700 네 굵기**만 불러옵니다 (100~300, 800·900, 가변 글꼴은 쓰지 않음).

### 3-1. `public/css/fonts.css` (이 내용 그대로)
```css
/* Pretendard 웹폰트 — Binance 굵기 체계에 맞춰 400·500·600·700만 사용 */
@font-face {
  font-family: 'Pretendard';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Pretendard';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: 'Pretendard';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-display: swap;
}
@font-face {
  font-family: 'Pretendard';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```
`<head>`에 `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>` 포함.

### 3-2. 글자 크기 단계
| 토큰 | 크기 | 굵기 | 줄 간격 | 자간 | 용도 |
|---|---|---|---|---|---|
| `display-lg` | 48px (768px 미만 **32px**) | 700 | 1.1 | -0.5px | 시작 화면 제목 |
| `display-sm` | 32px (768px 미만 **28px**) | 700 | 1.2 | 0 | 유형 이름 (노랑) |
| `title-lg` | 24px | 600 | 1.3 | 0 | 질문 제목, 각 화면 제목 |
| `title-md` | 20px | 600 | 1.35 | 0 | 활동 이름, 카드 제목, 비용 숫자(700) |
| `title-sm` | 16px | 600 | 1.4 | 0 | 선택지 라벨, 단계 이름, 구역 제목 |
| `body-lg` | 16px | 400 | 1.5 | 0 | 이유, 첫 걸음, 입력창, 유형 설명 |
| `body-md` | 14px | 400 | 1.5 | 0 | 일반 설명, 안내, 팁 |
| `caption` | 12px | 500 | 1.4 | 0 | 배지, 단계 알약, 글자 수, 푸터 |
| `button` | 14px | 600 | 1 | 0 | 모든 버튼 |

- 숫자가 들어가는 곳(`n / 11`, 글자 수, 비용, 날짜·시간 입력)에는 `font-variant-numeric: tabular-nums`.
- 한국어 줄바꿈: `body`에 `word-break: keep-all; overflow-wrap: anywhere;`
- 원본 `body-md`(14px)는 한국어 본문으로는 작아서, 주요 읽을거리(이유·첫 걸음)는 `body-lg` 16px을 씁니다.

---

## 4. 간격 · 모서리 · 깊이

| 간격 토큰 | 값 | | 모서리 토큰 | 값 | 용도 |
|---|---|---|---|---|---|
| `--space-xxs` | 4px | | `--radius-sm` | 4px | 배지 |
| `--space-xs` | 8px | | `--radius-md` | 6px | 버튼, 밝은 테마 입력창 |
| `--space-sm` | 12px | | `--radius-lg` | 8px | 어두운 테마 입력창, 선택지, 카드 안 영역, 밝은 테마 카드 |
| `--space-md` | 16px | | `--radius-xl` | 12px | 어두운 테마 카드 |
| `--space-lg` | 24px | | `--radius-pill` | 9999px | 알약 버튼 2개, 투표, 진행 막대, 로고 |
| `--space-xl` | 32px | | | | |
| `--space-xxl` | 48px | | | | |
| `--space-section` | 80px (768px 미만 48px) | | | | |

깊이: **그림자를 쓰지 않습니다.** 어두운 테마는 `canvas-dark → card → raised` 색 단계로, 밝은 테마는 1px 헤어라인으로 구분합니다. 포커스는 `box-shadow: 0 0 0 2px var(--focus-ring)`. 그라디언트·빛 번짐 효과 금지.

---

## 5. `public/css/tokens.css` (이 내용 그대로)

```css
/* =========================================================
   해볼까 디자인 토큰 (Binance 기반)
   - 색상 HEX 값은 이 파일에만 존재해야 합니다. (AGENTS.md X-10)
   - style.css 에서는 2-3장의 테마 토큰과 공통 토큰만 사용하세요.
   ========================================================= */
:root {
  /* ---- 원본 팔레트 (Binance) ---- */
  --color-primary: #fcd535;
  --color-primary-active: #f0b90b;
  --color-primary-disabled: #3a3a1f;
  --color-ink: #181a20;
  --color-body: #eaecef;
  --color-muted: #707a8a;
  --color-muted-strong: #929aa5;
  --color-hairline-on-light: #eaecef;
  --color-hairline-on-dark: #2b3139;
  --color-canvas-light: #ffffff;
  --color-canvas-dark: #0b0e11;
  --color-surface-card-dark: #1e2329;
  --color-surface-elevated-dark: #2b3139;
  --color-surface-soft-light: #fafafa;
  --color-surface-strong-light: #f5f5f5;
  --color-on-dark: #ffffff;
  --color-trading-up: #0ecb81;
  --color-trading-down: #f6465d;
  --color-info: #3b82f6;

  /* ---- 파생 토큰 ---- */
  --color-muted-on-light: #5e6673;

  /* ---- 공통 의미 토큰 ---- */
  --accent: var(--color-primary);
  --accent-active: var(--color-primary-active);
  --accent-disabled: var(--color-primary-disabled);
  --on-accent: var(--color-ink);
  --vote-up: var(--color-trading-up);
  --vote-down: var(--color-trading-down);
  --focus-ring: var(--color-info);
  --caution: var(--color-primary-active);
  --footer-bg: var(--color-surface-soft-light);
  --footer-text: var(--color-muted-on-light);

  /* ---- 테마 토큰: 어두운 테마 (기본) ---- */
  --bg-page: var(--color-canvas-dark);
  --bg-card: var(--color-surface-card-dark);
  --bg-raised: var(--color-surface-elevated-dark);
  --bg-inset: var(--color-canvas-dark);
  --border-card: none;
  --line: var(--color-hairline-on-dark);
  --text-strong: var(--color-on-dark);
  --text-main: var(--color-body);
  --text-sub: var(--color-muted-strong);
  --field-border: var(--color-muted);
  --radius-card: 12px;
  --radius-field: 8px;

  /* ---- 글꼴 ---- */
  --font-sans: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  --text-display-lg: 48px;
  --text-display-sm: 32px;
  --text-title-lg: 24px;
  --text-title-md: 20px;
  --text-title-sm: 16px;
  --text-body-lg: 16px;
  --text-body-md: 14px;
  --text-caption: 12px;
  --text-button: 14px;

  /* ---- 간격 ---- */
  --space-xxs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-xxl: 48px;
  --space-section: 80px;

  /* ---- 모서리 ---- */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-pill: 9999px;

  /* ---- 레이아웃 ---- */
  --container-max: 1280px;
  --narrow-max: 640px;
  --sidebar-width: 360px;
  --header-height: 64px;
  --control-height: 44px;
}

/* ---- 밝은 테마 (계획 화면) ---- */
[data-theme="light"] {
  --bg-page: var(--color-canvas-light);
  --bg-card: var(--color-canvas-light);
  --bg-raised: var(--color-surface-strong-light);
  --bg-inset: var(--color-surface-strong-light);
  --border-card: 1px solid var(--color-hairline-on-light);
  --line: var(--color-hairline-on-light);
  --text-strong: var(--color-ink);
  --text-main: var(--color-ink);
  --text-sub: var(--color-muted-on-light);
  --field-border: var(--color-muted);
  --radius-card: 8px;
  --radius-field: 6px;
}

@media (max-width: 767px) {
  :root {
    --text-display-lg: 32px;
    --text-display-sm: 28px;
    --space-section: 48px;
  }
}
```

---

## 6. 디자인 규칙 요약

### Do
- 노랑은 **주 버튼, 로고, 진행 막대, 유형 이름, 비용 숫자, 링크**에만. 노랑 위 글자는 항상 검정(`--on-accent`).
- 투표는 **▼ 별로예요 = 빨강(왼쪽)**, **▲ 끌려요 = 초록(오른쪽)**. 색 + 기호 + 글자를 함께.
- 찾는 화면은 어둡게, 계획 화면만 밝게. 푸터는 항상 밝게.
- 카드 구분은 색 단계(어두운 테마)나 헤어라인(밝은 테마)으로. 그림자 없음.
- 숫자는 `tabular-nums`.

### Don't
- 초록·빨강을 "성공", "오류" 뜻으로 쓰지 않는다 (투표 방향 신호 전용). 복사 완료 표시도 초록 금지.
- 초록·빨강을 카드 배경으로 깔지 않는다 (눌린 투표 버튼 안쪽만 허용).
- 노랑을 본문 글자나 넓은 배경으로 쓰지 않는다. 알약 버튼은 2곳만.
- 두 번째 강조색(청록 등)을 들이지 않는다. 그라디언트 금지.
- 큰 제목 굵기를 400·500으로 낮추지 않는다. 100~300, 800·900 굵기 금지.
