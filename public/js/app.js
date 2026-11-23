import { QUESTIONS, MAX_NOTE_LENGTH, MAX_MOOD, MAX_PREVIOUS, STEP_LABELS } from './content.js';
import { buildIcs, buildGoogleCalendarUrl, buildResultText as buildCalendarResultText, buildPlanText as buildCalendarPlanText } from './calendar.js';

const API_URL = '/api/recommend';
const REQUEST_TIMEOUT_MS = 35000;
const LOADING_MESSAGE_MS = 2500;
const EVENT_DURATION_MIN = 60;

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

const RETRYABLE_CODES = [
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'AI_RESPONSE_INVALID',
  'AI_SERVICE_UNAVAILABLE',
  'AI_TIMEOUT',
  'NETWORK_ERROR',
  'CLIENT_TIMEOUT',
  'UNKNOWN_ERROR'
];

const LOADING_MESSAGES = [
  '답변을 살펴보고 있어요',
  '끌릴 만한 활동을 고르고 있어요',
  '첫 걸음을 작게 쪼개고 있어요'
];

const state = {
  view: 'intro',
  step: 0,
  answers: { mood: [], company: null, place: null, energy: null, budget: null, time: null, note: '' },
  profile: null,
  activities: [],
  votes: {},
  seen: [],
  selected: null,
  busy: false,
};

let loadingInterval = null;

export function showView(name) {
  state.view = name;
  const views = ['intro', 'quiz', 'loading', 'error', 'result', 'plan'];
  for (const v of views) {
    const el = document.getElementById(`view-${v}`);
    if (el) el.hidden = (v !== name);
  }

  document.body.dataset.theme = (name === 'plan') ? 'light' : 'dark';
  window.scrollTo(0, 0);

  const titleIds = {
    intro: 'intro-title',
    quiz: 'quiz-title',
    loading: 'loading-title',
    error: 'error-title',
    result: 'result-title',
    plan: 'plan-title'
  };

  const targetTitle = document.getElementById(titleIds[name]);
  if (targetTitle) {
    targetTitle.focus();
  }
}

export function renderQuestion() {
  const q = QUESTIONS[state.step];
  const stepEl = document.getElementById('quiz-step');
  const progressEl = document.getElementById('quiz-progress');
  const progressFillEl = document.getElementById('quiz-progress-fill');
  const titleEl = document.getElementById('quiz-title');
  const hintEl = document.getElementById('quiz-hint');
  const optionsEl = document.getElementById('quiz-options');
  const noteFieldEl = document.getElementById('quiz-note-field');
  const noteEl = document.getElementById('quiz-note');
  const noteCountEl = document.getElementById('note-count');
  const noteErrorEl = document.getElementById('note-error');

  stepEl.textContent = `${state.step + 1} / 7`;
  progressEl.setAttribute('aria-valuenow', String(state.step + 1));
  progressFillEl.style.width = `${((state.step + 1) / 7) * 100}%`;

  titleEl.textContent = q.title;
  hintEl.textContent = q.hint;

  if (q.type === 'text') {
    optionsEl.hidden = true;
    optionsEl.replaceChildren();
    noteFieldEl.hidden = false;
    noteEl.value = state.answers.note || '';
    noteEl.placeholder = q.placeholder;
    const len = (state.answers.note || '').trim().length;
    noteCountEl.textContent = `${len} / 300자`;
    noteCountEl.classList.toggle('counter--over', len > MAX_NOTE_LENGTH);
    noteErrorEl.hidden = len <= MAX_NOTE_LENGTH;
    if (len > MAX_NOTE_LENGTH) {
      noteErrorEl.textContent = '자유 입력은 300자까지 쓸 수 있어요.';
      noteEl.setAttribute('aria-invalid', 'true');
    } else {
      noteEl.removeAttribute('aria-invalid');
    }
  } else {
    noteFieldEl.hidden = true;
    optionsEl.hidden = false;
    optionsEl.replaceChildren();

    optionsEl.className = q.style === 'tile' ? 'options options--tiles' : 'options';

    const isMulti = q.type === 'multi';
    const currentVal = state.answers[q.id];

    for (const opt of q.options) {
      const input = document.createElement('input');
      input.type = isMulti ? 'checkbox' : 'radio';
      input.name = q.id;
      input.value = opt.id;
      input.id = `opt-${q.id}-${opt.id}`;
      input.className = 'visually-hidden quiz-option-input';

      const isChecked = isMulti
        ? Array.isArray(currentVal) && currentVal.includes(opt.id)
        : currentVal === opt.id;
      input.checked = isChecked;

      input.addEventListener('change', () => handleOptionChange(q, input));

      const label = document.createElement('label');
      label.htmlFor = input.id;
      label.className = `option-label option-label--${q.style}`;

      if (q.style === 'tile') {
        const titleSpan = document.createElement('span');
        titleSpan.className = 'tile-title';
        titleSpan.textContent = opt.label;

        const descSpan = document.createElement('span');
        descSpan.className = 'tile-desc';
        descSpan.textContent = opt.description;

        label.appendChild(titleSpan);
        label.appendChild(descSpan);
      } else {
        label.textContent = opt.label;
      }

      optionsEl.appendChild(input);
      optionsEl.appendChild(label);
    }

    if (isMulti) {
      updateMultiOptionsDisabled(q);
    }
  }

  updateNextButton();
}

