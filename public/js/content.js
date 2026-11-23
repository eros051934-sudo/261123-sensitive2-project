// 질문·선택지·라벨: 프론트(app.js)와 서버(lib/validate.js, lib/prompt.js)가 함께 쓰는 순수 데이터
export const MAX_NOTE_LENGTH = 300;
export const MAX_MOOD = 2;
export const MAX_PREVIOUS = 9;

export const QUESTIONS = [
  {
    id: 'mood',
    type: 'multi',
    style: 'tile',
    title: '언제 시간 가는 줄 모르고 에너지가 차오르나요?',
    hint: '가장 끌리는 순간을 최대 2개 골라 주세요.',
    options: [
      { id: 'create', label: '창작과 표현', description: '글, 이미지, 콘텐츠로 아이디어를 시각화할 때' },
      { id: 'analyze', label: '분석과 설계', description: '복잡한 문제를 파고들고 구조를 세울 때' },
      { id: 'connect', label: '소통과 공감', description: '사람들의 이야기를 듣고 돕거나 조율할 때' },
      { id: 'lead', label: '주도와 성과', description: '목표를 세우고 직접 이끌어 결과를 낼 때' },
      { id: 'explore', label: '탐구와 배움', description: '새로운 지식과 기술을 알아가고 이해할 때' },
      { id: 'craft', label: '손끝의 완성', description: '손과 도구를 써서 만질 수 있는 결과물을 빚을 때' }
    ]
  },
  {
    id: 'company',
    type: 'single',
    style: 'chip',
    title: '내 일과 삶에서 지금 가장 갈증을 느끼는 부분은?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'clarity', label: '내가 진짜 뭘 원하는지 방향성 찾기' },
      { id: 'skill', label: '앞으로 써먹을 수 있는 나만의 전문 역량' },
      { id: 'vitality', label: '지친 일상에 다시 불을 지필 작은 성취감' },
      { id: 'network', label: '자극과 긍정적인 영향을 주고받을 사람/동료' }
    ]
  },
  {
    id: 'place',
    type: 'single',
    style: 'chip',
    title: '어떤 환경에서 일하거나 몰입할 때 편안한가요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'quiet', label: '방해받지 않는 독립된 나만의 공간' },
      { id: 'collaborative', label: '서로 피드백을 주고받는 열린 공간' },
      { id: 'dynamic', label: '현장과 바깥을 오가며 몸을 움직이는 환경' },
      { id: 'any', label: '어디든 상관없어요' }
    ]
  },
  {
    id: 'energy',
    type: 'single',
    style: 'chip',
    title: '어떤 방식의 탐색 경험부터 시작해보고 싶나요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'solo_study', label: '가볍게 혼자 해보는 1인 사이드 실험' },
      { id: 'interview', label: '현직자나 멘토를 만나 질문하고 대화하기' },
      { id: 'project', label: '작더라도 실제 작동하는 미니 프로젝트 완성' },
      { id: 'hands_on', label: '원데이 워크숍/현장 클래스로 직접 겪어보기' }
    ]
  },
  {
    id: 'budget',
    type: 'single',
    style: 'chip',
    title: '첫 시도에 쓸 수 있는 예산은 어느 정도인가요?',
    hint: '하나만 골라 주세요.',
    options: [
      { id: 'free', label: '0원 (무료 자료와 툴로만)' },
      { id: 'under30k', label: '3만 원 이하 (책, 소도구, 커피챗)' },
      { id: 'under100k', label: '10만 원 이하 (강의, 워크숍, 재료비)' },
      { id: 'over100k', label: '10만 원 이상 (본격적인 장비/코칭)' }
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
      { id: '3to6h', label: '퇴근 후 틈틈이 (주 3~6시간)' },
      { id: 'over6h', label: '주말 하루 몰입 (주 6시간 이상)' }
    ]
  },
  {
    id: 'note',
    type: 'text',
    title: '지금 어떤 점이 가장 막막한가요? 관심사나 고민을 편하게 적어주세요.',
    hint: '적지 않아도 괜찮아요. 적으면 추천과 방향성이 훨씬 나에게 맞춤화돼요.',
    placeholder: '예) 회사를 다니고 있는데 적성에 맞는지 모르겠어요. IT나 마케팅 쪽에 관심이 가는데 비전공자라 뭐부터 해봐야 할지 막막해요.'
  }
];

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
