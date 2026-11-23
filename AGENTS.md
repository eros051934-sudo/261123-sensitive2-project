# AGENTS.md — AI 코딩 에이전트 작업 규칙

> 이 문서는 AI 코딩 에이전트(Antigravity IDE 등)가 이 저장소에서 작업할 때 **반드시** 지켜야 하는 규칙입니다.
> 사람(비전공자 포함)이 읽어도 이해할 수 있도록 썼습니다. 에이전트는 작업을 시작하기 전에 이 문서를 끝까지 읽어야 합니다.

---

## 0. 한눈에 보기

| 항목 | 내용 |
|---|---|
| 서비스 이름 | **해볼까** (영문 폴더명: `haebolkka`) |
| 한 줄 설명 | 1분짜리 질문에 답하면 AI가 **"나의 해볼까 유형"** 과 **해볼 만한 활동 3가지**를 추천하고, 고른 활동을 **오늘·이번 주·2주 안의 첫 걸음**으로 쪼개서 **내 캘린더에 바로 등록**하게 해주는 웹 서비스 |
| 핵심 가치 | ① 뭘 하고 싶은지 **찾기** (질문 → 유형 → 추천) ② 실제로 **해보게 만들기** (첫 걸음 → 날짜 정하기 → 캘린더 등록) |
| 프론트엔드 | HTML + CSS + JavaScript (프레임워크·빌드 도구 없음) |
| 백엔드 | Node.js — Vercel 서버리스 함수 1개 (`/api/recommend`) |
| AI | OpenAI API (Responses API + Structured Outputs) |
| 데이터 저장 | **하지 않음.** 로그인·Supabase 없음 (이유: `PRD.md` 9장) |
| 배포 | Vercel |
| 디자인 기준 | mydealz 디자인 시스템을 이 서비스에 맞게 옮긴 것 (`docs/02-design-system.md`) |
| 글꼴 | Pretendard 웹폰트 (Medium 500, Bold 700 두 굵기만) |

---

## 1. 문서 읽는 순서와 우선순위

### 1-1. 읽는 순서 (반드시 이 순서대로)

1. `AGENTS.md` (이 문서) — 작업 규칙
2. `PRD.md` — 무엇을, 어디까지 만드는지
3. `docs/01-project-setup.md` — 폴더·파일 생성, 패키지 설치
4. `docs/02-design-system.md` — 색상·글꼴·간격 등 디자인 토큰
5. `docs/03-ui-layout-components.md` — 화면(뷰) 구성, HTML 구조, 컴포넌트
6. `docs/04-content-questions.md` — 질문·선택지·라벨·화면 문구 (콘텐츠 정본)
7. `docs/05-frontend-logic.md` — 브라우저 쪽 동작(JS)
8. `docs/06-calendar-export.md` — 캘린더 파일(.ics)·Google 캘린더 링크·복사하기
9. `docs/07-backend-api.md` — 서버 API 명세와 구현
10. `docs/08-openai-integration.md` — OpenAI 호출, 프롬프트, 응답 스키마
11. `docs/09-error-handling.md` — 오류 코드와 오류 메시지 전체 목록
12. `docs/10-testing-verification.md` — 테스트와 검증 기준
13. `docs/11-deploy-vercel.md` — 배포
14. `docs/12-supabase-future.md` — **v1에서 구현 금지.** 참고만

### 1-2. 우선순위 (내용이 서로 다를 때)

```
AGENTS.md  >  PRD.md  >  docs/*.md
```

- 질문·선택지·라벨·화면 문구는 `docs/04`, 오류 문구는 `docs/09`가 정본입니다.
- 색상·글꼴·간격 값은 `docs/02`가 정본입니다.
- **문서끼리 충돌을 발견하면 임의로 하나를 고르지 말고, 작업을 멈추고 사용자에게 질문합니다.**

---

## 2. 추측 금지 원칙 (가장 중요)