function updateMultiOptionsDisabled(q) {
  const optionsEl = document.getElementById('quiz-options');
  const inputs = Array.from(optionsEl.querySelectorAll('input[type="checkbox"]'));
  const checked = inputs.filter((i) => i.checked);
  const maxReached = checked.length >= MAX_MOOD;

  for (const input of inputs) {
    if (!input.checked) {
      input.disabled = maxReached;
    } else {
      input.disabled = false;
    }
  }
}

export function handleOptionChange(q, input) {
  if (q.type === 'multi') {
    let arr = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];
    if (input.checked) {
      if (!arr.includes(input.value) && arr.length < MAX_MOOD) {
        arr.push(input.value);
      }
    } else {
      arr = arr.filter((v) => v !== input.value);
    }
    state.answers[q.id] = arr;
    updateMultiOptionsDisabled(q);
  } else {
    state.answers[q.id] = input.value;
  }
  updateNextButton();
}

export function handleNoteInput(e) {
  const value = e.target.value;
  state.answers.note = value;
  const len = value.trim().length;
  const noteCountEl = document.getElementById('note-count');
  const noteErrorEl = document.getElementById('note-error');

  noteCountEl.textContent = `${len} / 300자`;
  if (len > MAX_NOTE_LENGTH) {
    noteCountEl.classList.add('counter--over');
    noteErrorEl.hidden = false;
    noteErrorEl.textContent = '자유 입력은 300자까지 쓸 수 있어요.';
    e.target.setAttribute('aria-invalid', 'true');
  } else {
    noteCountEl.classList.remove('counter--over');
    noteErrorEl.hidden = true;
    noteErrorEl.textContent = '';
    e.target.removeAttribute('aria-invalid');
  }
  updateNextButton();
}

export function updateNextButton() {
  const q = QUESTIONS[state.step];
  const nextBtn = document.getElementById('quiz-next');

  if (q.type === 'multi') {
    const val = state.answers[q.id];
    nextBtn.disabled = !Array.isArray(val) || val.length === 0;
    nextBtn.textContent = '다음';
  } else if (q.type === 'single') {
    nextBtn.disabled = !state.answers[q.id];
    nextBtn.textContent = '다음';
  } else if (q.type === 'text') {
    const len = (state.answers.note || '').trim().length;
    nextBtn.disabled = len > MAX_NOTE_LENGTH;
    nextBtn.textContent = (state.answers.note || '').trim() ? '추천 받기' : '건너뛰고 추천 받기';
  }
}

export function goNext(e) {
  if (e) e.preventDefault();
  if (state.step < 6) {
    state.step += 1;
    renderQuestion();
    document.getElementById('quiz-title').focus();
  } else {
    requestFirstRecommendation();
  }
}

export function goPrev() {
  if (state.step === 0) {
    showView('intro');
  } else {
    state.step -= 1;
    renderQuestion();
    document.getElementById('quiz-title').focus();
  }
}

export async function requestFirstRecommendation() {
  if (state.busy) return;
  state.busy = true;

  state.seen = [];
  state.votes = {};
  state.profile = null;

  showView('loading');
  startLoadingMessages();

  const srStatus = document.getElementById('sr-status');
  if (srStatus) srStatus.textContent = '추천을 만들고 있어요';

  try {
    const data = await callApi({ answers: state.answers, previous: [] });
    state.profile = data.result.profile;
    state.activities = data.result.activities;
    addToSeen(state.activities);
    renderResult(data);
    showView('result');
    if (srStatus) srStatus.textContent = `추천 3개가 도착했어요. 나의 유형은 ${data.result.profile.typeName}이에요.`;
  } catch (error) {
    renderErrorView(error);
    showView('error');
  } finally {
    stopLoadingMessages();
    state.busy = false;
  }
}

