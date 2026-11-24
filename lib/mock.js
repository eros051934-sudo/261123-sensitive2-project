import { AppError } from './errors.js';
import { normalizeAiResult } from './validate.js';

// Mock 모드용 가짜 추천 (실제 AI와 같은 모양). 요금 없이 화면·흐름을 확인할 때 씁니다.
const MOCK_PROFILE = {
  typeName: '구조를 세우는 탐색형 빌더',
  summary: '흩어진 생각을 정리해 눈에 보이는 결과로 만들 때 힘이 나는 사람이에요.',
  keywords: ['구조화', '실행력', '호기심'],
  direction: '몰입하는 순간과 강점을 보면, 정답이 정해진 일보다 문제를 정리하고 작은 결과물로 만들어 보는 일에서 힘이 나는 편이에요. 먼저 사람을 만나 실제 일을 들어 보고, 작은 결과물을 직접 만들어 보면서 "만드는 과정"과 "사람과 나누는 과정" 중 어느 쪽이 더 즐거운지 확인해 봐요.',
  fields: [
    { name: '서비스 기획', why: '문제를 정리하고 해결책을 구조로 그리는 일이 강점과 맞아요.' },
    { name: '콘텐츠 기획', why: '아이디어를 눈에 보이는 결과물로 만드는 데서 힘이 나요.' },
    { name: '데이터 분석', why: '복잡한 것을 파고들어 기준을 세우는 걸 좋아한다면 살펴볼 만해요.' }
  ]
};

