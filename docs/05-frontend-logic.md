# 05. 프론트엔드 기능 구현 (`public/js/app.js`)

> 브라우저 동작의 정본입니다. `app.js`는 `content.js`, `calendar.js`를 `import`합니다.
> HTML `id`는 `03` 문서 3장, 문구는 `04` 문서 5장과 같아야 합니다.

---

## 1. 상수

```js
import { QUESTIONS, MAX_NOTE_LENGTH, MAX_MOOD, MAX_PREVIOUS, STEP_LABELS } from './content.js';
import { buildIcs, buildGoogleCalendarUrl } from './calendar.js';

const API_URL = '/api/recommend';
const REQUEST_TIMEOUT_MS = 35000;   // 35초 지나면 CLIENT_TIMEOUT
const LOADING_MESSAGE_MS = 2500;    // 로딩 문구 바꾸는 간격
const EVENT_DURATION_MIN = 60;      // 캘린더 일정 길이
```

`ERROR_MESSAGES`, `RETRYABLE_CODES`는 `09-error-handling.md` 5장을 그대로 옮깁니다.

## 2. 상태 (메모리에만, 저장 금지)

```js
const state = {
  view: 'intro',          // intro | quiz | loading | error | result | plan
  step: 0,                // 질문 번호 0~6
  answers: { mood: [], company: null, place: null, energy: null, budget: null, time: null, note: '' },
  profile: null,          // 첫 결과의 유형 (다른 추천을 받아도 유지)
  activities: [],         // 지금 보이는 활동 3개
  votes: {},              // { 활동id: 'hot' | 'cold' }
  seen: [],               // 지금까지 본 활동 [{ name, vote }] 최대 9개 (최근 것 유지)
  selected: null,         // 계획 화면에 들어간 활동
  busy: false,            // 요청 중이면 true (중복 요청 방지)
};
```

## 3. 뷰 전환 — `showView(name)`

- 6개 뷰 중 `#view-{name}`만 `hidden = false`, 나머지 `hidden = true`.
- 테마: `document.body.dataset.theme = (name === 'plan') ? 'light' : 'dark'` (찾는 화면은 어둡게, 계획 화면만 밝게 — `02` 문서 1장).
- `window.scrollTo(0, 0)` 후 그 뷰의 제목(`tabindex="-1"`)에 `focus()`. 질문 뷰는 `#quiz-title`.
- `hidden`을 직접 바꾸는 곳은 이 함수, 그리고 뷰 **안쪽** 요소(오류 문구, 배지, 안내 카드 등)뿐입니다.

## 4. 기능별 동작

### 4-1. 시작
- `#start-button` → 답변 초기화(2장 기본값), `state.step = 0`, `renderQuestion()`, `showView('quiz')`.

### 4-2. 질문 그리기 — `renderQuestion()`
| 대상 | 값 |
|---|---|
| `#quiz-step` | `` `${step + 1} / 7` `` |
| `#quiz-progress` | `aria-valuenow = step + 1`, `#quiz-progress-fill.style.width = ((step+1)/7*100)%` |
| `#quiz-title`, `#quiz-hint` | 질문의 `title`, `hint` |
| `#quiz-options` | `replaceChildren()` 후 선택지마다 `input` + `label` 생성. `type`이 `multi`면 checkbox, `single`이면 radio(`name`=질문 id). 클래스 `option option--tile` 또는 `option option--chip`. `id`는 `opt-{질문id}-{선택지id}`. 저장된 답이면 `checked` |
| `#quiz-note-field` | Q7(`note`)에서만 보임. 그 외 질문에서는 `#quiz-options` 보임 |
| `#quiz-prev` | 항상 보임. Q1에서 누르면 시작 화면으로 |
| `#quiz-next` | Q1~Q6: "다음". Q7: 입력 없으면 "건너뛰고 추천 받기", 있으면 "추천 받기" |