export async function requestMoreRecommendation() {
  if (state.busy) return;
  state.busy = true;

  const moreLoading = document.getElementById('more-loading');
  const inlineError = document.getElementById('result-inline-error');
  const moreBtn = document.getElementById('more-button');
  const copyBtn = document.getElementById('copy-result-button');
  const chooseBtns = document.querySelectorAll('.activity-card .js-choose');

  moreLoading.hidden = false;
  inlineError.hidden = true;
  moreBtn.disabled = true;
  copyBtn.disabled = true;
  chooseBtns.forEach((b) => (b.disabled = true));

  const previous = state.seen.map((item) => ({
    name: item.name,
    vote: state.votes[item.id] || item.vote || 'none'
  }));

  try {
    const data = await callApi({ answers: state.answers, previous });
    state.activities = data.result.activities;
    state.votes = {};
    addToSeen(state.activities);
    renderActivities();
    const srStatus = document.getElementById('sr-status');
    if (srStatus) srStatus.textContent = '새로운 추천 3개가 도착했어요.';
  } catch (error) {
    inlineError.hidden = false;
    const msgEl = document.getElementById('result-inline-message');
    const retryBtn = document.getElementById('result-retry');
    const msg = error.message || ERROR_MESSAGES[error.code] || ERROR_MESSAGES.UNKNOWN_ERROR;
    msgEl.textContent = msg;
    retryBtn.hidden = !error.retryable;
  } finally {
    moreLoading.hidden = true;
    moreBtn.disabled = false;
    copyBtn.disabled = false;
    document.querySelectorAll('.activity-card .js-choose').forEach((b) => (b.disabled = false));
    state.busy = false;
  }
}

export async function callApi(body) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw { code: 'CLIENT_TIMEOUT', message: ERROR_MESSAGES.CLIENT_TIMEOUT, retryable: true };
    }
    throw { code: 'NETWORK_ERROR', message: ERROR_MESSAGES.NETWORK_ERROR, retryable: true };
  } finally {
    clearTimeout(timeoutId);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw { code: 'UNKNOWN_ERROR', message: ERROR_MESSAGES.UNKNOWN_ERROR, retryable: true };
  }

  if (!data || data.ok !== true) {
    const errCode = data?.error?.code || 'UNKNOWN_ERROR';
    const msg = data?.error?.message || ERROR_MESSAGES[errCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
    const retryable = typeof data?.error?.retryable === 'boolean' ? data.error.retryable : RETRYABLE_CODES.includes(errCode);
    throw { code: errCode, message: msg, retryable };
  }

  if (!isValidResult(data.result)) {
    throw { code: 'UNKNOWN_ERROR', message: ERROR_MESSAGES.UNKNOWN_ERROR, retryable: true };
  }

  return data;
}

export function isValidResult(result) {
  if (!result || typeof result !== 'object') return false;
  if (!result.profile || typeof result.profile.typeName !== 'string') return false;
  if (!Array.isArray(result.activities) || result.activities.length !== 3) return false;
  for (const a of result.activities) {
    if (!a.id || !a.name || !a.steps) return false;
    if (!a.steps.today || !a.steps.thisWeek || !a.steps.twoWeeks) return false;
  }
  return true;
}

export function addToSeen(list) {
  for (const act of list) {
    state.seen.push({ id: act.id, name: act.name, vote: 'none' });
  }
  while (state.seen.length > MAX_PREVIOUS) {
    state.seen.shift();
  }
}

export function renderResult(data) {
  const profile = data.result.profile;
  document.getElementById('type-name').textContent = profile.typeName;
  document.getElementById('type-summary').textContent = profile.summary;

  const kwList = document.getElementById('type-keywords');
  kwList.replaceChildren();
  if (Array.isArray(profile.keywords)) {
    for (const kw of profile.keywords) {
      const li = document.createElement('li');
      li.textContent = kw;
      kwList.appendChild(li);
    }
  }

  const wellbeingNotice = document.getElementById('wellbeing-notice');
  wellbeingNotice.hidden = !(data.result.wellbeingConcern === true);

  const mockBadge = document.getElementById('mock-badge');
  mockBadge.hidden = !(data.meta?.mock === true);

  renderActivities();
}

