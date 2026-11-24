# 07. 백엔드 API 명세와 구현

> 서버 코드의 정본입니다. 서버는 Vercel 서버리스 함수 **1개**(`api/recommend.js`)와 `lib/` 모듈로 구성됩니다.
> OpenAI 호출은 `08`, 오류 문구는 `09` 문서를 봅니다.

---

## 1. API 명세

### 1-1. 요청 — `POST /api/recommend`

헤더 `Content-Type: application/json`. 그 외 방식은 `405 METHOD_NOT_ALLOWED`.

```json
{
  "answers": {
    "goal": "both",
    "stage": "worker",
    "flow": ["create", "analyze"],
    "strength": "organize",
    "drain": "routine",
    "need": "clarity",
    "env": "quiet",
    "approach": "talk",
    "budget": "under30k",
    "time": "1to3h",
    "note": "마케팅에 관심이 있는데 뭐부터 할지 막막해요."
  },
  "previous": [
    { "name": "관심 직무 1:1 커피챗 인터뷰", "vote": "hot" },
    { "name": "주말 소모임 하루 참여", "vote": "cold" }
  ]
}
```

| 필드 | 규칙 | 실패 코드 |
|---|---|---|
| `answers` | 객체 필수 | `INVALID_REQUEST` |
| `answers.flow` | 배열, 1~2개, 중복 없음, 모두 `content.js`의 flow 선택지 id | `INVALID_ANSWERS` |
| `goal`, `stage`, `strength`, `drain`, `need`, `env`, `approach`, `budget`, `time` | 각 질문의 선택지 id 중 하나 (`content.js`에서 `type: 'single'`인 질문 전부) | `INVALID_ANSWERS` |
| `answers.note` | 없으면 `''`. 문자열, 앞뒤 공백 제거 후 300자 이하 | 문자열 아님 `INVALID_ANSWERS` / 초과 `NOTE_TOO_LONG` |
| `previous` | 없으면 `[]`. 배열, 최대 9개 | `INVALID_REQUEST` |
| `previous[].name` | 문자열, 공백 제거 후 1~20자 | `INVALID_REQUEST` |
| `previous[].vote` | `'hot'` \| `'cold'` \| `'none'` | `INVALID_REQUEST` |

### 1-2. 성공 — `200`

```json
{
  "ok": true,
  "result": {
    "profile": {
      "typeName": "구조를 세우는 탐색형 빌더",
      "summary": "흩어진 생각을 정리해 눈에 보이는 결과로 만들 때 힘이 나는 사람이에요.",
      "keywords": ["구조화", "실행력", "호기심"],
      "direction": "정답이 정해진 일보다 문제를 정리하고 작은 결과물로 만들어 보는 일에서 힘이 나는 편이에요. 먼저 사람을 만나 실제 일을 들어 보고, 작은 결과물을 직접 만들어 보며 확인해 봐요.",
      "fields": [
        { "name": "서비스 기획", "why": "문제를 정리하고 해결책을 구조로 그리는 일이 강점과 맞아요." },
        { "name": "콘텐츠 기획", "why": "아이디어를 눈에 보이는 결과물로 만드는 데서 힘이 나요." }
      ]
    },
    "activities": [
      {
        "id": "a1",
        "name": "관심 직무 1:1 커피챗 인터뷰",
        "track": "career", "trackLabel": "진로 탐색",
        "category": "social", "categoryLabel": "네트워킹·커뮤니케이션",
        "cost": "under30k", "costLabel": "3만 원 이하",
        "difficulty": "easy", "difficultyLabel": "가벼운 첫 걸음",
        "reason": "막연한 직무 이미지를 실제로 그 일을 하는 사람의 하루로 바꿔 볼 수 있어요.",
        "discover": "이야기를 듣는 동안 설렜다면 그 직무를 더 파 볼 가치가 있다는 신호예요.",
        "steps": { "today": "궁금한 직무의 현직자 글이나 프로필 3개 찾아보기", "thisWeek": "대화 요청 메시지와 질문 5가지 써서 보내기", "twoWeeks": "30분 대화를 나누고 느낀 점을 한 페이지로 정리하기" },
        "nextIf": "잘 맞았다면, 같은 직무의 다른 사람 1명을 더 만나 보세요.",
        "tip": "질문을 구체적으로 준비할수록 답장 받을 확률이 높아져요."
      }
    ],
    "wellbeingConcern": false
  },
  "meta": { "generatedAt": "2026-11-23T07:30:00.000Z", "mock": false }
}
```
- `activities`는 **항상 3개**, `id`는 `a1`, `a2`, `a3`. 라벨(`...Label`)은 서버가 `content.js`로 붙입니다 (AI가 쓴 값 아님).
- `tip`은 문자열 또는 `null`.
- `profile.direction`(250자), `profile.fields`(0~3개, 이름 15자·이유 60자), `activities[].track`·`discover`(120자)·`nextIf`(120자)는 v1.1에서 추가. `direction`, `track`, `discover`, `nextIf`가 비어 있으면 그 결과/활동은 버립니다.

