# 해볼까

> 취미든 앞으로의 일이든, **내가 뭘 좋아하는지 아직 모르겠는 사람**을 위한 2분 자기 탐색 웹 서비스.

질문 11개로 그 사람을 알아본 뒤, AI가

1. **나의 유형** — 강점과 몰입 방식을 담은 이름
2. **나에게 맞는 방향** — 왜 이런 방향이 맞아 보이는지, 무엇부터 확인해 보면 좋을지, 눈여겨볼 분야
3. **직접 확인해 볼 경험 3가지** — 취미/진로 탐색, 해보면 알 수 있는 것, 오늘 10분 · 이번 주 · 2주 안 첫 걸음, 잘 맞으면 다음 단계

를 알려 주고, 고른 경험을 **내 캘린더에 바로 등록**하게 해 줍니다. 답변은 저장하지 않습니다.

- 화면: HTML + CSS + JavaScript (빌드 도구 없음)
- 서버: Vercel 서버리스 함수 1개 (`api/recommend.js`) → OpenAI API
- 문서: 작업 규칙 `AGENTS.md`, 제품 요구사항 `PRD.md`, 세부 구현 `docs/`

---

## 1. 미리 설치할 것

| 준비물 | 용도 | 확인 방법 |
|---|---|---|
| Node.js **24 LTS** | 서버 실행 | `node -v` → `v24.`으로 시작 |
| npm | 패키지 설치 | `npm -v` |
| Git | 코드 관리, Vercel 연동 | `git --version` |
| OpenAI API 키 | 실제 AI 추천 | platform.openai.com → API keys |
| Vercel 계정 | 로컬 실행·배포 | vercel.com (GitHub 계정으로 가입 권장) |

## 2. 처음 실행하기 (테스트 모드)

```bash
npm install
cp .env.example .env.local     # Windows: copy .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000` 을 엽니다. `.env.local`에 `MOCK_AI=true`이면 AI 대신 정해진 가짜 결과가 나오고(요금 없음), 결과 화면에 "테스트 모드" 배지가 보입니다.

처음 `npm run dev`를 실행하면 Vercel 로그인과 프로젝트 연결을 묻습니다. 화면 안내대로 진행하세요 (`docs/01-project-setup.md` 6장).

## 3. 실제 AI로 실행하기

1. `.env.local`을 열어 `OPENAI_API_KEY=sk-...` 에 내 키를 넣고 `MOCK_AI=false`로 바꿉니다.
2. 서버를 껐다가(Ctrl + C) `npm run dev`로 다시 실행합니다.

## 4. 테스트하기

```bash
npm test
```

모두 `pass`, `fail 0`이면 정상입니다. 화면 확인 목록은 `docs/10-testing-verification.md`에 있습니다.
테스트 모드에서 자유 입력에 `[[timeout]]`, `[[quota]]`, `[[wellbeing]]` 등을 넣으면 오류·안내 화면을 일부러 볼 수 있습니다.

## 5. 배포하기 (Vercel)

1. 이 저장소를 GitHub에 올립니다 (`.env.local`은 올라가지 않게 `.gitignore`에 들어 있습니다).
2. vercel.com → **Add New… → Project** → 이 저장소 **Import**
3. Framework Preset **Other**, Build Command·Output Directory는 비워 둡니다.
4. **Environment Variables**에 `OPENAI_API_KEY`(내 키)를 Production·Preview로 등록합니다. `MOCK_AI`는 등록하지 않습니다.
5. **Deploy**. 이후에는 `git push`할 때마다 자동으로 다시 배포됩니다.
6. **꼭** OpenAI 설정에서 월 사용 한도(예: $5)를 걸어 두세요. 로그인이 없어 누구나 주소만 알면 요청할 수 있습니다.

자세한 내용: `docs/11-deploy-vercel.md`

## 6. 자주 나는 문제

| 증상 | 해결 |
|---|---|
| 추천 받기 시 "서비스 설정에 문제가 있어요." | Vercel 환경변수에 `OPENAI_API_KEY`가 있는지 확인 → **Redeploy** |
| "서비스 사용 한도를 초과했어요." | OpenAI Billing에서 충전·한도 조정 |
| 배포 주소에서 404 | Framework Preset이 **Other**인지, `public/index.html`이 있는지 확인 |
| 로컬에서 키를 넣었는데 반영 안 됨 | 서버 재시작, 파일 이름이 정확히 `.env.local`인지 확인 |
| 로컬에서 항상 "테스트 모드" 배지 | `.env.local`의 `MOCK_AI=false`로 바꾸고 재시작 |

## 7. 주의

- **API 키를 코드나 Git에 절대 올리지 마세요.** 키는 `.env.local`(로컬)과 Vercel 환경변수에만 둡니다.
- 자유 입력에 이름·연락처 같은 개인정보를 쓰지 마세요. 추천을 위해 OpenAI로 전송됩니다.
- 추천과 방향은 "직접 확인해 볼 출발점"이지 정답이 아닙니다. 안전·가격·장소는 직접 확인하세요.
