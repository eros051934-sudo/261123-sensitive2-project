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
