# 01. 프로젝트 생성 지침

> 이 문서대로 하면 빈 폴더에서 "실행 가능한 뼈대"까지 만들 수 있습니다.
> 완료 조건: `AGENTS.md` 7장 1단계.

---

## 1. 준비물 (사람이 미리 설치)

| 준비물 | 용도 | 확인 방법 |
|---|---|---|
| Node.js **24 LTS** | JavaScript 서버 실행 | 터미널에서 `node -v` → `v24.`으로 시작 |
| npm | 패키지 설치 (Node.js와 함께 설치됨) | `npm -v` |
| Git | 코드 버전 관리, Vercel 연동 | `git --version` |
| OpenAI API 키 | AI 호출 (6단계부터 필요) | platform.openai.com → API keys |
| Vercel 계정 | 로컬 실행(`vercel dev`)과 배포 | vercel.com 가입 (GitHub 계정으로 가입 권장) |

> Node.js가 22 이하라면 nodejs.org에서 24 LTS를 설치합니다. Vercel 배포 환경과 버전을 맞추기 위해서입니다.

---

## 2. 폴더 만들기

`AGENTS.md` 5장의 구조를 그대로 만듭니다. 터미널(프로젝트 폴더 안)에서:

```bash
mkdir -p public/css public/js api lib tests
```

> `docs/`, `AGENTS.md`, `PRD.md`는 이미 있습니다. 덮어쓰지 않습니다.

---

## 3. `package.json`

아래 내용으로 **직접 파일을 만든 뒤** 패키지를 설치합니다. (`npm init`을 쓰지 않습니다 — 불필요한 항목이 생기기 때문)

```json
{
  "name": "haebolkka",
  "version": "1.0.0",
  "private": true,
  "description": "해볼까 - 하고 싶은 걸 찾고 첫 걸음을 만들어 주는 웹 서비스",
  "type": "module",
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "dev": "vercel dev",
    "test": "node --test"
  }
}
```

그다음 설치:

```bash
npm install openai
npm install --save-dev vercel
```

- 버전 번호는 설치 시점의 최신 버전이 자동으로 기록됩니다. **버전을 손으로 바꾸지 않습니다.**
- 이 두 개 외의 패키지는 설치하지 않습니다 (`AGENTS.md` X-03).

| 항목 | 의미 |
|---|---|
| `"type": "module"` | `import`/`export` 문법을 쓰겠다는 설정 |
| `"engines"` | Vercel이 Node.js 24로 실행하도록 지정 |
| `npm run dev` | 로컬에서 Vercel과 똑같은 환경으로 실행 (`http://localhost:3000`) |
| `npm test` | `tests/` 폴더의 `*.test.js`를 Node.js 내장 테스트 도구로 실행 |

---

## 4. 환경변수 파일

### 4-1. `.env.example` (Git에 올림 — 실제 키를 쓰지 않음)

```bash
# OpenAI API 키 (필수, 서버에서만 사용). 실제 값은 .env.local 에 넣으세요.
OPENAI_API_KEY=

# 사용할 OpenAI 모델 (선택). 비워두면 코드 기본값 gpt-6-luna 사용.
OPENAI_MODEL=

# 테스트용 가짜 AI 모드 (선택). true 이면 OpenAI를 호출하지 않음. 배포 환경에는 넣지 마세요.
MOCK_AI=true
```

### 4-2. `.env.local` (Git에 올리지 않음 — 사람이 직접 만듦)

`.env.example`을 복사해서 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

- 1~5단계: `MOCK_AI=true` 그대로 두면 API 키 없이 개발할 수 있습니다.
- 6단계: 사용자가 `OPENAI_API_KEY=sk-...`를 채우고 `MOCK_AI=false`로 바꿉니다. **에이전트는 키를 대신 입력하거나 요청하지 않고, 사용자에게 직접 넣어 달라고 안내합니다.**