export function renderActivities() {
  const listEl = document.getElementById('activity-list');
  listEl.replaceChildren();

  const tmpl = document.getElementById('activity-template');

  for (const act of state.activities) {
    const clone = tmpl.content.cloneNode(true);
    const li = clone.querySelector('.activity-card');
    li.dataset.id = act.id;

    const vote = state.votes[act.id] || 'none';
    li.dataset.vote = vote;

    const nameEl = clone.querySelector('.js-name');
    nameEl.textContent = act.name;
    nameEl.id = `name-${act.id}`;
    li.setAttribute('aria-labelledby', nameEl.id);

    clone.querySelector('.js-category').textContent = act.categoryLabel;
    clone.querySelector('.js-difficulty').textContent = act.difficultyLabel;
    clone.querySelector('.js-cost').textContent = act.costLabel;
    clone.querySelector('.js-reason').textContent = act.reason;
    clone.querySelector('.js-today').textContent = act.steps.today;

    const tipEl = clone.querySelector('.js-tip');
    if (act.tip) {
      tipEl.textContent = `팁 · ${act.tip}`;
      tipEl.hidden = false;
    } else {
      tipEl.hidden = true;
    }

    const voteUpBtn = clone.querySelector('.js-vote-up');
    const voteDownBtn = clone.querySelector('.js-vote-down');
    voteUpBtn.setAttribute('aria-pressed', String(vote === 'hot'));
    voteDownBtn.setAttribute('aria-pressed', String(vote === 'cold'));

    voteUpBtn.addEventListener('click', () => handleVote(act.id, 'hot'));
    voteDownBtn.addEventListener('click', () => handleVote(act.id, 'cold'));

    const chooseBtn = clone.querySelector('.js-choose');
    chooseBtn.addEventListener('click', () => openPlan(act));

    listEl.appendChild(clone);
  }
}

export function handleVote(actId, type) {
  const current = state.votes[actId] || 'none';
  const next = current === type ? 'none' : type;
  state.votes[actId] = next;

  const card = document.querySelector(`.activity-card[data-id="${actId}"]`);
  if (!card) return;

  card.dataset.vote = next;
  const upBtn = card.querySelector('.js-vote-up');
  const downBtn = card.querySelector('.js-vote-down');

  upBtn.setAttribute('aria-pressed', String(next === 'hot'));
  downBtn.setAttribute('aria-pressed', String(next === 'cold'));
}

