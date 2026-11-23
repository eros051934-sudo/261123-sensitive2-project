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

export function buildResultText({ profile, activities, origin = '' }) {
  const lines = [
    `[해볼까] 나의 유형: ${profile.typeName}`,
    profile.summary,
    '',
    '추천 활동'
  ];
  activities.forEach((act, idx) => {
    lines.push(`${idx + 1}. ${act.name} (${act.categoryLabel} · ${act.costLabel})`);
    lines.push(`   오늘의 첫 걸음: ${act.steps.today}`);
  });
  if (origin) {
    lines.push('');
    lines.push(origin);
  }
  return lines.join('\n');
}

export function buildPlanText({ name, steps, date = null }) {
  const lines = [`[해볼까] ${name} 해보기`];
  if (date instanceof Date && !isNaN(date.getTime())) {
    const formatted = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    lines.push(`날짜: ${formatted}`);
  }
  lines.push(`1) 오늘: ${steps.today}`);
  lines.push(`2) 이번 주: ${steps.thisWeek}`);
  lines.push(`3) 2주 안: ${steps.twoWeeks}`);
  return lines.join('\n');
}