### 4-3. 답 고르기
- radio 변경 → `state.answers[질문id] = 값`.
- checkbox 변경 → 배열에 추가/제거. **2개가 선택되면 나머지 체크박스는 `disabled`**, 1개 이하가 되면 다시 사용 가능.
- `#quiz-next`는 현재 질문에 답이 없으면 `disabled` (Q1: 1개 이상, Q2~Q6: 값 있음, Q7: 항상 사용 가능. 단 300자 초과 시 `disabled`).
- Q7 `input` 이벤트: `state.answers.note = value`, `#note-count` = `` `${value.trim().length} / 300자` ``, 300 초과면 `.counter--over` + `#note-error`에 "자유 입력은 300자까지 쓸 수 있어요." + `aria-invalid="true"`.

### 4-4. 다음 / 이전
- `#quiz-form` `submit`(= 다음 버튼, 엔터) → `event.preventDefault()`. Q1~Q6이면 `step + 1` 후 `renderQuestion()`, `#quiz-title`에 포커스. Q7이면 `requestFirstRecommendation()`.
- `#quiz-prev` → Q1이면 `showView('intro')`, 아니면 `step - 1`. **답은 지우지 않습니다.**

### 4-5. 첫 추천 — `requestFirstRecommendation()`
```
1. state.busy 면 끝. state.busy = true
2. state.seen = [], state.votes = {}, state.profile = null
3. showView('loading'), 로딩 문구 순환 시작, #sr-status = '추천을 만들고 있어요'
4. try:  data = await callApi({ answers, previous: [] })
         state.profile = data.result.profile
         state.activities = data.result.activities
         addToSeen(activities)
         renderResult(data)  → showView('result')
         #sr-status = `추천 3개가 도착했어요. 나의 유형은 ${typeName}이에요.`
   catch: renderErrorView(error) → showView('error')
   finally: 로딩 문구 순환 중지, state.busy = false
```
- `#error-retry` → 같은 답변으로 `requestFirstRecommendation()`. 다시 시도 불가 오류면 버튼을 숨김.
- `#error-edit` → `state.step = 6`, `renderQuestion()`, `showView('quiz')`.

### 4-6. 다른 추천 — `requestMoreRecommendation()`
```
1. state.busy 면 끝. busy = true
2. #more-loading 보임, #result-inline-error 숨김, #more-button·#copy-result-button·모든 '이걸로 해볼래요' disabled
3. previous = state.seen (각 { name, vote: votes에 있으면 'hot'/'cold', 없으면 'none' })
4. try:  data = await callApi({ answers, previous })
         state.activities = data.result.activities   (profile은 바꾸지 않음)
         state.votes = {}, addToSeen(...)
         renderActivities()
         #sr-status = '새로운 추천 3개가 도착했어요.'
   catch: 기존 카드 유지. #result-inline-error 보임 + 메시지. 다시 시도 가능하면 #result-retry 보임
   finally: #more-loading 숨김, 버튼 다시 사용 가능, busy = false
```
- `addToSeen(list)`: 이름을 `seen` 끝에 추가하고, 9개를 넘으면 앞(오래된 것)부터 지움. 투표는 요청 시점에 `votes`에서 읽어 반영(4-8).

### 4-7. 서버 호출 — `callApi(body)`
`AbortController`로 35초 제한 → 실패 시 `CLIENT_TIMEOUT`, `fetch` 실패는 `NETWORK_ERROR`, JSON이 아니면 `UNKNOWN_ERROR`, `ok !== true`면 서버의 `error.code / message / retryable`로 오류를 던집니다.
응답 확인 `isValidResult`: `profile.typeName`이 문자열, `activities`가 길이 3 배열이고 각 항목에 `id`, `name`, `steps.today/thisWeek/twoWeeks`가 있으면 통과. 아니면 `UNKNOWN_ERROR`.

