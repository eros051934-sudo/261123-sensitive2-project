import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toIcsUtc,
  escapeIcsText,
  foldIcsLine,
  buildIcs,
  buildGoogleCalendarUrl,
  buildEventText,
} from '../public/js/calendar.js';

const mockEvent = {
  name: '뜨개질 컵받침 만들기',
  steps: {
    today: '코바늘과 실 고르기',
    thisWeek: '사슬뜨기 연습하기',
    twoWeeks: '첫 컵받침 완성하기'
  },
  start: new Date('2026-11-24T10:00:00Z'),
  durationMin: 60,
  uid: 'test-uuid-1234',
  now: new Date('2026-11-23T10:00:00Z')
};

test('C-01: toIcsUtc', () => {
  const d = new Date('2026-11-24T10:00:00Z');
  assert.equal(toIcsUtc(d), '20261124T100000Z');
});

test('C-02: escapeIcsText', () => {
  assert.equal(escapeIcsText('a,b;c\\d\ne'), 'a\\,b\\;c\\\\d\\ne');
});

test('C-03: foldIcsLine 75바이트 이하 분할 및 복원', () => {
  const line = 'SUMMARY:' + '가'.repeat(60);
  const folded = foldIcsLine(line);
  const lines = folded.split('\r\n');
  const encoder = new TextEncoder();
  assert.ok(encoder.encode(lines[0]).length <= 75);
  for (let i = 1; i < lines.length; i++) {
    assert.ok(lines[i].startsWith(' '));
    assert.ok(encoder.encode(lines[i]).length <= 75);
  }
  const restored = lines.map((l, i) => (i === 0 ? l : l.slice(1))).join('');
  assert.equal(restored, line);
});

test('C-04: buildIcs 구조 확인', () => {
  const ics = buildIcs(mockEvent);
  assert.ok(ics.startsWith('BEGIN:VCALENDAR'));
  assert.ok(ics.endsWith('\r\n'));
  assert.ok(ics.includes('DTSTART:20261124T100000Z'));
  assert.ok(ics.includes('DTEND:20261124T110000Z')); // 60분 차이
  assert.ok(ics.includes('TRIGGER:-PT30M'));
});

test('C-05: buildGoogleCalendarUrl', () => {
  const url = buildGoogleCalendarUrl(mockEvent);
  assert.ok(url.startsWith('https://calendar.google.com/calendar/render?'));
  assert.ok(url.includes('action=TEMPLATE'));
  assert.ok(url.includes('dates=20261124T100000Z%2F20261124T110000Z'));
});

test('C-06: 확인할 것·다음 단계가 있으면 일정 메모에 들어감', () => {
  const { details } = buildEventText({ ...mockEvent, discover: '즐거웠다면 손으로 만드는 일이 맞아요.', nextIf: '잘 맞았다면, 코스터 세트를 만들어 보세요.' });
  assert.ok(details.includes('확인할 것: 즐거웠다면 손으로 만드는 일이 맞아요.'));
  assert.ok(details.includes('다음 단계: 잘 맞았다면, 코스터 세트를 만들어 보세요.'));
  assert.ok(details.endsWith('완벽하게 말고, 일단 10분만 해봐요.'));
});

test('C-07: 확인할 것·다음 단계가 없으면 예전 메모 형식 그대로', () => {
  const { details } = buildEventText(mockEvent);
  assert.equal(details, '오늘: 코바늘과 실 고르기\n이번 주: 사슬뜨기 연습하기\n2주 안: 첫 컵받침 완성하기\n\n완벽하게 말고, 일단 10분만 해봐요.');
});
