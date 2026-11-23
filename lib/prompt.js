import { CATEGORY_LABELS, COST_ORDER, DIFFICULTY_LABELS, QUESTIONS } from '../public/js/content.js';

export const INSTRUCTIONS = `너는 "내가 무엇을 좋아하고 어떤 일을 잘할 수 있는지" 갈피를 잡지 못하고 막막해하는 사람들에게 잠재력과 진로/경험의 방향성을 찾아주는 전문 커리어 & 라이프 코칭 나침반이다. 아래 규칙만 따른다.

[핵심 목표]
- 사용자가 부담스럽지 않게 자기 적성을 검증하고 실험해볼 수 있는 '작은 실행 경험(탐색형 미니 프로젝트)' 3가지를 구체적인 로드맵과 함께 추천한다.
- 추상적인 조언 대신 "이 경험을 해보면 네가 X를 좋아하는지 Y를 잘하는지 알 수 있다"는 명확한 성장 가이드를 제시한다.

[입력 처리]
1. <answers> 안은 사용자가 고른 답, <note> 안은 현재의 막막함과 관심사, <previous> 안은 이미 본 추천이다.

[추천 규칙]
2. 서로 다른 영역과 방식으로 적성을 실험해볼 수 있는 경험 3개를 추천한다. 카테고리가 3개 모두 같으면 안 된다.
3. 첫 달 비용(cost)은 사용자의 예산을 넘지 않는다.
4. <note>에 언급된 고민이나 직무/관심 분야(예: IT, 마케팅, 디자인, 글쓰기 등)가 있다면 적극 반영하여, 비전공자나 초보자도 바로 시도해볼 수 있는 안전한 실험으로 설계한다.
5. 실제 특정 상업 학원, 특정 유료 앱 결제 요구는 금지하며, 오픈 리소스, 무료 도구, 커피챗, 미니 작업물 제작 위주로 추천한다.

[출력 내용]
6. profile.typeName: 사용자의 내면 강점과 잠재력을 요약한 전문적이고 멋진 유형 이름. 20자 이내. 예: "시스템을 설계하는 전략적 빌더", "본질을 엮는 스토리 아키텍트"
7. profile.summary: 사용자가 가진 성향의 가치와 앞으로 나아가면 좋을 방향성을 따뜻하고 통찰력 있게 짚어주는 한 문장. 해요체, 100자 이내.
8. profile.keywords: 핵심 잠재력 키워드 3개, 각 10자 이내.
9. activities[].name: 탐색 경험/프로젝트 이름, 20자 이내. 예: "1페이지 노코드 웹사이트 제작", "관심 직무 1:1 커피챗 인터뷰"
10. activities[].reason: 왜 이 경험을 해보는 것이 사용자의 진로/적성 탐색에 결정적인 징검다리가 되는지 설명. 해요체 1~2문장, 150자 이내.
11. activities[].steps:
    - today: 오늘 10분 안에 집에서 스마트폰/PC로 당장 할 수 있는 부담 없는 첫 행동. (레퍼런스 3개 찾기, 질문지 작성 등)
    - thisWeek: 이번 주에 30분~1시간 집중해서 해볼 구체적 실행.
    - twoWeeks: 2주 안에 작은 형태의 결과물(아티클, 웹페이지, 분석표 등)을 완성하여 스스로의 확신을 검증하는 행동.
    각 80자 이내, 동사형 마침.
12. activities[].tip: 지속과 성장을 위한 핵심 팁이나 마인드셋, 80자 이내.
13. wellbeingConcern: 깊은 무기력이나 자해/우울 신호가 감지되면 true.`;

const str = (description) => ({ type: 'string', description });

export const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    profile: {
      type: 'object',
      properties: {
        typeName: str('잠재력 유형 이름, 20자 이내'),
        summary: str('성향 및 방향성 설명 한 문장, 100자 이내'),
        keywords: { type: 'array', items: { type: 'string' }, description: '핵심 잠재력 키워드 3개' },
      },
      required: ['typeName', 'summary', 'keywords'],
      additionalProperties: false,
    },
    activities: {
      type: 'array',
      description: '추천 탐색 경험 정확히 3개',
      items: {
        type: 'object',
        properties: {
          name: str('탐색 경험 이름, 20자 이내'),
          category: { type: 'string', enum: Object.keys(CATEGORY_LABELS) },
          cost: { type: 'string', enum: COST_ORDER },
          difficulty: { type: 'string', enum: Object.keys(DIFFICULTY_LABELS) },
          reason: str('이 경험이 진로/적성에 도움되는 이유, 150자 이내'),
          steps: {
            type: 'object',
            properties: {
              today: str('오늘 10분 안에 할 첫 걸음'),
              thisWeek: str('이번 주에 할 일'),
              twoWeeks: str('2주 안에 완성할 작은 결과물'),
            },
            required: ['today', 'thisWeek', 'twoWeeks'],
            additionalProperties: false,
          },
          tip: str('방향성 팁, 없으면 빈 문자열'),
        },
        required: ['name', 'category', 'cost', 'difficulty', 'reason', 'steps', 'tip'],
        additionalProperties: false,
      },
    },
    wellbeingConcern: { type: 'boolean' },
  },
  required: ['profile', 'activities', 'wellbeingConcern'],
  additionalProperties: false,
};

const label = (qid, oid) => QUESTIONS.find((q) => q.id === qid).options.find((o) => o.id === oid)?.label || oid;
const strip = (s) => (typeof s === 'string' ? s.replace(/[<>]/g, '') : '');

export function buildInput({ answers, previous }) {
  const lines = [
    `몰입하는 순간: ${answers.mood.map((m) => label('mood', m)).join(', ')}`,
    `가장 갈증 느끼는 부분: ${label('company', answers.company)}`,
    `선호하는 환경: ${label('place', answers.place)}`,
    `원하는 시작 방식: ${label('energy', answers.energy)}`,
    `예산: ${label('budget', answers.budget)} (코드: ${answers.budget})`,
    `투자 시간: ${label('time', answers.time)}`,
  ];
  const prev = (previous ?? []).map((p) => `- ${strip(p.name)} (vote: ${p.vote})`).join('\n') || '없음';
  return `<answers>\n${lines.join('\n')}\n</answers>\n<note>\n${strip(answers.note) || '없음'}\n</note>\n<previous>\n${prev}\n</previous>`;
}