1. **문서에 적힌 것만 만듭니다.** 문서에 없는 기능, 화면, 버튼, 문구, 질문, 선택지, 애니메이션을 추가하지 않습니다.
2. **결정이 필요한데 문서에 답이 없으면 작업을 멈추고 질문합니다.** 아래 형식을 씁니다.

   ```
   [확인 필요]
   - 상황: (무엇을 하다가 막혔는지)
   - 문서 근거: (어느 문서의 어느 부분을 확인했는지)
   - 선택지: A) ...  B) ...
   - 제안: (에이전트가 추천하는 선택지와 이유 한 줄)
   ```

3. 문서에 **"에이전트 재량"** 이라고 적힌 부분만 스스로 결정할 수 있습니다.
4. 반드시 질문해야 하는 상황의 예:
   - 새 npm 패키지나 외부 스크립트가 필요할 것 같을 때 (예: 이미지 저장 라이브러리)
   - 문서에 없는 파일·폴더·화면이 필요할 것 같을 때
   - 질문 내용, 선택지, 화면 문구를 바꾸고 싶을 때
   - OpenAI 모델 ID가 오류(`model_not_found` 등)를 낼 때 — **다른 모델 이름을 추측해서 넣지 않습니다**
   - OpenAI API 키, Vercel 계정 등 사용자만 가진 정보가 필요할 때
   - 테스트가 기대값과 다르게 나오는데 원인이 문서 쪽 오류로 보일 때

---

## 3. 절대 금지 (MUST NOT)

| # | 금지 사항 | 이유 |
|---|---|---|
| X-01 | React, Vue, Svelte, jQuery, Tailwind, Bootstrap 등 프레임워크·UI 라이브러리 사용 | 기술 스택이 HTML/CSS/JS로 고정됨 |
| X-02 | Vite, Webpack, Babel 등 빌드 도구, TypeScript 사용 | 빌드 없이 그대로 배포하는 구조 |
| X-03 | `openai`, `vercel` 외의 npm 패키지 설치, CDN 스크립트 추가 | 의존성 최소화. 필요하면 질문 |
| X-04 | OpenAI API 키를 프론트엔드 코드(`public/` 안), 커밋, 로그, 화면에 노출 | 키가 유출되면 요금이 청구됨 |
| X-05 | 브라우저에서 OpenAI API를 직접 호출 | 반드시 `/api/recommend` 서버 함수를 거쳐야 함 |
| X-06 | AI 응답이나 사용자 입력을 `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`로 화면에 넣기 | XSS(악성 스크립트 삽입) 방지. `textContent`와 `createElement`만 사용 |
| X-07 | 사용자의 답변·자유 입력 내용을 서버 로그(`console.log` 등)에 기록 | 개인정보 보호 |
| X-08 | 답변·추천 결과·계획을 DB·파일·localStorage·sessionStorage·쿠키에 저장 | v1은 저장 기능 없음 (새로고침하면 처음부터) |
| X-09 | Supabase 연결 코드, 로그인 기능 작성 | v1 범위 밖 (`docs/12`) |
| X-10 | `public/css/tokens.css` 밖에서 색상 HEX 값 직접 사용 | 모든 색은 CSS 변수(`var(--...)`)로만 |
| X-11 | Pretendard 외 글꼴 추가, 500·700 외 굵기 사용 | 디자인 규칙 (2가지 굵기만) |
| X-12 | 문서에 정한 파일 경로, HTML `id`, 질문·선택지 `id`, API 경로, 오류 코드 이름 변경 | 문서와 코드가 어긋나면 검증 불가 |
| X-13 | 실제 OpenAI 호출 비용이 드는 반복 테스트 자동 실행 | 비용 발생. 반복 테스트는 Mock 모드로 |
| X-14 | 테스트를 통과시키려고 테스트 코드·기대값·프롬프트를 임의로 수정 | 검증 기준 훼손. 필요하면 질문 |
| X-15 | Vercel 배포, 환경변수 등록, 유료 설정 변경을 사용자 확인 없이 진행 | 사용자 계정에 영향 |
| X-16 | AI가 실제 가게·업체·강사 이름, 정확한 가격, 특정 날짜의 행사를 추천하도록 만들기 | AI가 사실이 아닌 정보를 지어낼 수 있음 (`docs/08` 2장) |

