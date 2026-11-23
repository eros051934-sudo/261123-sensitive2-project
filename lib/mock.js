import { AppError } from './errors.js';
import { normalizeAiResult } from './validate.js';

// 진로·적성·자기 탐색형 가짜 활동 목록 (Mock 모드용)
export const MOCK_ACTIVITIES = [
  {
    name: '관심 직무 1:1 커피챗 인터뷰',
    category: 'social',
    cost: 'under30k',
    difficulty: 'easy',
    reason: '해당 직무가 내 기대와 실제로 맞는지 현직자의 생생한 목소리로 빠르게 검증할 수 있어요.',
    steps: {
      today: '궁금한 직무의 현직자 블로그나 링크드인 프로필 3개 찾아보기',
      thisWeek: '정중한 인터뷰 요청 메시지와 핵심 질문 5가지 작성해 전달하기',
      twoWeeks: '30분 커피챗을 진행하고 느낀 점과 배운 점을 한 페이지로 기록하기'
    },
    tip: '거절을 두려워하지 말고 질문지를 구체적으로 준비하면 답장 확률이 높아져요.'
  },
  {
    name: '1페이지 노코드 웹사이트 제작',
    category: 'make',
    cost: 'free',
    difficulty: 'normal',
    reason: '코딩 없이 내 아이디어나 관심사를 실제 웹으로 구현해보며 IT 프로덕트 기획 감각을 익혀요.',
    steps: {
      today: '노코드 툴(노션, 우피, 프레이머 등) 예시 템플릿 구경하기',
      thisWeek: '내가 좋아하는 주제나 프로젝트를 소개하는 1페이지 레이아웃 잡기',
      twoWeeks: '실제 주소를 발행해 지인이나 커뮤니티에 공유하고 피드백 받아보기'
    },
    tip: '완벽한 기능보다 아이디어가 시각적으로 보이는 것에 집중해 보세요.'
  },
  {
    name: '산업 트렌드 주간 뉴스레터 스크랩',
    category: 'learn',
    cost: 'free',
    difficulty: 'easy',
    reason: '관심 분야의 흐름을 주기적으로 정리하며 나만의 전문적인 시각과 인사이트를 쌓을 수 있어요.',
    steps: {
      today: '관심 산업군 분야의 인기 뉴스레터 2개 구독하기',
      thisWeek: '한 주간 가장 흥미로웠던 기사 1개를 골라 내 생각 3줄 덧붙이기',
      twoWeeks: '2주 동안 모은 뉴스 요약을 블로그나 SNS에 첫 아티클로 발행하기'
    },
    tip: '모든 기사를 다 읽으려 하지 말고 헤드라인 위주로 흐름을 파악하세요.'
  },
  {
    name: '동네 공간 미니 브랜딩 분석',
    category: 'culture',
    cost: 'under30k',
    difficulty: 'easy',
    reason: '잘되는 카페나 독립서점의 고객 경험과 마케팅 요소를 분석하며 기획 안목을 키워요.',
    steps: {
      today: '평소 가보고 싶었던 특색 있는 동네 공간 1곳 리스트업하기',
      thisWeek: '직접 방문해 인테리어, 메뉴 구성, SNS 운영 방식 관찰 메모하기',
      twoWeeks: '내가 사장이라면 바꿀 점 3가지를 담은 가상 개선 제안서 써보기'
    },
    tip: '소비자가 아닌 기획자의 시선으로 "왜 이렇게 했을까?"를 질문해 보세요.'
  },
  {
    name: '내 강점 데이터 회고 일기',
    category: 'mind',
    cost: 'free',
    difficulty: 'easy',
    reason: '과거에 몰입했던 순간과 지쳤던 순간을 체계적으로 분류하여 직업적 강점을 발견해요.',
    steps: {
      today: '학창 시절부터 지금까지 가장 성취감을 느꼈던 사건 3개 떠올리기',
      thisWeek: '그 순간에 내가 구체적으로 어떤 역할을 맡았었는지 육하원칙으로 정리하기',
      twoWeeks: '반복되는 나의 강점 키워드 3개를 도출해 다음 도전 기준 세우기'
    },
    tip: '거창한 성공이 아니어도 내가 진심으로 재미있었던 순간을 적어보세요.'
  },
  {
    name: '원데이 직무 워크숍 참여',
    category: 'move',
    cost: 'under100k',
    difficulty: 'normal',
    reason: '실제 실무 도구를 써보며 이 일이 내 손에 익고 즐거운지 빠르게 테스트할 수 있어요.',
    steps: {
      today: '원데이 클래스 플랫폼에서 관심 직무 실습 강좌 찾아보기',
      thisWeek: '가장 입문자에게 적합한 1회성 워크숍 수강 신청하기',
      twoWeeks: '워크숍에서 완성한 실습 결과물을 폴더에 정리하고 다음 단계 계획하기'
    },
    tip: '이론 강의보다는 손으로 직접 실습하는 커리큘럼을 고르는 것이 좋아요.'
  },
  {
    name: '마이크로 사이드 프로젝트 런칭',
    category: 'play',
    cost: 'free',
    difficulty: 'challenge',
    reason: '아주 작은 서비스나 콘텐츠를 세상에 내놓고 실제 타인의 반응을 확인해보는 경험이에요.',
    steps: {
      today: '주변 사람들이 자주 겪는 사소한 불편함 3가지 메모하기',
      thisWeek: '불편을 해결해 줄 수 있는 간단한 가이드나 템플릿 문서 제작하기',
      twoWeeks: '무료로 배포해보고 단 한 명이라도 실제 감사를 표하는지 실험하기'
    },
    tip: '돈을 벌기 위함이 아니라 타인에게 실질적인 가치를 전달하는 감각을 익혀요.'
  },
  {
    name: '나만의 업무 매뉴얼/가이드 만들기',
    category: 'make',
    cost: 'free',
    difficulty: 'normal',
    reason: '내가 지금 잘하는 일이나 취미 노하우를 누구나 따라할 수 있게 체계화해 봅니다.',
    steps: {
      today: '내가 남들보다 조금 더 쉽게 해내는 일 1가지 정하기',
      thisWeek: '초보자가 10분 만에 따라할 수 있는 5단계 체크리스트 작성하기',
      twoWeeks: 'PDF나 노션 페이지로 예쁘게 편집해 주변 친구에게 테스트해보기'
    },
    tip: '스스로는 당연하다고 생각하는 사소한 팁이 남들에게는 큰 도움이 돼요.'
  },
  {
    name: '라이프스타일 밸런스 실험',
    category: 'nature',
    cost: 'free',
    difficulty: 'easy',
    reason: '내가 가장 높은 에너지를 낼 수 있는 시간대와 생활 루틴을 찾아내 업무 효율을 극대화해요.',
    steps: {
      today: '내일 기상 직후 10분 동안 온전히 내 생각을 정리하는 시간 갖기',
      thisWeek: '오전/오후/야간 중 언제가 가장 집중이 잘되는지 3일간 체크하기',
      twoWeeks: '발견한 황금 시간대에 가장 중요한 자기 계발 과제를 배치하기'
    },
    tip: '무리한 목표보다 매일 지킬 수 있는 최소 루틴을 만드는 것이 중요해요.'
  }
];

export async function mockRecommend(input) {
  const { answers, previous = [] } = input;
  const note = answers.note || '';

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
        typeName: '잠재력 탐색 빌더',
        summary: '나만의 강점과 가치를 발견하고 작은 실험을 통해 다음 방향을 설계하는 탐험가예요.',
        keywords: ['방향탐색', '실행력', '잠재력']
      },
      activities: chosen,
      wellbeingConcern: note.includes('[[wellbeing]]')
    }, []);
  }

  const raw = {
    profile: {
      typeName: '잠재력 탐색 빌더',
      summary: '나만의 강점과 가치를 발견하고 작은 실험을 통해 다음 방향을 설계하는 탐험가예요.',
      keywords: ['방향탐색', '실행력', '잠재력']
    },
    activities: chosen.slice(0, 3),
    wellbeingConcern: note.includes('[[wellbeing]]')
  };

  return normalizeAiResult(raw, previous);
}