### 4-8. 결과 그리기 — `renderResult(data)`, `renderActivities()`
- 유형: `#type-name`, `#type-summary` 글자, `#type-keywords`는 `li`마다 `` `#${keyword}` ``.
- `#wellbeing-notice`: `result.wellbeingConcern === true`면 보임. (다른 추천에서는 바꾸지 않음)
- `#mock-badge`: `meta.mock === true`면 보임.
- 활동 카드: `#activity-template`을 `content.cloneNode(true)`로 복제 → `js-*` 요소에 `textContent`:
  `js-category` = `categoryLabel`, `js-difficulty` = `difficultyLabel`, `js-name` = `name`, `js-cost` = `costLabel`, `js-reason` = `reason`, `js-today` = `steps.today`, `js-tip` = `` `팁 · ${tip}` `` (tip이 `null`이면 숨김).
  `li`에 `data-id = id`. 이름 요소에 `id = name-{id}`를 주고 `li`에 `aria-labelledby` 연결.
- 끌림 투표: `js-vote-up`(▲ 끌려요) 클릭 → 이미 `hot`이면 취소(none), 아니면 `hot`. `js-vote-down`(▼ 별로예요)은 `cold`로 같은 방식. `state.votes[id]` 갱신, 두 버튼의 `aria-pressed`, `li.dataset.vote` 갱신.
- `js-choose` 클릭 → `openPlan(activity)`.

### 4-9. 계획 화면 — `openPlan(activity)`
- `state.selected = activity`, `#plan-title` = `` `${name}, 이렇게 시작해요` ``.
- `#plan-steps`: `today`, `thisWeek`, `twoWeeks` 순서로 `li > label > input[type=checkbox] + span(단계 라벨) + span(내용)`. 체크는 화면에서만 유지.
- `#plan-tip`: 팁이 있으면 `팁 · …`, 없으면 숨김.
- 날짜·시간 기본값: **내일 19:00** (로컬 시각). `#plan-date.min` = 오늘(`YYYY-MM-DD`).
- `showView('plan')`. `#plan-back` → `showView('result')` (카드·투표 그대로).

### 4-10. 날짜 검사 — `readPlanDate()`
- 날짜나 시간이 비어 있으면 → `#plan-time-error` "날짜와 시간을 모두 골라 주세요." 후 `null`.
- `new Date(\`${date}T${time}\`)`가 지금보다 이전이면 → "지난 시간은 고를 수 없어요." 후 `null`.
- 정상이면 오류 숨기고 `Date` 반환. 날짜·시간 입력이 바뀔 때마다 `#gcal-link.href`를 다시 계산(정상일 때만, 아니면 `#`).

### 4-11. 캘린더·복사 (세부는 `06-calendar-export.md`)
- `#ics-button` → `readPlanDate()` 성공 시 `buildIcs(...)` → `Blob`(`text/calendar;charset=utf-8`) → `URL.createObjectURL` → 임시 `<a download="haebolkka-plan.ics">` 클릭 → `URL.revokeObjectURL`.
- `#gcal-link` 클릭 → `readPlanDate()` 실패면 `event.preventDefault()`. 성공이면 새 탭으로 열림.
- `#copy-result-button`, `#copy-plan-button` → `navigator.clipboard.writeText(text)` → 성공/실패 문구를 각 `copy-status`에 표시하고 3초 뒤 지움.

### 4-12. 처음부터 다시
- `#restart-button` → `state`를 2장 기본값으로 되돌리고 `showView('intro')`.

## 5. 하지 말 것
- `innerHTML` 등 HTML 문자열 삽입 금지 (`template` 복제 + `textContent`만)
- `localStorage`, `sessionStorage`, 쿠키 금지
- 외부 스크립트 금지, `console.log` 남기지 않기
- 답변을 URL 주소(쿼리)에 넣지 않기 (Google 캘린더 링크는 활동 이름·첫 걸음만 담음)

## 6. 함수 목록 (이름 고정)
`init`, `showView`, `renderQuestion`, `handleOptionChange`, `handleNoteInput`, `updateNextButton`, `goNext`, `goPrev`, `requestFirstRecommendation`, `requestMoreRecommendation`, `callApi`, `isValidResult`, `addToSeen`, `renderResult`, `renderActivities`, `handleVote`, `openPlan`, `readPlanDate`, `updateGoogleLink`, `downloadIcs`, `copyText`, `buildResultText`, `buildPlanText`, `startLoadingMessages`, `stopLoadingMessages`, `renderErrorView`, `restart`.
