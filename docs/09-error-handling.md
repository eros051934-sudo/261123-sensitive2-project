# 09. 오류 처리 (오류 코드 · 오류 메시지 정본)

> 서버(`lib/errors.js`)와 브라우저(`app.js`)는 이 표를 그대로 옮겨 씁니다. 문구를 바꾸려면 먼저 질문합니다.

## 1. 원칙
1. 사용자가 **다음에 무엇을 하면 되는지** 알려주는 해요체 문장.
2. 기술 용어(500, JSON, API 키 등)를 화면에 보이지 않음.
3. 오류는 **진한 노랑(`--caution`) 아이콘·왼쪽 띠 + 일반 글자색**. 빨강·초록(투표 방향 색) 금지.
4. 다시 시도해서 나아질 수 있는 오류에만 '다시 시도' 버튼.
5. 표시 위치: 자유 입력 오류 → 입력창 아래 / 첫 추천 실패 → 오류 화면(`#view-error`) / 다른 추천 실패 → 결과 화면 안(`#result-inline-error`) / 날짜 오류 → 날짜 입력 아래.

## 2·3. 서버 오류 코드와 문구

| 코드 | HTTP | 다시 시도 | 언제 | 문구 |
|---|---|---|---|---|
| `METHOD_NOT_ALLOWED` | 405 | ✗ | POST가 아닌 요청 | 지원하지 않는 요청 방식이에요. |
| `INVALID_REQUEST` | 400 | ✗ | JSON·형식 오류, previous 오류 | 요청 형식이 올바르지 않아요. 페이지를 새로고침한 뒤 다시 시도해 주세요. |
| `INVALID_ANSWERS` | 400 | ✗ | 빠진 답, 없는 선택지 | 답하지 않은 질문이 있어요. 처음부터 다시 답해 주세요. |
| `NOTE_TOO_LONG` | 400 | ✗ | 자유 입력 300자 초과 | 자유 입력은 300자까지 쓸 수 있어요. |
| `RATE_LIMITED` | 429 | ○ | OpenAI 요청 과다 | 요청이 많아 잠시 처리할 수 없어요. 잠시 후 다시 시도해 주세요. |
| `SERVER_CONFIG_ERROR` | 500 | ✗ | 키 없음·틀림, 모델 없음 | 서비스 설정에 문제가 있어요. 관리자에게 문의해 주세요. |
| `INTERNAL_ERROR` | 500 | ○ | 예상 못 한 오류 | 알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요. |
| `AI_RESPONSE_INVALID` | 502 | ○ | AI 응답 끊김·형식 오류·활동 3개 미만 | 추천을 제대로 만들지 못했어요. 다시 시도해 주세요. |
| `AI_SERVICE_UNAVAILABLE` | 503 | ○ | OpenAI 연결 실패·장애 | AI 서비스에 연결할 수 없어요. 잠시 후 다시 시도해 주세요. |
| `AI_QUOTA_EXCEEDED` | 503 | ✗ | OpenAI 잔액·한도 소진 | 서비스 사용 한도를 초과했어요. 관리자에게 문의해 주세요. |
| `AI_TIMEOUT` | 504 | ○ | OpenAI 25초 초과 | AI 응답이 너무 오래 걸려요. 다시 시도해 주세요. |

## 4. 브라우저 전용 코드

| 코드 | 다시 시도 | 언제 | 문구 |
|---|---|---|---|
| `NETWORK_ERROR` | ○ | `fetch` 실패 | 인터넷 연결을 확인한 뒤 다시 시도해 주세요. |
| `CLIENT_TIMEOUT` | ○ | 35초 응답 없음 | 응답 시간이 초과됐어요. 다시 시도해 주세요. |
| `UNKNOWN_ERROR` | ○ | JSON 아님, 응답 모양 이상 | 알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요. |

화면 전용 문구(오류 코드 아님): 날짜 "날짜와 시간을 모두 골라 주세요." / "지난 시간은 고를 수 없어요.", 복사 "복사하지 못했어요. 직접 선택해서 복사해 주세요."

## 5. 브라우저 코드에 옮길 값

```js
// 위 표의 문구를 그대로 옮긴 예비용 표 (서버가 message를 주면 그것을 먼저 씀)
const ERROR_MESSAGES = {
  METHOD_NOT_ALLOWED: '지원하지 않는 요청 방식이에요.',
  INVALID_REQUEST: '요청 형식이 올바르지 않아요. 페이지를 새로고침한 뒤 다시 시도해 주세요.',
  INVALID_ANSWERS: '답하지 않은 질문이 있어요. 처음부터 다시 답해 주세요.',
  NOTE_TOO_LONG: '자유 입력은 300자까지 쓸 수 있어요.',
  RATE_LIMITED: '요청이 많아 잠시 처리할 수 없어요. 잠시 후 다시 시도해 주세요.',
  SERVER_CONFIG_ERROR: '서비스 설정에 문제가 있어요. 관리자에게 문의해 주세요.',
  INTERNAL_ERROR: '알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
  AI_RESPONSE_INVALID: '추천을 제대로 만들지 못했어요. 다시 시도해 주세요.',
  AI_SERVICE_UNAVAILABLE: 'AI 서비스에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.',
  AI_QUOTA_EXCEEDED: '서비스 사용 한도를 초과했어요. 관리자에게 문의해 주세요.',
  AI_TIMEOUT: 'AI 응답이 너무 오래 걸려요. 다시 시도해 주세요.',
  NETWORK_ERROR: '인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
  CLIENT_TIMEOUT: '응답 시간이 초과됐어요. 다시 시도해 주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
};
const RETRYABLE_CODES = ['RATE_LIMITED', 'INTERNAL_ERROR', 'AI_RESPONSE_INVALID', 'AI_SERVICE_UNAVAILABLE', 'AI_TIMEOUT', 'NETWORK_ERROR', 'CLIENT_TIMEOUT', 'UNKNOWN_ERROR'];
```

문구 고르는 순서: 서버 `error.message` → `ERROR_MESSAGES[code]` → `UNKNOWN_ERROR`. 다시 시도 여부: 서버 `retryable`(boolean) → `RETRYABLE_CODES`.

## 6. 관리자용 원인 찾기 (Vercel → Logs에서 `[recommend]` 검색)

| 로그 | 원인 | 해결 |
|---|---|---|
| `SERVER_CONFIG_ERROR OPENAI_API_KEY missing` | 키 미등록 | 환경변수 등록 후 Redeploy |
| `SERVER_CONFIG_ERROR openai status=401` | 키 틀림·삭제 | 새 키로 교체 후 Redeploy |
| `SERVER_CONFIG_ERROR openai status=404` | 모델 ID 없음 | OpenAI 모델 문서 확인 → `OPENAI_MODEL` 수정 |
| `AI_QUOTA_EXCEEDED ... insufficient_quota` | 잔액·한도 소진 | OpenAI Billing 확인 |
| `AI_RESPONSE_INVALID normalize failed`가 자주 | AI가 규칙에 맞는 활동 3개를 못 만듦 | 사용자에게 보고 (프롬프트 임의 수정 금지) |