### 1-3. 실패 — `4xx`/`5xx`
```json
{ "ok": false, "error": { "code": "NOTE_TOO_LONG", "message": "자유 입력은 300자까지 쓸 수 있어요.", "retryable": false } }
```
모든 응답 헤더: `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store`. `405`에는 `Allow: POST`.

---

## 2. 처리 순서 (`api/recommend.js`)

1. `POST`가 아니면 `METHOD_NOT_ALLOWED`
2. `Content-Type`에 `application/json` 없으면 `INVALID_REQUEST`
3. `await request.json()` 실패, 또는 본문이 객체가 아니면 `INVALID_REQUEST`
4. `validateRequest(body)` → 실패 코드 반환
5. Mock 모드면 `mockRecommend(input)`, 아니면 `recommendActivities(input)` — `AppError`는 그 코드, 그 외는 `INTERNAL_ERROR`
6. 성공 응답

Mock 모드 = `process.env.MOCK_AI === 'true'` **그리고** `process.env.VERCEL_ENV !== 'production'`.

### 2-1. 참고 구현 — `lib/errors.js`
오류 코드·상태·문구·다시시도 표(`ERRORS`)는 `09-error-handling.md` 2·3장을 그대로 옮깁니다.

```js
export const ERRORS = {
  // 예: NOTE_TOO_LONG: { status: 400, retryable: false, message: '자유 입력은 300자까지 쓸 수 있어요.' },
  // … 09 문서 2장의 모든 서버 코드
};

// detail 은 서버 로그용 짧은 설명. 사용자 답변을 절대 넣지 않음
export class AppError extends Error {
  constructor(code, detail = '') {
    super(code);
    this.name = 'AppError';
    this.code = ERRORS[code] ? code : 'INTERNAL_ERROR';
    this.detail = detail;
  }
}

export function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export function errorResponse(code) {
  const finalCode = ERRORS[code] ? code : 'INTERNAL_ERROR';
  const { status, message, retryable } = ERRORS[finalCode];
  const extra = finalCode === 'METHOD_NOT_ALLOWED' ? { Allow: 'POST' } : {};
  return jsonResponse(status, { ok: false, error: { code: finalCode, message, retryable } }, extra);
}
```

### 2-2. 참고 구현 — `api/recommend.js`

```js
import { AppError, errorResponse, jsonResponse } from '../lib/errors.js';
import { validateRequest } from '../lib/validate.js';
import { recommendActivities } from '../lib/recommend-activities.js';
import { mockRecommend } from '../lib/mock.js';

export function isMockMode() {
  return process.env.MOCK_AI === 'true' && process.env.VERCEL_ENV !== 'production';
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return errorResponse('METHOD_NOT_ALLOWED');
    if (!(request.headers.get('content-type') ?? '').includes('application/json')) return errorResponse('INVALID_REQUEST');

    let body;
    try { body = await request.json(); } catch { return errorResponse('INVALID_REQUEST'); }

    const check = validateRequest(body);
    if (!check.ok) return errorResponse(check.code);

    const mock = isMockMode();
    try {
      const result = mock ? await mockRecommend(check.input) : await recommendActivities(check.input);
      return jsonResponse(200, { ok: true, result, meta: { generatedAt: new Date().toISOString(), mock } });
    } catch (error) {
      const code = error instanceof AppError ? error.code : 'INTERNAL_ERROR';
      const detail = error instanceof AppError ? error.detail : (error?.name ?? 'UnknownError');
      console.error(`[recommend] ${code} ${detail}`);   // 답변 내용 기록 금지
      return errorResponse(code);
    }
  },
};
```