---

## 4. 반드시 지킬 것 (MUST)

1. **API 키는 환경변수로만** 읽습니다: `process.env.OPENAI_API_KEY` (서버 코드에서만).
2. 화면 문구·질문·선택지는 `docs/04`, `docs/09`에 적힌 그대로 씁니다. 띄어쓰기·문장부호까지 같게 합니다.
3. 질문·선택지 `id`와 라벨은 `public/js/content.js` **한 파일**에만 정의하고, 서버(`lib/validate.js`, `lib/prompt.js`)도 이 파일을 `import`해서 씁니다. 같은 값을 두 곳에 따로 적지 않습니다.
4. 입력 검사(필수 답변, 자유 입력 300자)는 **프론트와 서버 양쪽**에서 합니다.
5. AI 응답은 서버에서 **검증·정리(normalize)** 한 뒤에만 브라우저로 보냅니다 (`docs/07` 5장).
6. 모든 버튼·선택지·입력창은 **키보드만으로** 조작할 수 있어야 하고, 포커스 표시가 보여야 합니다.
7. 코드 주석은 **한국어**로, 비전공자도 이해할 수 있게 "이 코드가 왜 필요한지"를 씁니다.
8. 각 작업 단계(7장)가 끝날 때마다 8장 형식으로 보고합니다.

---

## 5. 파일 구조 (고정)

아래 구조 외의 파일·폴더는 만들지 않습니다. (`node_modules/`, `.vercel/`, `package-lock.json`은 도구가 자동으로 만드므로 예외)

```
haebolkka/
├─ AGENTS.md
├─ PRD.md
├─ README.md                  ← 사람이 읽는 실행 방법 (docs/01 7장 내용으로 작성)
├─ docs/                      ← 세부 구현 문서 (질문 후에만 수정)
├─ public/                    ← 브라우저로 그대로 전달되는 파일 (비밀 정보 금지!)
│  ├─ index.html
│  ├─ css/
│  │  ├─ fonts.css            ← Pretendard @font-face
│  │  ├─ tokens.css           ← 디자인 토큰
│  │  └─ style.css            ← 레이아웃·컴포넌트 스타일
│  └─ js/
│     ├─ content.js           ← 질문·선택지·라벨 (프론트·서버 공용, 순수 데이터)
│     ├─ calendar.js          ← .ics 파일·Google 캘린더 링크 만들기 (순수 함수)
│     └─ app.js               ← 화면 동작 전체
├─ api/
│  └─ recommend.js            ← 서버 API: POST /api/recommend
├─ lib/                       ← 서버 전용 모듈 (웹에 공개되지 않음)
│  ├─ errors.js
│  ├─ validate.js             ← 요청 검사, AI 응답 정리
│  ├─ prompt.js               ← 프롬프트, JSON 스키마
│  ├─ recommend-activities.js ← OpenAI 호출
│  └─ mock.js                 ← 테스트용 가짜 AI
├─ tests/
│  ├─ validate.test.js
│  ├─ calendar.test.js
│  └─ api.test.js
├─ .env.example
├─ .gitignore
├─ package.json
└─ vercel.json
```

---

## 6. 코딩 규칙

