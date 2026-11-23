# 04. 콘텐츠 정본 — 질문 · 선택지 · 라벨 · 문구

> 질문, 선택지 `id`, 라벨, 화면 문구의 **정본**입니다. 오류 문구는 `09-error-handling.md`.
> 1~3장은 `public/js/content.js` 한 파일에 그대로 옮기고, 서버도 이 파일을 `import`해서 씁니다 (`AGENTS.md` 4-3).

---

## 1. 질문 7개

| 순서 | `id` | 형식 | 제목 | 안내(hint) |
|---|---|---|---|---|
| 1 | `mood` | 복수 선택 **1~2개**, 타일 | 요즘 나에게 필요한 건 뭘까요? | 최대 2개까지 고를 수 있어요. |
| 2 | `company` | 하나 선택, 칩 | 누구와 하고 싶어요? | 하나만 골라 주세요. |
| 3 | `place` | 하나 선택, 칩 | 어디가 좋아요? | 하나만 골라 주세요. |
| 4 | `energy` | 하나 선택, 칩 | 몸은 얼마나 쓰고 싶어요? | 하나만 골라 주세요. |
| 5 | `budget` | 하나 선택, 칩 | 한 달에 쓸 수 있는 돈은요? | 하나만 골라 주세요. |
| 6 | `time` | 하나 선택, 칩 | 일주일에 낼 수 있는 시간은요? | 하나만 골라 주세요. |
| 7 | `note` | 자유 입력, **선택**, 300자 이하 | 요즘 관심 가는 것이나, 해봤는데 별로였던 게 있나요? | 적지 않아도 괜찮아요. 적으면 추천이 더 정확해져요. |

Q7 placeholder: `예) 요즘 사진에 관심이 생겼어요. 헬스장은 해봤는데 지루했어요.`

## 2. 선택지

| 질문 | `id` | 라벨 | 설명 (Q1만) |
|---|---|---|---|
| mood | `thrill` | 설렘 | 새롭고 짜릿한 경험 |
| mood | `focus` | 몰입 | 시간 가는 줄 모르는 집중 |
| mood | `rest` | 쉼 | 마음 편히 쉬는 시간 |
| mood | `people` | 사람 | 누군가와 함께하는 즐거움 |
| mood | `achieve` | 성취 | 해냈다는 뿌듯함 |
| mood | `learn` | 배움 | 새로운 걸 알아가는 재미 |
| company | `alone` | 혼자서 | |
| company | `close` | 친구·연인·가족과 | |
| company | `new` | 새로운 사람들과 | |
| company | `any` | 상관없어요 | |
| place | `indoor` | 실내 | |
| place | `outdoor` | 야외 | |
| place | `any` | 상관없어요 | |
| energy | `low` | 거의 안 움직이고 싶어요 | |
| energy | `mid` | 가볍게 움직이고 싶어요 | |
| energy | `high` | 땀 흘려도 좋아요 | |
| budget | `free` | 0원 (무료만) | |
| budget | `under30k` | 3만 원 이하 | |
| budget | `under100k` | 10만 원 이하 | |
| budget | `over100k` | 10만 원 넘어도 괜찮아요 | |
| time | `under1h` | 1시간 이하 | |
| time | `1to3h` | 1~3시간 | |
| time | `3to6h` | 3~6시간 | |
| time | `over6h` | 6시간 이상 | |

## 3. AI 결과에 쓰는 라벨

| 종류 | `id` → 화면 라벨 |
|---|---|
| 분류 `category` | `make` 만들기 · `move` 몸 쓰기 · `culture` 문화·감상 · `learn` 배우기 · `social` 함께하기 · `nature` 자연 · `play` 놀이·게임 · `mind` 마음 챙김 |
| 첫 달 예상 비용 `cost` | `free` 무료 · `under30k` 3만 원 이하 · `under100k` 3만~10만 원 · `over100k` 10만 원 이상 |
| 시작 난이도 `difficulty` | `easy` 바로 시작 · `normal` 조금 준비 · `challenge` 도전 |
| 첫 걸음 `steps` | `today` 오늘 · `thisWeek` 이번 주 · `twoWeeks` 2주 안 |

비용과 예산은 같은 순서입니다: `free(0) < under30k(1) < under100k(2) < over100k(3)`. 활동 비용 순위는 사용자 예산 순위보다 크면 안 됩니다 (프롬프트 규칙 + 품질 테스트로 확인).

## 4. `public/js/content.js` 모양