| 변수 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `OPENAI_API_KEY` | 실제 분석 시 필수 | 없음 | 없으면 서버가 `SERVER_CONFIG_ERROR` 반환 |
| `OPENAI_MODEL` | 선택 | `gpt-6-luna` | 값이 있으면 그 모델 사용 |
| `MOCK_AI` | 선택 | `false` | 정확히 문자열 `true`일 때만 Mock 모드. Vercel Production에서는 무시 |

---

## 5. 설정 파일

### 5-1. `.gitignore`

```gitignore
node_modules/
.vercel/
.env
.env.local
.env*.local
.DS_Store
```

### 5-2. `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "api/recommend.js": {
      "maxDuration": 40
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self'; font-src https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
        }
      ]
    }
  ]
}
```

| 설정 | 쉬운 설명 |
|---|---|
| `maxDuration: 40` | 서버 함수가 최대 40초까지만 실행되도록 제한 |
| `Content-Security-Policy` | 우리 사이트의 파일과 Pretendard 글꼴 CDN만 불러오도록 허용. 외부 악성 스크립트 차단 |
| `X-Frame-Options: DENY` | 다른 사이트가 우리 페이지를 몰래 액자(iframe)처럼 넣지 못하게 함 |

> CSP 때문에 HTML 안에 `<script>...</script>`, `<style>...</style>`, `style="..."`를 직접 쓰면 동작하지 않습니다. 모든 JS·CSS는 별도 파일로 만듭니다.

### 5-3. 정적 파일이 서비스되는 방식

Vercel은 프레임워크가 없는 프로젝트("Other")에서 **`public` 폴더가 있으면 그 안의 파일을 웹사이트로** 내보냅니다. 따라서:

- `public/index.html` → `https://주소/`
- `public/css/style.css` → `https://주소/css/style.css`
- `api/recommend.js` → `https://주소/api/recommend` (서버 함수)
- `lib/`, `tests/`, `.env.local`은 웹으로 공개되지 않습니다.

---

## 6. 로컬 실행

```bash
npm run dev
```

- 처음 실행하면 Vercel 로그인과 프로젝트 연결을 물어봅니다. 화면 안내대로 진행합니다.
  - `Set up and develop "..."?` → **Y**
  - `Which scope?` → 본인 계정
  - `Link to existing project?` → **N** (처음이면)
  - `What's your project's name?` → `haebolkka`
  - `In which directory is your code located?` → `./` (엔터)
  - 프레임워크 설정을 묻거나 자동 감지 결과가 나오면 **Other**인지 확인하고, 빌드 명령은 비워 둡니다.
- 실행 후 브라우저에서 `http://localhost:3000` 접속.
- `vercel dev`는 `.env.local`의 값을 읽습니다. 값을 바꾸면 **서버를 껐다가(Ctrl + C) 다시 실행**합니다.
- 1단계에서는 아직 `index.html`이 없으므로 404가 정상입니다.

---

## 7. `README.md` 작성 지침 (7단계에서 작성)

사람이 읽는 문서입니다. 아래 목차와 내용으로 작성합니다.

1. **해볼까란?** — PRD 1장의 한 줄 요약
2. **미리 설치할 것** — 이 문서 1장의 표
3. **처음 실행하기** — `npm install` → `.env.local` 만들기 → `npm run dev` → `http://localhost:3000`
4. **실제 AI로 실행하기** — `.env.local`에 `OPENAI_API_KEY` 입력, `MOCK_AI=false`, 서버 재시작
5. **테스트하기** — `npm test`
6. **배포하기** — `docs/11-deploy-vercel.md` 요약 + 링크
7. **자주 나는 문제** — `docs/11` 6장 표 요약
8. **주의** — API 키를 Git에 올리지 말 것, 자유 입력에 개인정보를 쓰지 말 것

---

## 8. 1단계 완료 조건

- [ ] `AGENTS.md` 5장 구조의 폴더가 있다.
- [ ] `package.json`, `.env.example`, `.gitignore`, `vercel.json`이 이 문서와 같다.
- [ ] `node_modules/openai`, `node_modules/vercel`이 설치되어 있다.
- [ ] `npm test`가 오류 없이 끝난다.
- [ ] `git status`에 `.env.local`이 나타나지 않는다(무시되고 있다).
