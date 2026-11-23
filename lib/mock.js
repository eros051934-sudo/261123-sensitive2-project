import { AppError } from './errors.js';
import { normalizeAiResult } from './validate.js';

// 9개 가짜 활동 목록 (이름 20자 이하, 6종 이상 카테고리, free 또는 under30k, 하나는 tip: null)
export const MOCK_ACTIVITIES = [
  {
    name: '뜨개질 컵받침 만들기',
    category: 'make',
    cost: 'under30k',
    difficulty: 'easy',
    reason: '혼자 조용히 손을 움직이며 집중할 수 있어 요즘 기분에 잘 맞아요.',
    steps: {
      today: '실과 코바늘을 고르고 기본 사슬뜨기 영상 하나 보기',
      thisWeek: '사슬뜨기와 짧은뜨기로 작은 사각형 하나 완성하기',
      twoWeeks: '내 컵에 딱 맞는 첫 번째 컵받침을 완성해 사용해 보기'
    },
    tip: '처음엔 손에 힘을 빼고 일정한 간격으로 뜨는 것이 좋아요.'
  },
  {
    name: '필름 감성 폰 사진 산책',
    category: 'culture',
    cost: 'free',
    difficulty: 'easy',
    reason: '부담 없이 혼자 걸으며 일상의 작은 아름다움을 발견할 수 있어요.',
    steps: {
      today: '휴대폰 카메라 격자선을 켜고 방 안의 빛 사진 3장 찍기',
      thisWeek: '동네를 30분 걸으며 그림자와 빛을 주제로 10장 찍기',
      twoWeeks: '가장 마음에 드는 사진 5장을 골라 나만의 모바일 앨범 만들기'
    },
    tip: null
  },
  {
    name: '모닝 스트레칭과 명상',
    category: 'mind',
    cost: 'free',
    difficulty: 'easy',
    reason: '몸을 가볍게 풀면서 복잡한 머릿속을 맑게 비워낼 수 있어요.',
    steps: {
      today: '침대에서 일어나 기지개를 켜고 3번 깊게 심호흡하기',
      thisWeek: '아침마다 10분씩 전신 스트레칭 루틴 반복하기',
      twoWeeks: '2주 동안 나만의 모닝 루틴을 완성해 가뿐한 하루 시작하기'
    },
    tip: '무리하게 늘리기보다 호흡에 집중하며 편안함을 느껴보세요.'
  },
  {
    name: '동네 도서관 서가 탐험',
    category: 'learn',
    cost: 'free',
    difficulty: 'easy',
    reason: '새로운 지식과 이야기를 조용하고 평화로운 공간에서 만날 수 있어요.',
    steps: {
      today: '근처 도서관 휴관일과 회원증 발급 방법 찾아보기',
      thisWeek: '도서관에 들러 평소 안 읽던 분야의 책 한 권 빌리기',
      twoWeeks: '빌린 책을 끝까지 읽고 가장 좋았던 문장 한 줄 기록하기'
    },
    tip: '책을 다 읽지 못해도 괜찮으니 제목만 훑어보는 재미를 느껴보세요.'
  },
  {
    name: '가벼운 홈베이킹 쿠키',
    category: 'make',
    cost: 'under30k',
    difficulty: 'normal',
    reason: '달콤한 냄새와 함께 오븐을 보며 기다리는 시간이 큰 위로가 돼요.',
    steps: {
      today: '집에 있는 조리도구 확인하고 쿠키 믹스나 기본 재료 고르기',
      thisWeek: '버터와 밀가루로 초코칩 쿠키 한 판 구워보기',
      twoWeeks: '직접 구운 쿠키를 예쁜 포장지에 담아 스스로에게 선물하기'
    },
    tip: '반죽을 냉장고에 30분 정도 휴지시키면 모양이 훨씬 예뻐져요.'
  },
  {
    name: '저녁 노을 러닝',
    category: 'move',
    cost: 'free',
    difficulty: 'normal',
    reason: '시원한 바람을 맞으며 땀을 흘리면 스트레스가 한 번에 날아가요.',
    steps: {
      today: '편한 운동화와 운동복을 챙겨두고 가벼운 동네 코스 지도 보기',
      thisWeek: '15분 동안 걷기와 천천히 달리기를 번갈아 해보기',
      twoWeeks: '쉬지 않고 20분 동안 가볍게 조깅하는 체력 만들기'
    },
    tip: '속도보다 편안하게 호흡을 유지하는 페이스가 중요해요.'
  },
  {
    name: '보드게임 솔로 플레이',
    category: 'play',
    cost: 'under30k',
    difficulty: 'easy',
    reason: '규칙을 하나씩 풀어가며 혼자만의 두뇌 유희에 빠져들 수 있어요.',
    steps: {
      today: '1인 플레이가 지원되는 퍼즐 보드게임 규칙 영상 보기',
      thisWeek: '기본 규칙 1판을 차근차근 따라 해보며 첫 승리 달성하기',
      twoWeeks: '난이도를 한 단계 올려 도전하고 최고 기록 세워보기'
    },
    tip: '점수보다 규칙을 하나씩 탐색하는 과정 자체를 즐겨보세요.'
  },
  {
    name: '반려식물 바질 키우기',
    category: 'nature',
    cost: 'under30k',
    difficulty: 'easy',
    reason: '초록빛 잎이 자라나는 모습을 매일 관찰하며 작은 생명력을 나눠 받아요.',
    steps: {
      today: '창가 햇빛 드는 자리 확인하고 바질 키우기 키트 주문하기',
      thisWeek: '작은 화분에 흙을 담고 씨앗을 심어 촉촉하게 물주기',
      twoWeeks: '첫 싹이 트는 순간을 사진으로 남기고 겉흙 마르면 물주기'
    },
    tip: '물은 흙이 마르면 화분 밑으로 흘러나올 때까지 듬뿍 주세요.'
  },
  {
    name: '원데이 티 테이스팅',
    category: 'culture',
    cost: 'under30k',
    difficulty: 'easy',
    reason: '따뜻한 차 한 잔의 향과 맛에 온전히 집중하며 쉼을 얻을 수 있어요.',
    steps: {
      today: '마음에 드는 티백 샘플러 3종을 장바구니에 담기',
      thisWeek: '좋아하는 찻잔에 물을 끓여 3분 동안 향을 맡으며 음미하기',
      twoWeeks: '서로 다른 종류의 차 3가지를 비교해보고 나만의 찻잎 찾기'
    },
    tip: '물이 너무 뜨거우면 떫어질 수 있으니 한 김 식혀서 우려보세요.'
  }
];