```js
// 질문·선택지·라벨: 프론트(app.js)와 서버(lib/validate.js, lib/prompt.js)가 함께 쓰는 순수 데이터
export const MAX_NOTE_LENGTH = 300;
export const MAX_MOOD = 2;
export const MAX_PREVIOUS = 9;

export const QUESTIONS = [
  { id: 'mood', type: 'multi', style: 'tile', title: '요즘 나에게 필요한 건 뭘까요?', hint: '최대 2개까지 고를 수 있어요.',
    options: [
      { id: 'thrill', label: '설렘', description: '새롭고 짜릿한 경험' },
      // … 2장 표 그대로
    ] },
  { id: 'company', type: 'single', style: 'chip', title: '누구와 하고 싶어요?', hint: '하나만 골라 주세요.', options: [/* … */] },
  // place, energy, budget, time
  { id: 'note', type: 'text', title: '요즘 관심 가는 것이나, 해봤는데 별로였던 게 있나요?',
    hint: '적지 않아도 괜찮아요. 적으면 추천이 더 정확해져요.',
    placeholder: '예) 요즘 사진에 관심이 생겼어요. 헬스장은 해봤는데 지루했어요.' },
];

export const CATEGORY_LABELS = { make: '만들기', move: '몸 쓰기', culture: '문화·감상', learn: '배우기', social: '함께하기', nature: '자연', play: '놀이·게임', mind: '마음 챙김' };
export const COST_LABELS = { free: '무료', under30k: '3만 원 이하', under100k: '3만~10만 원', over100k: '10만 원 이상' };
export const COST_ORDER = ['free', 'under30k', 'under100k', 'over100k'];
export const DIFFICULTY_LABELS = { easy: '바로 시작', normal: '조금 준비', challenge: '도전' };
export const STEP_LABELS = { today: '오늘', thisWeek: '이번 주', twoWeeks: '2주 안' };
```

> `content.js`는 `document`, `window`를 쓰지 않습니다 (Node에서도 불러오기 위해).

## 5. 화면 문구

| 위치 | 문구 |
|---|---|
| `<title>` | 해볼까 — 하고 싶은 걸 찾고, 오늘 바로 시작하기 |
| 로고 / 헤더 보조 | 해볼까 / 하고 싶은 걸 찾는 1분 |
| 시작 화면 | 3장 HTML 그대로 (`03-ui-layout-components.md`) |
| 질문 단계 | `{n} / 7` |
| 질문 버튼 | 이전 / 다음 / (7번에서 입력 없음) 건너뛰고 추천 받기 / (7번에서 입력 있음) 추천 받기 |
| 글자 수 | `{n} / 300자` |
| 로딩 제목 | 나에게 맞는 걸 찾고 있어요… |
| 로딩 메시지 (2.5초마다 순서대로 반복) | 답변을 살펴보고 있어요 → 끌릴 만한 활동을 고르고 있어요 → 첫 걸음을 작게 쪼개고 있어요 |
| 오류 화면 | 추천을 만들지 못했어요 / 답변 고치기 / 다시 시도 |
| 결과 제목 | 나에게 맞는 활동을 찾았어요 |
| 테스트 모드 배지 | 테스트 모드 |
| 유형 배지 | 나의 해볼까 유형 |
| 추천 카드 | 첫 달 예상 비용 / 오늘의 첫 걸음 / 팁 · {팁} / ▼ 별로예요 / ▲ 끌려요 / 이걸로 해볼래요 |
| 결과 버튼 | 다른 추천 받기 / 결과 복사하기 / 처음부터 다시 |
| 다른 추천 로딩 / 실패 | 새로운 활동을 찾고 있어요… / 다른 추천을 가져오지 못했어요 / 다시 시도 |
| 마음 건강 안내 | 요즘 많이 지치셨나요? / 혼자 견디지 않아도 괜찮아요. 자살예방 상담전화 109, 정신건강 위기상담전화 1577-0199에서 24시간 이야기를 들어드려요. |
| 계획 제목 | `{활동 이름}, 이렇게 시작해요` |
| 계획 화면 | 완벽하게 말고, 일단 오늘 10분만 해봐요. / 첫 걸음 3단계 / 체크 표시는 저장되지 않아요. / 언제 시작할까요? / 날짜 / 시간 |
| 계획 버튼 | ← 다른 활동 보기 / 캘린더 파일 받기 / Google 캘린더에 추가 / 계획 복사하기 |
| 계획 안내 | 아이폰은 '캘린더 파일 받기', 갤럭시·PC는 'Google 캘린더에 추가'가 편해요. 일정 30분 전에 알림이 와요. |
| 시간 오류 | 날짜와 시간을 모두 골라 주세요. / 지난 시간은 고를 수 없어요. |
| 복사 결과 | 복사했어요. 원하는 곳에 붙여 넣으세요. / 복사하지 못했어요. 직접 선택해서 복사해 주세요. |
| 화면낭독기 알림 | 추천을 만들고 있어요 / 추천 3개가 도착했어요. 나의 유형은 {유형 이름}이에요. / 새로운 추천 3개가 도착했어요. |
| 푸터 | 3장 HTML 그대로 |