export const MOCK_ACTIVITIES = [
  {
    name: '관심 직무 1:1 커피챗 인터뷰',
    track: 'career',
    category: 'social',
    cost: 'under30k',
    difficulty: 'easy',
    reason: '막연한 직무 이미지를 실제로 그 일을 하는 사람의 하루로 바꿔 볼 수 있어서, 방향을 정하기 전 가장 빠른 확인 방법이에요.',
    discover: '이야기를 듣는 동안 설렜다면 그 직무를 더 파 볼 가치가 있고, 생각보다 지루했다면 다른 분야로 넘어가도 괜찮다는 신호예요.',
    steps: {
      today: '궁금한 직무의 현직자 글이나 프로필 3개 찾아보기',
      thisWeek: '정중한 대화 요청 메시지와 핵심 질문 5가지 써서 보내기',
      twoWeeks: '30분 대화를 나누고 느낀 점을 한 페이지로 정리하기'
    },
    nextIf: '잘 맞았다면, 같은 직무의 다른 사람 1명을 더 만나 보고 그 직무의 대표 업무를 하나 직접 따라 해 보세요.',
    tip: '질문을 구체적으로 준비할수록 답장 받을 확률이 높아져요.'
  },
  {
    name: '1페이지 노코드 웹사이트 제작',
    track: 'both',
    category: 'make',
    cost: 'free',
    difficulty: 'normal',
    reason: '코딩 없이도 내 아이디어를 실제 웹페이지로 만들어 볼 수 있어, 만드는 일을 좋아하는지 가볍게 확인할 수 있어요.',
    discover: '화면을 꾸미는 게 즐거웠다면 디자인·콘텐츠 쪽, 구조를 짜는 게 즐거웠다면 기획 쪽이 맞을 수 있어요.',
    steps: {
      today: '무료 노코드 도구의 예시 템플릿 5개 구경하기',
      thisWeek: '좋아하는 주제를 소개하는 1페이지 구성을 종이에 그리기',
      twoWeeks: '페이지를 완성해 주소를 만들고 지인 3명에게 의견 받기'
    },
    nextIf: '잘 맞았다면, 실제로 누군가의 불편을 해결하는 페이지를 하나 더 만들어 보고 사용 후기를 받아 보세요.',
    tip: '기능보다 아이디어가 한눈에 보이는 데 집중해 보세요.'
  },
  {
    name: '관심 분야 주간 뉴스 스크랩',
    track: 'career',
    category: 'learn',
    cost: 'free',
    difficulty: 'easy',
    reason: '관심 분야의 흐름을 꾸준히 정리하면, 그 분야를 진짜 궁금해하는지 아니면 막연히 멋있어 보였는지 구분할 수 있어요.',
    discover: '2주 동안 기사 고르는 게 기다려졌다면 그 분야에 진짜 호기심이 있는 거고, 숙제처럼 느껴졌다면 다른 분야를 살펴볼 때예요.',
    steps: {
      today: '관심 분야 뉴스레터 2개 구독하기',
      thisWeek: '가장 흥미로운 기사 1개를 골라 내 생각 3줄 덧붙이기',
      twoWeeks: '2주 동안 모은 내용을 짧은 글 하나로 정리해 올리기'
    },
    nextIf: '잘 맞았다면, 그 분야 사람들이 모이는 온라인 모임에 참여해 내 글을 공유해 보세요.',
    tip: '모든 기사를 읽지 말고 제목 위주로 흐름만 잡아도 충분해요.'
  },
  {
    name: '동네 공간 브랜딩 관찰 노트',
    track: 'both',
    category: 'culture',
    cost: 'under30k',
    difficulty: 'easy',
    reason: '좋아하는 카페나 서점을 손님이 아닌 만드는 사람의 눈으로 보면, 기획과 마케팅에 끌리는지 자연스럽게 알 수 있어요.',
    discover: '"왜 이렇게 했을까?"를 찾는 게 재미있었다면 기획·브랜딩 쪽 감각이 있을 수 있어요.',
    steps: {
      today: '가 보고 싶었던 특색 있는 동네 공간 1곳 정하기',
      thisWeek: '방문해 공간 구성, 메뉴, SNS 운영 방식 관찰해 적기',
      twoWeeks: '내가 사장이라면 바꿀 점 3가지를 담은 제안서 쓰기'
    },
    nextIf: '잘 맞았다면, 관찰한 공간 3곳을 비교하는 글을 써서 브랜딩 포트폴리오의 첫 장으로 만들어 보세요.',
    tip: '소비자가 아니라 기획자의 눈으로 질문해 보세요.'
  },
  {
    name: '나의 몰입 순간 회고 노트',
    track: 'both',
    category: 'mind',
    cost: 'free',
    difficulty: 'easy',
    reason: '과거에 시간 가는 줄 몰랐던 순간을 모아 보면, 취미와 일 모두에 통하는 나만의 공통점이 보여요.',
    discover: '여러 순간에 반복되는 단어가 있다면, 그게 내가 어떤 일을 해도 힘이 나는 "나만의 조건"일 가능성이 커요.',
    steps: {
      today: '지금까지 가장 뿌듯했던 순간 3개 떠올려 적기',
      thisWeek: '그때 내가 맡은 역할과 함께한 사람을 자세히 적기',
      twoWeeks: '반복되는 강점 키워드 3개를 뽑아 다음 도전 기준 세우기'
    },
    nextIf: '잘 맞았다면, 뽑은 키워드를 가까운 사람 3명에게 보여 주고 "나도 그렇게 봤어"라는 반응이 오는지 확인해 보세요.',
    tip: '거창한 성공이 아니어도 진심으로 재미있었던 순간이면 충분해요.'
  },
  {
    name: '원데이 직무 체험 클래스',
    track: 'career',
    category: 'move',
    cost: 'under100k',
    difficulty: 'normal',
    reason: '실제 그 일에서 쓰는 도구를 직접 만져 보면, 머릿속 상상과 실제 일이 얼마나 다른지 하루 만에 알 수 있어요.',
    discover: '실습 시간이 짧게 느껴졌다면 그 일을 더 배워 볼 만하고, 길게 느껴졌다면 방향을 바꿔도 좋다는 신호예요.',
    steps: {
      today: '관심 직무의 입문용 원데이 클래스 종류 찾아보기',
      thisWeek: '입문자용 1회 체험 클래스 하나 신청하기',
      twoWeeks: '체험에서 만든 결과물과 느낀 점을 정리해 두기'
    },
    nextIf: '잘 맞았다면, 같은 분야의 4주짜리 입문 과정이나 무료 온라인 강의로 한 단계 더 배워 보세요.',
    tip: '이론보다 손으로 직접 해보는 과정을 고르세요.'
  },
  {
    name: '작은 불편 해결 템플릿 배포',
    track: 'career',
    category: 'play',
    cost: 'free',
    difficulty: 'challenge',
    reason: '아주 작은 결과물을 세상에 내놓고 반응을 받아 보면, 누군가를 돕는 일에서 보람을 느끼는지 확인할 수 있어요.',
    discover: '한 명이라도 고맙다고 했을 때 가슴이 뛰었다면, 사용자 문제를 푸는 기획·서비스 쪽 일이 맞을 수 있어요.',
    steps: {
      today: '주변 사람들이 자주 겪는 사소한 불편 3가지 적기',
      thisWeek: '그중 하나를 해결할 간단한 가이드나 템플릿 만들기',
      twoWeeks: '무료로 공유하고 실제로 써 본 사람의 반응 모으기'
    },
    nextIf: '잘 맞았다면, 받은 반응을 바탕으로 2탄을 만들고 써 본 사람 수와 후기를 정리해 보세요.',
    tip: '돈보다 다른 사람에게 쓸모 있는 걸 만드는 감각에 집중해요.'
  },
  {
    name: '내 노하우 5단계 가이드 만들기',
    track: 'both',
    category: 'make',
    cost: 'free',
    difficulty: 'normal',
    reason: '내가 당연하게 잘하는 일을 남이 따라 할 수 있게 정리하다 보면, 숨은 강점과 설명하는 재능을 발견할 수 있어요.',
    discover: '정리하고 설명하는 과정이 즐거웠다면 교육·콘텐츠 쪽, 내용 자체가 즐거웠다면 그 분야를 더 깊이 파 볼 만해요.',
    steps: {
      today: '내가 남들보다 조금 쉽게 해내는 일 1가지 정하기',
      thisWeek: '초보자가 따라 할 수 있는 5단계 체크리스트 쓰기',
      twoWeeks: '보기 좋게 편집해 친구 2명이 직접 따라 하게 해 보기'
    },
    nextIf: '잘 맞았다면, 같은 주제로 짧은 영상이나 글 시리즈를 3편 만들어 꾸준히 올려 보세요.',
    tip: '스스로는 당연한 팁이 남들에게는 큰 도움이 돼요.'
  },
  {
    name: '주말 소모임 하루 참여',
    track: 'hobby',
    category: 'social',
    cost: 'under30k',
    difficulty: 'easy',
    reason: '관심사가 같은 사람들과 하루를 보내 보면, 혼자 할 때와 함께할 때 어느 쪽에서 더 힘이 나는지 알 수 있어요.',
    discover: '모임이 끝나고 기운이 났다면 사람과 함께하는 일이, 지쳤다면 혼자 몰입하는 일이 더 맞을 수 있어요.',
    steps: {
      today: '관심 있는 주제의 주말 소모임 종류 3개 찾아보기',
      thisWeek: '부담 없는 1회 참여 모임 하나 골라 신청하기',
      twoWeeks: '참여 후 좋았던 점과 힘들었던 점을 3줄씩 적기'
    },
    nextIf: '잘 맞았다면, 같은 모임에 두 번 더 나가 보고 작은 역할을 하나 맡아 보세요.',
    tip: '첫 모임은 끝까지 있지 않아도 괜찮아요.'
  }
];

