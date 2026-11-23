import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/recommend.js';

const ANSWERS = {
  mood: ['create'],
  company: 'clarity',
  place: 'quiet',
  energy: 'solo_study',
  budget: 'under30k',
  time: '1to3h',
  note: ''
};

function makeRequest(body, headers = { 'content-type': 'application/json' }, method = 'POST') {
  return new Request('http://localhost:3000/api/recommend', {
    method,
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}

test('H-01: GET 요청 405 METHOD_NOT_ALLOWED', async () => {
  const req = new Request('http://localhost:3000/api/recommend', { method: 'GET' });
  const res = await handler.fetch(req);
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'POST');
  const data = await res.json();
  assert.equal(data.error.code, 'METHOD_NOT_ALLOWED');
});

test('H-02: 깨진 JSON / text/plain', async () => {
  const req = new Request('http://localhost:3000/api/recommend', {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: 'hello'
  });
  const res = await handler.fetch(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error.code, 'INVALID_REQUEST');
});

test('H-03: mood 빈 배열 400 INVALID_ANSWERS retryable false', async () => {
  const req = makeRequest({ answers: { ...ANSWERS, mood: [] } });
  const res = await handler.fetch(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error.code, 'INVALID_ANSWERS');
  assert.equal(data.error.retryable, false);
});

test('H-04: 정상 Mock 추천 200', async () => {
  process.env.MOCK_AI = 'true';
  delete process.env.VERCEL_ENV;
  const req = makeRequest({ answers: ANSWERS });
  const res = await handler.fetch(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.result.activities.length, 3);
  assert.equal(data.meta.mock, true);
});

test('H-05: 정상 + previous 3개', async () => {
  process.env.MOCK_AI = 'true';
  delete process.env.VERCEL_ENV;
  const res1 = await handler.fetch(makeRequest({ answers: ANSWERS }));
  const data1 = await res1.json();
  const prevNames = data1.result.activities.map((a) => ({ name: a.name, vote: 'hot' }));

  const res2 = await handler.fetch(makeRequest({ answers: ANSWERS, previous: prevNames }));
  const data2 = await res2.json();
  const newNames = data2.result.activities.map((a) => a.name);
  for (const p of prevNames) {
    assert.ok(!newNames.includes(p.name));
  }
});

test('H-06: [[timeout]] 에러', async () => {
  process.env.MOCK_AI = 'true';
  delete process.env.VERCEL_ENV;
  const req = makeRequest({ answers: { ...ANSWERS, note: '[[timeout]]' } });
  const res = await handler.fetch(req);
  assert.equal(res.status, 504);
  const data = await res.json();
  assert.equal(data.error.code, 'AI_TIMEOUT');
  assert.equal(data.error.retryable, true);
});

test('H-07: [[quota]] 에러', async () => {
  process.env.MOCK_AI = 'true';
  delete process.env.VERCEL_ENV;
  const req = makeRequest({ answers: { ...ANSWERS, note: '[[quota]]' } });
  const res = await handler.fetch(req);
  assert.equal(res.status, 503);
  const data = await res.json();
  assert.equal(data.error.code, 'AI_QUOTA_EXCEEDED');
  assert.equal(data.error.retryable, false);
});

test('H-08: [[wellbeing]] 에러 및 감지', async () => {
  process.env.MOCK_AI = 'true';
  delete process.env.VERCEL_ENV;
  const req = makeRequest({ answers: { ...ANSWERS, note: '[[wellbeing]]' } });
  const res = await handler.fetch(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.result.wellbeingConcern, true);
});

test('H-09: MOCK_AI=false 키 없음 SERVER_CONFIG_ERROR', async () => {
  process.env.MOCK_AI = 'false';
  delete process.env.OPENAI_API_KEY;
  delete process.env.VERCEL_ENV;
  const req = makeRequest({ answers: ANSWERS });
  const res = await handler.fetch(req);
  assert.equal(res.status, 500);
  const data = await res.json();
  assert.equal(data.error.code, 'SERVER_CONFIG_ERROR');
});

test('H-10: MOCK_AI=true VERCEL_ENV=production 키 없음 SERVER_CONFIG_ERROR', async () => {
  process.env.MOCK_AI = 'true';
  process.env.VERCEL_ENV = 'production';
  delete process.env.OPENAI_API_KEY;
  const req = makeRequest({ answers: ANSWERS });
  const res = await handler.fetch(req);
  assert.equal(res.status, 500);
  const data = await res.json();
  assert.equal(data.error.code, 'SERVER_CONFIG_ERROR');
});
