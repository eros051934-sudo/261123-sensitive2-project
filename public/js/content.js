// 질문·선택지·라벨: 프론트(app.js)와 서버(lib/validate.js, lib/prompt.js)가 함께 쓰는 순수 데이터
// 정본: docs/04-content-questions.md — 여기만 고치면 화면과 서버가 함께 바뀝니다.
export const MAX_NOTE_LENGTH = 300;
export const MAX_FLOW = 2;
export const MAX_PREVIOUS = 9;

export const QUESTIONS = [
  {
    id: 'goal',
    type: 'single',
    style: 'chip',
    title: '지금 가장 찾고 싶은 건 뭔가요?',
    hint: '하나만 골라 주세요. 결과에서 취미와 진로의 비중이 달라져요.',
    options: [
      { id: 'hobby', label: '나를 즐겁게 해 줄 취미·즐거움' },
      { id: 'career', label: '앞으로 해볼 일·진로 방향' },
      { id: 'both', label: '둘 다 궁금해요' }
    ]
  },
  {
    id: 'stage',
    type: 'single',
    style: 'chip',
    title: '지금 나는 어떤 시기에 있나요?',
    hint: '하나만 골라 주세요. 지금 상황에서 해볼 수 있는 방법으로 추천해 드려요.',
    options: [
      { id: 'student', label: '학생이에요 (진로를 넓게 살펴보는 중)' },
      { id: 'jobseeker', label: '취업을 준비하고 있어요' },
      { id: 'worker', label: '일하고 있어요 (직장·프리랜서)' },
      { id: 'pause', label: '잠시 쉬어 가거나 방향을 바꾸는 중이에요' }
    ]
  },
  {
    id: 'flow',
    type: 'multi',
    style: 'tile',
    title: '언제 시간 가는 줄 모르고 에너지가 차오르나요?',
    hint: '가장 끌리는 순간을 최대 2개 골라 주세요.',
    options: [
      { id: 'create', label: '창작과 표현', description: '글, 이미지, 콘텐츠로 아이디어를 보여줄 때' },
      { id: 'analyze', label: '분석과 설계', description: '복잡한 문제를 파고들고 구조를 세울 때' },
      { id: 'connect', label: '소통과 공감', description: '사람들의 이야기를 듣고 돕거나 조율할 때' },
      { id: 'lead', label: '주도와 성과', description: '목표를 세우고 직접 이끌어 결과를 낼 때' },
      { id: 'explore', label: '탐구와 배움', description: '새로운 지식과 기술을 알아가고 이해할 때' },
      { id: 'craft', label: '손끝의 완성', description: '손과 도구로 만질 수 있는 결과물을 빚을 때' }
    ]
  },
  {
    id: 'strength',
    type: 'single',
    style: 'chip',
    title: '주변에서 자주 듣는 말에 가장 가까운 건?',
    hint: '딱 맞지 않아도 괜찮아요. 가장 가까운 걸 골라 주세요.',
    options: [
      { id: 'organize', label: '꼼꼼하고 정리를 잘한다' },
      { id: 'idea', label: '아이디어가 많고 새롭다' },
      { id: 'listen', label: '이야기를 잘 들어주고 설명을 잘한다' },
      { id: 'drive', label: '추진력 있고 끝까지 해낸다' },
      { id: 'sense', label: '손재주나 감각이 좋다' },
      { id: 'unsure', label: '잘 모르겠어요' }
    ]
  },
  {
    id: 'drain',
    type: 'single',
    style: 'chip',
    title: '반대로, 어떨 때 금방 지치나요?',
    hint: '하나만 골라 주세요. 피해야 할 방향을 아는 것도 큰 힌트예요.',
    options: [
      { id: 'routine', label: '같은 일을 계속 반복할 때' },
      { id: 'crowd', label: '많은 사람을 계속 상대할 때' },
      { id: 'pressure', label: '숫자·성과 압박이 클 때' },
      { id: 'vague', label: '정해진 답 없이 막연할 때' },
      { id: 'isolated', label: '혼자 오래 일해야 할 때' }
    ]
  },
  {
    id: 'need',
    type: 'single',
    style: 'chip',
    title: '내 일과 삶에서 지금 가장 갈증을 느끼는 부분은?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'clarity', label: '내가 진짜 뭘 원하는지 방향성 찾기' },
      { id: 'skill', label: '앞으로 써먹을 수 있는 나만의 전문 역량' },
      { id: 'vitality', label: '지친 일상에 다시 불을 지필 작은 성취감' },
      { id: 'network', label: '자극과 좋은 영향을 주고받을 사람·동료' }
    ]
  },
  {
    id: 'env',
    type: 'single',
    style: 'chip',
    title: '어떤 환경에서 일하거나 몰입할 때 편안한가요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'quiet', label: '방해받지 않는 나만의 공간' },
      { id: 'collaborative', label: '서로 피드백을 주고받는 열린 공간' },
      { id: 'dynamic', label: '현장과 바깥을 오가며 몸을 움직이는 환경' },
      { id: 'any', label: '어디든 상관없어요' }
    ]
  },
  {
    id: 'approach',
    type: 'single',
    style: 'chip',
    title: '어떤 방식으로 첫 경험을 시작해 보고 싶나요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'solo', label: '혼자 가볍게 해보는 작은 실험' },
      { id: 'talk', label: '그 일을 하는 사람을 만나 묻고 듣기' },
      { id: 'project', label: '작더라도 끝까지 완성하는 미니 프로젝트' },
      { id: 'class', label: '원데이 클래스·현장 체험으로 직접 겪어보기' }
    ]
  },
  {
    id: 'budget',
    type: 'single',
    style: 'chip',
    title: '첫 한 달 동안 쓸 수 있는 돈은 어느 정도인가요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'free', label: '0원 (무료 자료와 도구만)' },
      { id: 'under30k', label: '3만 원 이하 (책, 소도구, 커피챗)' },
      { id: 'under100k', label: '10만 원 이하 (강의, 원데이 클래스, 재료비)' },
      { id: 'over100k', label: '10만 원 넘어도 괜찮아요 (장비, 코칭)' }
    ]
  },
  {
    id: 'time',
    type: 'single',
    style: 'chip',
    title: '일주일에 나를 위해 낼 수 있는 시간은요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'under1h', label: '매일 10분씩 (주 1시간 이하)' },
      { id: '1to3h', label: '주말 반나절 (주 1~3시간)' },
      { id: '3to6h', label: '퇴근·하교 후 틈틈이 (주 3~6시간)' },
      { id: 'over6h', label: '하루를 통째로 (주 6시간 이상)' }
    ]
  },
  {
    id: 'note',
    type: 'text',
    title: '요즘 관심 가는 것, 막막한 점, 해봤는데 별로였던 걸 편하게 적어 주세요.',
    hint: '적지 않아도 괜찮아요. 적을수록 방향 설명이 나에게 더 꼭 맞아져요.',
    placeholder: '예) 회사를 다니는데 이 일이 맞는지 모르겠어요. 마케팅이나 IT에 관심이 있지만 비전공자라 뭐부터 할지 막막해요. 헬스는 해봤는데 지루했어요.'
  }
];