| 항목 | 규칙 |
|---|---|
| 모듈 방식 | ES Modules (`import` / `export`). `package.json`에 `"type": "module"` |
| 변수 | `const` 우선, 바뀌는 값만 `let`. `var` 금지 |
| 비동기 | `async` / `await`. `.then()` 체인 금지 |
| 들여쓰기 | 공백 2칸 |
| 따옴표 | JS는 작은따옴표 `'`, HTML 속성은 큰따옴표 `"` |
| 세미콜론 | 사용 |
| 이름 | 변수·함수 `camelCase`, 상수 `UPPER_SNAKE_CASE`, CSS 클래스 `kebab-case` (BEM: `block__element--modifier`) |
| 함수 길이 | 한 함수는 한 가지 일만. 40줄을 넘으면 나누기 (에이전트 재량으로 나눌 수 있음) |
| 순수 모듈 | `content.js`, `calendar.js`는 `document`, `window`를 쓰지 않음 (Node 테스트에서 불러오기 위해) |
| DOM 조작 | 글자는 `textContent`, 보이기/숨기기는 `hidden` 속성, 상태별 모양은 `data-*` 속성 + CSS |
| 인라인 스타일 | HTML `style="..."` 금지. JS에서는 질문 진행 막대 너비 한 곳만 `element.style.width` 허용 |
| 콘솔 출력 | 서버: 오류 코드와 원인만 `console.error`. 사용자 답변 출력 금지. 브라우저: 배포 코드에 `console.log` 남기지 않기 |

---

## 7. 작업 순서 (단계별 체크포인트)

각 단계의 **완료 조건을 모두 만족해야** 다음 단계로 넘어갑니다. 🔒 표시 단계는 **사용자 확인을 받은 뒤** 진행합니다.

| 단계 | 할 일 | 참고 문서 | 완료 조건 |
|---|---|---|---|
| 1. 프로젝트 셋업 | 폴더·설정 파일 생성, 패키지 설치 | docs/01 | `npm test`가 오류 없이 끝난다. `.gitignore`에 `.env.local` 포함 |
| 2. 정적 UI | `index.html`, CSS 3개, `content.js` 작성. 5개 뷰를 `hidden`을 바꿔가며 눈으로 확인 | docs/02, 03, 04 | 360px·768px·1280px 너비에서 docs/03과 일치. 색은 모두 CSS 변수 |
| 3. 서버 + Mock | `lib/*`, `api/recommend.js` 작성 | docs/07, 08, 09 | `npm test`의 U·N·P·H 테스트 전부 통과 (docs/10 2장) |
| 4. 캘린더 모듈 | `calendar.js` 작성 | docs/06 | `npm test`의 C 테스트 전부 통과 |
| 5. 프론트 연동 | `app.js` 작성, Mock 서버와 연결 | docs/05, 06, 09 | docs/10 3장 수동 테스트 M-01 ~ M-20 통과 (Mock 모드) |
| 6. 🔒 실제 OpenAI 연동 | 사용자가 `.env.local`에 키를 넣은 뒤 `MOCK_AI=false`로 확인 | docs/08 | docs/10 4장 품질 테스트 기준 통과 |
| 7. 최종 검증 | 보안·접근성·반응형·디자인 점검, `README.md` 작성 | docs/10 | docs/10 5·6장 체크리스트 전부 ✅ |
| 8. 🔒 배포 | 사용자와 함께 Vercel 배포 | docs/11 | docs/10 7장 D-01 ~ D-07 통과 |

---

## 8. 보고 형식

```
## [단계 N] 완료 보고
- 만든/바꾼 파일: (경로 목록)
- 확인한 방법: (실행한 명령어, 확인한 화면 너비 등)
- 완료 조건 결과: (조건별 ✅ / ❌)
- 문서와 다르게 한 부분: (없으면 "없음". 있으면 이유와 사용자 승인 여부)
- 다음 단계: (무엇을 할지 / 사용자가 해줘야 할 일)
```

---

## 9. 완료의 정의 (Definition of Done)

- [ ] `PRD.md` 6장의 모든 기능 요구사항(FR)이 수용 기준을 만족한다.
- [ ] `npm test`가 모두 통과한다.
- [ ] `docs/10-testing-verification.md`의 모든 체크리스트가 ✅이다.
- [ ] `public/` 폴더와 Git 기록 어디에도 API 키(`sk-`로 시작하는 문자열)가 없다.
- [ ] Vercel 배포 주소에서 질문 → 추천 → 계획 → 캘린더 등록까지 실제로 동작한다.
- [ ] `README.md`만 읽고도 비전공자가 로컬 실행과 배포를 따라 할 수 있다.