---

## 3. 참고 구현 — `lib/validate.js`

요청 검사(`validateRequest`)와 AI 응답 정리(`normalizeAiResult`). 하나 선택 질문 목록은 `content.js`에서 자동으로 뽑으므로 질문이 바뀌어도 이 파일은 고치지 않습니다.

```js
import {
  QUESTIONS, MAX_NOTE_LENGTH, MAX_FLOW, MAX_PREVIOUS,
  CATEGORY_LABELS, COST_LABELS, DIFFICULTY_LABELS, TRACK_LABELS,
} from '../public/js/content.js';

// 하나만 고르는 질문 id 목록 (content.js에서 자동으로 뽑아서, 질문이 바뀌어도 여기를 고칠 필요 없음)
const SINGLE_IDS = QUESTIONS.filter((q) => q.type === 'single').map((q) => q.id);
const VOTES = ['hot', 'cold', 'none'];
const optionIds = (qid) => QUESTIONS.find((q) => q.id === qid).options.map((o) => o.id);

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const normalizeName = (s) => s.replace(/\s+/g, '').toLowerCase();

// 요청 검사 → { ok: true, input } | { ok: false, code }
export function validateRequest(body) {
  if (!isObject(body) || !isObject(body.answers)) return { ok: false, code: 'INVALID_REQUEST' };
  const a = body.answers;

  const flow = a.flow;
  if (!Array.isArray(flow) || flow.length < 1 || flow.length > MAX_FLOW
      || new Set(flow).size !== flow.length || !flow.every((m) => optionIds('flow').includes(m))) {
    return { ok: false, code: 'INVALID_ANSWERS' };
  }
  for (const id of SINGLE_IDS) {
    if (!optionIds(id).includes(a[id])) return { ok: false, code: 'INVALID_ANSWERS' };
  }
  const rawNote = a.note ?? '';
  if (typeof rawNote !== 'string') return { ok: false, code: 'INVALID_ANSWERS' };
  const note = rawNote.trim();
  if (note.length > MAX_NOTE_LENGTH) return { ok: false, code: 'NOTE_TOO_LONG' };

  const rawPrev = body.previous ?? [];
  if (!Array.isArray(rawPrev) || rawPrev.length > MAX_PREVIOUS) return { ok: false, code: 'INVALID_REQUEST' };
  const previous = [];
  for (const p of rawPrev) {
    if (!isObject(p) || typeof p.name !== 'string' || !VOTES.includes(p.vote)) return { ok: false, code: 'INVALID_REQUEST' };
    const name = p.name.trim();
    if (name.length < 1 || name.length > 20) return { ok: false, code: 'INVALID_REQUEST' };
    previous.push({ name, vote: p.vote });
  }

  const answers = { flow, note };
  for (const id of SINGLE_IDS) answers[id] = a[id];
  return { ok: true, input: { answers, previous } };
}

// 길이 제한: 넘으면 잘라서 '…'
function clip(value, max) {
  const s = value.trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
const isText = (v) => typeof v === 'string' && v.trim() !== '';

// AI 응답 검사·정리 → 정리된 result 또는 null
export function normalizeAiResult(raw, previous = []) {
  if (!isObject(raw) || !isObject(raw.profile) || !Array.isArray(raw.activities)) return null;
  const { typeName, summary, keywords, direction, fields } = raw.profile;
  if (!isText(typeName) || !isText(summary) || !isText(direction)) return null;

  const seen = new Set(previous.map((p) => normalizeName(p.name)));
  const activities = [];
  for (const act of raw.activities) {
    if (activities.length === 3) break;
    if (!isObject(act) || !isText(act.name) || act.name.trim().length > 20) continue;
    if (!TRACK_LABELS[act.track]) continue;
    if (!CATEGORY_LABELS[act.category] || !COST_LABELS[act.cost] || !DIFFICULTY_LABELS[act.difficulty]) continue;
    if (!isText(act.reason) || !isText(act.discover) || !isText(act.nextIf) || !isObject(act.steps)) continue;
    const { today, thisWeek, twoWeeks } = act.steps;
    if (![today, thisWeek, twoWeeks].every(isText)) continue;
    const key = normalizeName(act.name);
    if (seen.has(key)) continue;        // 이미 본 활동, 같은 응답 안의 중복 제외
    seen.add(key);
    activities.push({
      id: `a${activities.length + 1}`,
      name: act.name.trim(),
      track: act.track, trackLabel: TRACK_LABELS[act.track],
      category: act.category, categoryLabel: CATEGORY_LABELS[act.category],
      cost: act.cost, costLabel: COST_LABELS[act.cost],
      difficulty: act.difficulty, difficultyLabel: DIFFICULTY_LABELS[act.difficulty],
      reason: clip(act.reason, 150),
      discover: clip(act.discover, 120),
      steps: { today: clip(today, 80), thisWeek: clip(thisWeek, 80), twoWeeks: clip(twoWeeks, 80) },
      nextIf: clip(act.nextIf, 120),
      tip: isText(act.tip) ? clip(act.tip, 80) : null,
    });
  }
  if (activities.length < 3) return null;

  const safeKeywords = Array.isArray(keywords)
    ? [...new Set(keywords.filter(isText).map((k) => k.trim()).filter((k) => k.length <= 10))].slice(0, 3)
    : [];

  // 눈여겨볼 분야: 이름(15자)·이유(60자)가 모두 있는 것만, 이름 중복 없이 최대 3개
  const safeFields = [];
  if (Array.isArray(fields)) {
    for (const f of fields) {
      if (safeFields.length === 3) break;
      if (!isObject(f) || !isText(f.name) || !isText(f.why)) continue;
      const name = clip(f.name, 15);
      if (safeFields.some((x) => x.name === name)) continue;
      safeFields.push({ name, why: clip(f.why, 60) });
    }
  }

  return {
    profile: {
      typeName: clip(typeName, 20),
      summary: clip(summary, 100),
      keywords: safeKeywords,
      direction: clip(direction, 250),
      fields: safeFields,
    },
    activities,
    wellbeingConcern: raw.wellbeingConcern === true,
  };
}
```

