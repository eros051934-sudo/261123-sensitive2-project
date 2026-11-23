# 12. Supabase 도입 계획 (v2 후보) — ⛔ v1에서 구현 금지

> 참고용입니다. 사용자가 "v2 시작"을 명시적으로 요청하기 전까지 구현하지 않습니다 (`AGENTS.md` X-09).

## 1. v1에서 쓰지 않는 이유
v1은 한 번 방문으로 끝나고, 계획은 사용자의 **캘린더 앱**에 저장됩니다. 사람별 기록을 남기려면 로그인이 필요해 범위가 크게 늘어납니다 (`PRD.md` 9장).

## 2. Supabase가 필요해지는 기능
| 후보 기능 | 저장할 것 | 필요한 이유 |
|---|---|---|
| 내 도전 기록 | 고른 활동, 첫 걸음 체크 상태 | 다른 기기·다음 방문에서도 보려면 |
| 해본 뒤 회고 ("해보니 어땠어요?") | 만족도, 계속할지 여부 | 다음 추천을 더 정확하게 |
| 인기 활동 통계 | 활동 분류별 선택 수 (개인 정보 없이) | 운영 지표 |
| 서버 요청 횟수 제한 | 최근 요청 수 | 서버리스는 메모리가 요청마다 초기화됨 |

## 3. 도입할 때 지킬 원칙 (초안)
1. 로그인은 Supabase Auth(이메일 매직링크 등)를 쓰고, **자유 입력(Q7) 원문은 저장하지 않는 것을 기본**으로 합니다.
2. service role 키는 서버(`api/`)에서만. 브라우저에는 anon 키만 쓰고 모든 테이블에 RLS(행 단위 보안)를 켭니다.
3. 새 환경변수 `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. 새 패키지 `@supabase/supabase-js`는 사용자 승인 후.

## 4. 테이블 초안 (예: 도전 기록)
```sql
create table challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  activity_name text not null check (char_length(activity_name) <= 20),
  category text not null,
  steps jsonb not null,            -- { today, thisWeek, twoWeeks, done: [false,false,false] }
  planned_at timestamptz
);
alter table challenges enable row level security;
create policy "본인 기록만" on challenges for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## 5. v2를 시작할 때 할 일
1. `PRD.md`에 새 FR 추가, 범위 표 갱신
2. 이 문서를 구현 명세 수준으로 다시 작성
3. `AGENTS.md`의 X-03, X-08, X-09를 사용자와 함께 수정
