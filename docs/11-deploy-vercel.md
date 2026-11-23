# 11. Vercel 배포

> 🔒 **이 단계는 사용자 확인을 받은 뒤 진행합니다** (`AGENTS.md` 7장).
> 에이전트는 계정 로그인, 환경변수 입력, 배포 버튼 클릭을 **사용자 대신 하지 않고**, 사용자가 따라 할 수 있도록 안내합니다.

---

## 1. 배포 전 확인

- [ ] `docs/10` 2~6장 테스트가 모두 ✅
- [ ] `git status`에 `.env.local`이 보이지 않음
- [ ] `vercel.json`, `package.json`이 `docs/01`과 같음

---

## 2. 방법 A (권장) — GitHub 연결 배포

GitHub에 코드를 올리면, 이후 `git push`할 때마다 Vercel이 **자동으로 다시 배포**합니다.

### 2-1. GitHub에 올리기
1. github.com에서 새 저장소(Repository) 만들기 — 이름 `haebolkka`, **Private** 권장, README 추가 안 함
2. 프로젝트 폴더 터미널에서:
   ```bash
   git init
   git add .
   git commit -m "해볼까 v1"
   git branch -M main
   git remote add origin https://github.com/<내아이디>/haebolkka.git
   git push -u origin main
   ```
3. 올리기 전에 `git status`로 `.env.local`이 목록에 **없는지** 한 번 더 확인합니다.

### 2-2. Vercel에서 가져오기
1. vercel.com 로그인 → **Add New… → Project**
2. GitHub 저장소 목록에서 `haebolkka` → **Import**
3. 설정 화면에서:
   | 항목 | 값 |
   |---|---|
   | Framework Preset | **Other** |
   | Root Directory | `./` (그대로) |
   | Build Command | 비워 둠 (Override 끔) |
   | Output Directory | 비워 둠 (`public` 폴더가 자동으로 사용됨) |
   | Install Command | 그대로 |

### 2-3. 환경변수 등록 (가장 중요)
같은 설정 화면의 **Environment Variables**에서:

| Key | Value | 환경 |
|---|---|---|
| `OPENAI_API_KEY` | `sk-...` (내 키) | Production, Preview |
| `OPENAI_MODEL` | (선택) 비워 두면 `gpt-6-luna` | Production, Preview |

- **`MOCK_AI`는 등록하지 않습니다.** (등록해도 Production에서는 무시되지만, 헷갈림을 막기 위해)
- 키는 **Sensitive**(민감 정보)로 표시되는 옵션이 있으면 켭니다.

4. **Deploy** 클릭 → 1~2분 뒤 `https://haebolkka-xxxx.vercel.app` 주소가 생깁니다.

> 배포한 뒤에 환경변수를 추가·변경했다면 **Deployments → 최신 배포 → ⋯ → Redeploy**로 다시 배포해야 적용됩니다.

---

## 3. 방법 B — 터미널(Vercel CLI)로 배포

GitHub을 쓰지 않을 때:

```bash
npx vercel                # 미리보기(Preview) 배포
npx vercel env add OPENAI_API_KEY production   # 키 입력 (화면 안내에 따라 붙여넣기)
npx vercel --prod         # 실제(Production) 배포
```

---

## 4. 비용 안전장치 (꼭 설정)

이 서비스는 로그인이 없어서 **누구나 주소만 알면 추천을 요청할 수 있습니다.** 요금 폭탄을 막기 위해:

1. platform.openai.com → **Settings → Limits(또는 Billing)** 에서 **월 사용 한도(budget)** 를 작게 설정 (예: $5)
2. 한도 근처에서 이메일 알림을 받도록 설정
3. 한도에 닿으면 서비스는 자동으로 "서비스 사용 한도를 초과했어요." 안내를 보여줍니다 (`AI_QUOTA_EXCEEDED`).
4. 이 서비스 전용 API 키를 따로 만들어 쓰면, 문제가 생겼을 때 그 키만 삭제하면 됩니다.

---

## 5. 배포 후 할 일

1. `docs/10` 7장 **D-01 ~ D-07** 검증
2. 결과를 `AGENTS.md` 8장 형식으로 보고
3. (선택) Vercel → Settings → Domains에서 원하는 주소로 변경

서버 함수 실행 지역은 기본값(미국 동부)을 그대로 씁니다. OpenAI 서버와 가까워 응답이 빠른 편이라 바꾸지 않습니다.

---

## 6. 자주 나는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| 화면은 뜨는데 추천 받기 시 "서비스 설정에 문제가 있어요." | 환경변수에 키가 없거나 틀림, 등록 후 재배포 안 함 | 2-3 확인 → Redeploy. Logs에서 `[recommend]` 줄 확인 (`docs/09` 6장) |
| "서비스 사용 한도를 초과했어요." | OpenAI 잔액·한도 소진 | OpenAI Billing에서 충전·한도 조정 |
| 배포 주소에서 404 | `public/index.html`이 없거나 Framework Preset이 Other가 아님 | 파일 위치 확인, 설정 Other로 |
| 글꼴이 기본 글꼴로 보임 | CSP `font-src`가 다르거나 `fonts.css` 주소 오타 | `vercel.json`과 `docs/02` 3-1 비교 |
| 로컬(`npm run dev`)에서 키를 넣었는데 반영 안 됨 | 서버 재시작 안 함, 파일 이름이 `.env.local`이 아님 | Ctrl+C 후 `npm run dev` 다시, 파일 이름 확인 |
| 로컬에서 항상 "테스트 모드" 배지 | `.env.local`의 `MOCK_AI=true` | `MOCK_AI=false`로 바꾸고 재시작 |
| `npm run dev` 첫 실행에서 로그인 요구 | Vercel CLI 최초 연결 | `docs/01` 6장 안내대로 진행 |
| "AI 응답이 너무 오래 걸려요."가 자주 뜸 | OpenAI 응답 지연 | 잠시 후 재시도. 계속되면 Logs 확인 후 사용자에게 보고 |