// 질문 개수 (진행 표시 "n / 11" 등에 사용)
export const QUESTION_COUNT = QUESTIONS.length;

// 답변 기본값: 복수 선택은 빈 배열, 하나 선택은 null, 자유 입력은 빈 문자열
export function createEmptyAnswers() {
  const answers = {};
  for (const q of QUESTIONS) {
    if (q.type === 'multi') answers[q.id] = [];
    else if (q.type === 'single') answers[q.id] = null;
    else answers[q.id] = '';
  }
  return answers;
}

// 추천이 취미 쪽인지 진로 쪽인지
export const TRACK_LABELS = {
  hobby: '취미',
  career: '진로 탐색',
  both: '취미·진로'
};

export const CATEGORY_LABELS = {
  make: '창작·메이킹',
  move: '실전·현장경험',
  culture: '인사이트·리서치',
  learn: '직무·역량탐색',
  social: '네트워킹·커뮤니케이션',
  nature: '라이프스타일',
  play: '사이드실험',
  mind: '자기이해·회고'
};

export const COST_LABELS = {
  free: '무료',
  under30k: '3만 원 이하',
  under100k: '3만~10만 원',
  over100k: '10만 원 이상'
};

export const COST_ORDER = ['free', 'under30k', 'under100k', 'over100k'];

export const DIFFICULTY_LABELS = {
  easy: '가벼운 첫 걸음',
  normal: '집중 실천',
  challenge: '작은 도전'
};

export const STEP_LABELS = {
  today: '오늘 (10분)',
  thisWeek: '이번 주',
  twoWeeks: '2주 안'
};