export async function mockRecommend(input) {
  const { answers, previous = [] } = input;
  const note = answers.note || '';

  // 테스트용 오류 모의
  if (note.includes('[[timeout]]')) throw new AppError('AI_TIMEOUT', 'mock timeout');
  if (note.includes('[[unavailable]]')) throw new AppError('AI_SERVICE_UNAVAILABLE', 'mock unavailable');
  if (note.includes('[[invalid]]')) throw new AppError('AI_RESPONSE_INVALID', 'mock invalid');
  if (note.includes('[[quota]]')) throw new AppError('AI_QUOTA_EXCEEDED', 'mock quota');
  if (note.includes('[[rate]]')) throw new AppError('RATE_LIMITED', 'mock rate');
  if (note.includes('[[config]]')) throw new AppError('SERVER_CONFIG_ERROR', 'mock config');

  await new Promise((resolve) => setTimeout(resolve, 700));

  const seen = new Set(previous.map((p) => p.name.replace(/\s+/g, '').toLowerCase()));
  let chosen = MOCK_ACTIVITIES.filter((a) => !seen.has(a.name.replace(/\s+/g, '').toLowerCase()));

  if (chosen.length < 3) {
    chosen = MOCK_ACTIVITIES.slice(0, 3);
    return normalizeAiResult({
      profile: {
        typeName: '테스트 몰입 탐험가',
        summary: '테스트 모드 결과예요. 실제 추천은 AI가 만들어요.',
        keywords: ['테스트', '몰입']
      },
      activities: chosen,
      wellbeingConcern: note.includes('[[wellbeing]]')
    }, []);
  }

  const raw = {
    profile: {
      typeName: '테스트 몰입 탐험가',
      summary: '테스트 모드 결과예요. 실제 추천은 AI가 만들어요.',
      keywords: ['테스트', '몰입']
    },
    activities: chosen.slice(0, 3),
    wellbeingConcern: note.includes('[[wellbeing]]')
  };

  return normalizeAiResult(raw, previous);
}
