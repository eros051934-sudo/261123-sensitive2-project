// 질문·선택지·라벨: 프론트(app.js)와 서버(lib/validate.js, lib/prompt.js)가 함께 쓰는 순수 데이터
export const MAX_NOTE_LENGTH = 300;
export const MAX_MOOD = 2;
export const MAX_PREVIOUS = 9;

export const QUESTIONS = [
  {
    id: 'mood',
    type: 'multi',
    style: 'tile',
    title: '요즘 나에게 필요한 건 뭘까요?',
    hint: '최대 2개까지 고를 수 있어요.',
    options: [
      { id: 'thrill', label: '설렘', description: '새롭고 짜릿한 경험' },
      { id: 'focus', label: '몰입', description: '시간 가는 줄 모르는 집중' },
      { id: 'rest', label: '쉼', description: '마음 편히 쉬는 시간' },
      { id: 'people', label: '사람', description: '누군가와 함께하는 즐거움' },
      { id: 'achieve', label: '성취', description: '해냈다는 뿌듯함' },
      { id: 'learn', label: '배움', description: '새로운 걸 알아가는 재미' }
    ]
  },
  {
    id: 'company',
    type: 'single',
    style: 'chip',
    title: '누구와 하고 싶어요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'alone', label: '혼자서' },
      { id: 'close', label: '친구·연인·가족과' },
      { id: 'new', label: '새로운 사람들과' },
      { id: 'any', label: '상관없어요' }
    ]
  },
  {
    id: 'place',
    type: 'single',
    style: 'chip',
    title: '어디가 좋아요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'indoor', label: '실내' },
      { id: 'outdoor', label: '야외' },
      { id: 'any', label: '상관없어요' }
    ]
  },
  {
    id: 'energy',
    type: 'single',
    style: 'chip',
    title: '몸은 얼마나 쓰고 싶어요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'low', label: '거의 안 움직이고 싶어요' },
      { id: 'mid', label: '가볍게 움직이고 싶어요' },
      { id: 'high', label: '땀 흘려도 좋아요' }
    ]
  },
  {
    id: 'budget',
    type: 'single',
    style: 'chip',
    title: '한 달에 쓸 수 있는 돈은요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'free', label: '0원 (무료만)' },
      { id: 'under30k', label: '3만 원 이하' },
      { id: 'under100k', label: '10만 원 이하' },
      { id: 'over100k', label: '10만 원 넘어도 괜찮아요' }
    ]
  },
  {
    id: 'time',
    type: 'single',
    style: 'chip',
    title: '일주일에 낼 수 있는 시간은요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'under1h', label: '1시간 이하' },
      { id: '1to3h', label: '1~3시간' },
      { id: '3to6h', label: '3~6시간' },
      { id: 'over6h', label: '6시간 이상' }
    ]
  },
  {
    id: 'note',
    type: 'text',
    title: '요즘 관심 가는 것이나, 해봤는데 별로였던 게 있나요?',
    hint: '적지 않아도 괜찮아요. 적으면 추천이 더 정확해져요.',
    placeholder: '예) 요즘 사진에 관심이 생겼어요. 헬스장은 해봤는데 지루했어요.'
  }
];

export const CATEGORY_LABELS = {
  make: '만들기',
  move: '몸 쓰기',
  culture: '문화·감상',
  learn: '배우기',
  social: '함께하기',
  nature: '자연',
  play: '놀이·게임',
  mind: '마음 챙김'
};

export const COST_LABELS = {
  free: '무료',
  under30k: '3만 원 이하',
  under100k: '3만~10만 원',
  over100k: '10만 원 이상'
};

export const COST_ORDER = ['free', 'under30k', 'under100k', 'over100k'];

export const DIFFICULTY_LABELS = {
  easy: '바로 시작',
  normal: '조금 준비',
  challenge: '도전'
};

export const STEP_LABELS = {
  today: '오늘',
  thisWeek: '이번 주',
  twoWeeks: '2주 안'
};