export function openPlan(activity) {
  state.selected = activity;
  const planTitle = document.getElementById('plan-title');
  planTitle.textContent = `${activity.name}, 이렇게 시작해요`;

  const stepsList = document.getElementById('plan-steps');
  stepsList.replaceChildren();

  const stepKeys = ['today', 'thisWeek', 'twoWeeks'];
  stepKeys.forEach((key) => {
    const li = document.createElement('li');
    li.className = 'checklist__item';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.id = `step-chk-${key}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'checklist__content';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'checklist__step-name';
    labelSpan.textContent = STEP_LABELS[key];

    const textSpan = document.createElement('span');
    textSpan.className = 'checklist__step-text';
    textSpan.textContent = activity.steps[key];

    contentDiv.appendChild(labelSpan);
    contentDiv.appendChild(textSpan);

    li.appendChild(chk);
    li.appendChild(contentDiv);
    stepsList.appendChild(li);
  });

  const planTip = document.getElementById('plan-tip');
  if (activity.tip) {
    planTip.textContent = `팁 · ${activity.tip}`;
    planTip.hidden = false;
  } else {
    planTip.hidden = true;
  }

  // 날짜·시간 기본값: 내일 19:00
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 0, 0);

  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const dateInput = document.getElementById('plan-date');
  const timeInput = document.getElementById('plan-time');

  dateInput.value = `${yyyy}-${mm}-${dd}`;
  dateInput.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  timeInput.value = '19:00';

  document.getElementById('plan-time-error').hidden = true;
  updateGoogleLink();

  showView('plan');
}

export function readPlanDate() {
  const dateVal = document.getElementById('plan-date').value;
  const timeVal = document.getElementById('plan-time').value;
  const errEl = document.getElementById('plan-time-error');

  if (!dateVal || !timeVal) {
    errEl.hidden = false;
    errEl.textContent = '날짜와 시간을 모두 골라 주세요.';
    return null;
  }

  const d = new Date(`${dateVal}T${timeVal}`);
  if (isNaN(d.getTime())) {
    errEl.hidden = false;
    errEl.textContent = '날짜와 시간을 모두 골라 주세요.';
    return null;
  }

  if (d.getTime() < Date.now()) {
    errEl.hidden = false;
    errEl.textContent = '지난 시간은 고를 수 없어요.';
    return null;
  }

  errEl.hidden = true;
  errEl.textContent = '';
  return d;
}

export function updateGoogleLink() {
  const gcalLink = document.getElementById('gcal-link');
  const date = readPlanDate();
  if (!date || !state.selected) {
    gcalLink.href = '#';
    return;
  }
  gcalLink.href = buildGoogleCalendarUrl({
    name: state.selected.name,
    steps: state.selected.steps,
    start: date,
    durationMin: EVENT_DURATION_MIN
  });
}

export function downloadIcs() {
  const date = readPlanDate();
  if (!date || !state.selected) return;

  const icsString = buildIcs({
    name: state.selected.name,
    steps: state.selected.steps,
    start: date,
    durationMin: EVENT_DURATION_MIN,
    uid: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    now: new Date()
  });

  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'haebolkka-plan.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyText(text, statusEl) {
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = '복사했어요. 원하는 곳에 붙여 넣으세요.';
  } catch {
    statusEl.textContent = '복사하지 못했어요. 직접 선택해서 복사해 주세요.';
  }
  setTimeout(() => {
    statusEl.textContent = '';
  }, 3000);
}

export function buildResultText() {
  if (!state.profile || !state.activities) return '';
  return buildCalendarResultText({
    profile: state.profile,
    activities: state.activities,
    origin: window.location.origin
  });
}

export function buildPlanText() {
  if (!state.selected) return '';
  const date = readPlanDate();
  return buildCalendarPlanText({
    name: state.selected.name,
    steps: state.selected.steps,
    date
  });
}

export function startLoadingMessages() {
  let idx = 0;
  const msgEl = document.getElementById('loading-message');
  msgEl.textContent = LOADING_MESSAGES[0];
  stopLoadingMessages();
  loadingInterval = setInterval(() => {
    idx = (idx + 1) % LOADING_MESSAGES.length;
    msgEl.textContent = LOADING_MESSAGES[idx];
  }, LOADING_MESSAGE_MS);
}

export function stopLoadingMessages() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
}

export function renderErrorView(error) {
  const msgEl = document.getElementById('error-message');
  const retryBtn = document.getElementById('error-retry');
  const msg = error.message || ERROR_MESSAGES[error.code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  msgEl.textContent = msg;
  retryBtn.hidden = !error.retryable;
}

export function restart() {
  state.step = 0;
  state.answers = { mood: [], company: null, place: null, energy: null, budget: null, time: null, note: '' };
  state.profile = null;
  state.activities = [];
  state.votes = {};
  state.seen = [];
  state.selected = null;
  state.busy = false;
  showView('intro');
}

export function init() {
  document.getElementById('start-button').addEventListener('click', () => {
    state.answers = { mood: [], company: null, place: null, energy: null, budget: null, time: null, note: '' };
    state.step = 0;
    renderQuestion();
    showView('quiz');
  });

  document.getElementById('quiz-form').addEventListener('submit', goNext);
  document.getElementById('quiz-prev').addEventListener('click', goPrev);
  document.getElementById('quiz-note').addEventListener('input', handleNoteInput);

  document.getElementById('error-retry').addEventListener('click', requestFirstRecommendation);
  document.getElementById('error-edit').addEventListener('click', () => {
    state.step = 6;
    renderQuestion();
    showView('quiz');
  });

  document.getElementById('more-button').addEventListener('click', requestMoreRecommendation);
  document.getElementById('result-retry').addEventListener('click', requestMoreRecommendation);
  document.getElementById('copy-result-button').addEventListener('click', () => {
    copyText(buildResultText(), document.getElementById('copy-result-status'));
  });
  document.getElementById('restart-button').addEventListener('click', restart);

  document.getElementById('plan-back').addEventListener('click', () => showView('result'));
  document.getElementById('plan-date').addEventListener('input', updateGoogleLink);
  document.getElementById('plan-time').addEventListener('input', updateGoogleLink);
  document.getElementById('ics-button').addEventListener('click', downloadIcs);
  document.getElementById('gcal-link').addEventListener('click', (e) => {
    if (!readPlanDate()) e.preventDefault();
  });
  document.getElementById('copy-plan-button').addEventListener('click', () => {
    copyText(buildPlanText(), document.getElementById('copy-plan-status'));
  });

  showView('intro');
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', init);
}