export async function mockRecommend(input) {
  const { answers, previous = [] } = input;
  const note = answers.note || '';

  // 자유 입력에 아래 표시를 넣으면 오류 화면을 일부러 확인할 수 있음 (docs/10)
  if (note.includes('[[timeout]]')) throw new AppError('AI_TIMEOUT', 'mock timeout');
  if (note.includes('[[unavailable]]')) throw new AppError('AI_SERVICE_UNAVAILABLE', 'mock unavailable');
  if (note.includes('[[invalid]]')) throw new AppError('AI_RESPONSE_INVALID', 'mock invalid');
  if (note.includes('[[quota]]')) throw new AppError('AI_QUOTA_EXCEEDED', 'mock quota');
  if (note.includes('[[rate]]')) throw new AppError('RATE_LIMITED', 'mock rate');
  if (note.includes('[[config]]')) throw new AppError('SERVER_CONFIG_ERROR', 'mock config');

  await new Promise((resolve) => setTimeout(resolve, 700));

  // 이미 본 활동은 빼고 3개. 다 봤으면 처음 3개로 돌아감
  const key = (s) => s.replace(/\s+/g, '').toLowerCase();
  const seen = new Set(previous.map((p) => key(p.name)));
  let chosen = MOCK_ACTIVITIES.filter((a) => !seen.has(key(a.name)));
  let prevForNormalize = previous;
  if (chosen.length < 3) {
    chosen = MOCK_ACTIVITIES;
    prevForNormalize = [];
  }

  return normalizeAiResult({
    profile: MOCK_PROFILE,
    activities: chosen.slice(0, 3),
    wellbeingConcern: note.includes('[[wellbeing]]')
  }, prevForNormalize);
}