---

## 4. 참고 구현 — `lib/mock.js`

목적: 키·비용 없이 모든 화면 상태를 확인. 고정된 활동 목록에서 `previous`에 있는 이름은 건너뜁니다.

- 활동 목록 `MOCK_ACTIVITIES`: 9개 (각 항목은 1-2의 활동 모양에서 `id`·라벨 제외). 에이전트 재량으로 내용을 쓰되 아래를 지킵니다.
  - 9개 이름이 모두 다르고 20자 이하, `track` 3종 모두 사용, `discover`·`nextIf` 모두 채움
- 순서: 목록을 처음부터 돌며 `previous`에 없는 것 3개 선택 → `normalizeAiResult(raw, previous)`. 3개가 안 되면 처음 3개를 고르고 `normalizeAiResult(raw, [])`로 정리.
- 유형·방향: `MOCK_PROFILE` 하나를 고정으로 씀 (`typeName`, `summary`, `keywords`, `direction`, `fields` 3개).
- `wellbeingConcern`: `note`에 `[[wellbeing]]`가 있으면 `true`.
- 오류 일부러 내기 (`note`에 포함 시): `[[timeout]]`→`AI_TIMEOUT`, `[[unavailable]]`→`AI_SERVICE_UNAVAILABLE`, `[[invalid]]`→`AI_RESPONSE_INVALID`, `[[quota]]`→`AI_QUOTA_EXCEEDED`, `[[rate]]`→`RATE_LIMITED`, `[[config]]`→`SERVER_CONFIG_ERROR`.
- 700ms 기다린 뒤 응답. 함수 이름은 `mockRecommend(input)`.

---

## 5. 구현하지 않는 것
서버 자체 요청 횟수 제한, CORS 헤더, 스트리밍, 다른 API 경로.
