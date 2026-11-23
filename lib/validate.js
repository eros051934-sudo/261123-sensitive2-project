import {
  QUESTIONS, MAX_NOTE_LENGTH, MAX_MOOD, MAX_PREVIOUS,
  CATEGORY_LABELS, COST_LABELS, DIFFICULTY_LABELS,
} from '../public/js/content.js';

const SINGLE_IDS = ['company', 'place', 'energy', 'budget', 'time'];
const VOTES = ['hot', 'cold', 'none'];
const optionIds = (qid) => QUESTIONS.find((q) => q.id === qid).options.map((o) => o.id);

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const normalizeName = (s) => s.replace(/\s+/g, '').toLowerCase();

// 요청 검사 → { ok: true, input } | { ok: false, code }
export function validateRequest(body) {
  if (!isObject(body) || !isObject(body.answers)) return { ok: false, code: 'INVALID_REQUEST' };
  const a = body.answers;

  const mood = a.mood;
  if (!Array.isArray(mood) || mood.length < 1 || mood.length > MAX_MOOD
      || new Set(mood).size !== mood.length || !mood.every((m) => optionIds('mood').includes(m))) {
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

  const answers = { mood, note };
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
  const { typeName, summary, keywords } = raw.profile;
  if (!isText(typeName) || !isText(summary)) return null;

  const seen = new Set(previous.map((p) => normalizeName(p.name)));
  const activities = [];
  for (const act of raw.activities) {
    if (activities.length === 3) break;
    if (!isObject(act) || !isText(act.name) || act.name.trim().length > 20) continue;
    if (!CATEGORY_LABELS[act.category] || !COST_LABELS[act.cost] || !DIFFICULTY_LABELS[act.difficulty]) continue;
    if (!isText(act.reason) || !isObject(act.steps)) continue;
    const { today, thisWeek, twoWeeks } = act.steps;
    if (![today, thisWeek, twoWeeks].every(isText)) continue;
    const key = normalizeName(act.name);
    if (seen.has(key)) continue;        // 이미 본 활동, 같은 응답 안의 중복 제외
    seen.add(key);
    activities.push({
      id: `a${activities.length + 1}`,
      name: act.name.trim(),
      category: act.category, categoryLabel: CATEGORY_LABELS[act.category],
      cost: act.cost, costLabel: COST_LABELS[act.cost],
      difficulty: act.difficulty, difficultyLabel: DIFFICULTY_LABELS[act.difficulty],
      reason: clip(act.reason, 150),
      steps: { today: clip(today, 80), thisWeek: clip(thisWeek, 80), twoWeeks: clip(twoWeeks, 80) },
      tip: isText(act.tip) ? clip(act.tip, 80) : null,
    });
  }
  if (activities.length < 3) return null;

  const safeKeywords = Array.isArray(keywords)
    ? [...new Set(keywords.filter(isText).map((k) => k.trim()).filter((k) => k.length <= 10))].slice(0, 3)
    : [];

  return {
    profile: { typeName: clip(typeName, 20), summary: clip(summary, 100), keywords: safeKeywords },
    activities,
    wellbeingConcern: raw.wellbeingConcern === true,
  };
}
