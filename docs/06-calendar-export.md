# 06. 캘린더 등록 · 복사하기

> "실제로 해보게 만들기"의 핵심입니다. 해볼까는 저장을 하지 않는 대신, **계획을 사용자의 캘린더 앱에 넣어서** 알림을 캘린더가 보내게 합니다.
> `public/js/calendar.js`는 **순수 함수만** 담습니다 (`document`, `window` 사용 금지 → Node 테스트 가능).

---

## 1. 일정 내용 (고정)

| 항목 | 값 |
|---|---|
| 제목 | `[해볼까] {활동 이름} 해보기` |
| 시작 | 사용자가 고른 날짜·시간 (기본: 내일 19:00) |
| 길이 | 60분 |
| 알림 | 시작 30분 전 |
| 메모 | 아래 형식 |

메모 형식 (줄바꿈 `\n`):
```
오늘: {steps.today}
이번 주: {steps.thisWeek}
2주 안: {steps.twoWeeks}

완벽하게 말고, 일단 10분만 해봐요.
```

## 2. 참고 구현 — `public/js/calendar.js`

```js
// 캘린더 일정 파일(.ics)과 Google 캘린더 링크를 만드는 순수 함수 모음

// Date → 20261124T100000Z (UTC 기준)
export function toIcsUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// .ics 글자 규칙: \ ; , 줄바꿈은 앞에 \ 를 붙여야 함
export function escapeIcsText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// .ics 한 줄은 75바이트를 넘으면 안 됨 → 넘으면 줄을 나누고 다음 줄 맨 앞에 공백 한 칸
// 한글은 한 글자가 3바이트라서 글자 중간에서 자르지 않도록 글자 단위로 셉니다.
export function foldIcsLine(line) {
  const encoder = new TextEncoder();
  const parts = [];
  let current = '';
  let bytes = 0;
  let limit = 75;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = char;
      bytes = size;
      limit = 74; // 다음 줄은 맨 앞 공백 1바이트를 뺀 74바이트
    } else {
      current += char;
      bytes += size;
    }
  }
  parts.push(current);
  return parts.join('\r\n ');
}

export function buildEventText({ name, steps }) {
  return {
    title: `[해볼까] ${name} 해보기`,
    details: `오늘: ${steps.today}\n이번 주: ${steps.thisWeek}\n2주 안: ${steps.twoWeeks}\n\n완벽하게 말고, 일단 10분만 해봐요.`,
  };
}

// event = { name, steps, start: Date, durationMin: 60, uid: '고유값', now: Date }
export function buildIcs(event) {
  const { title, details } = buildEventText(event);
  const end = new Date(event.start.getTime() + event.durationMin * 60000);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//haebolkka//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}@haebolkka`,
    `DTSTAMP:${toIcsUtc(event.now)}`,
    `DTSTART:${toIcsUtc(event.start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(details)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(title)}`,
    'TRIGGER:-PT30M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

// Google 캘린더 "일정 추가" 화면 주소
export function buildGoogleCalendarUrl(event) {
  const { title, details } = buildEventText(event);
  const end = new Date(event.start.getTime() + event.durationMin * 60000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toIcsUtc(event.start)}/${toIcsUtc(end)}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
```

`app.js`에서 부를 때: `uid`는 `crypto.randomUUID()`, `now`는 `new Date()`, `durationMin`은 `60`.

## 3. 복사 텍스트 형식

### 결과 복사 — `buildResultText()`
```
[해볼까] 나의 유형: {typeName}
{summary}

추천 활동
1. {name} ({categoryLabel} · {costLabel})
   오늘의 첫 걸음: {steps.today}
2. …
3. …

{location.origin}
```

### 계획 복사 — `buildPlanText()`
```
[해볼까] {name} 해보기
날짜: {날짜 표시}      ← 날짜가 올바를 때만 이 줄을 넣음
1) 오늘: {steps.today}
2) 이번 주: {steps.thisWeek}
3) 2주 안: {steps.twoWeeks}
```
날짜 표시는 `new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(date)` 결과를 그대로 씁니다 (예: `2026. 11. 24. 오후 7:00`).

## 4. 지켜야 할 것
- 파일 이름은 영어 `haebolkka-plan.ics` (한글 파일명은 일부 기기에서 깨짐).
- 사용자의 **자유 입력(Q7)은 일정·링크·복사 텍스트에 넣지 않습니다.** 활동 이름과 첫 걸음만 넣습니다.
- 클립보드는 `https` 또는 `localhost`에서만 동작합니다. 실패하면 실패 문구를 보여주고 끝냅니다.
