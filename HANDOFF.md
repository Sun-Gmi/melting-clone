# melting-clone 인수인계 문서

> 이 문서 하나만 읽으면 지금까지의 맥락을 이해하고 작업을 이어갈 수 있도록 정리했습니다.
> 새 Claude Code 세션은 **먼저 이 문서를 끝까지 읽고** 작업을 시작하세요.
> 최종 갱신: 2026-09-04

---

## 1. 프로젝트 한 줄 요약

한국 AI 캐릭터 채팅 서비스 **melting.chat** 을 레퍼런스로 만든 **개인 학습용 클론**.
상업적 목적이 아니며, 원본의 문구·이미지는 쓰지 않고 구조와 디자인 토큰만 참고했습니다.

**현재 상태: 실제로 AI와 캐릭터 대화가 되는 수준까지 완성되어 배포됨.**

| 항목 | 값 |
|---|---|
| 배포 사이트 | https://melting-clone.vercel.app |
| GitHub | https://github.com/Sun-Gmi/melting-clone (private, 기본 브랜치 `main`) |
| 로컬 경로 | `C:\Users\SunSunwoo\OneDrive - Altos Ventures\Documents\Claude\Projects\Melting Copy\melting-clone` |

---

## 2. 계정 / 인프라 정보

| 서비스 | 세부 정보 |
|---|---|
| **GitHub** | 계정 `Sun-Gmi` · 저장소 `melting-clone` (private) |
| **Vercel** | 팀 슬러그 `sw-4763` (Hobby 플랜) · 프로젝트 `melting-clone`<br>⚠️ **`melting-clones` 라는 중복 프로젝트가 하나 더 있음** — 같은 저장소를 물고 있는 실수. 환경변수는 `melting-clone` 쪽에만 있으니 중복은 삭제 권장 |
| **Supabase** | 조직 `Sun-Gmi's Org` (Free) · 프로젝트 `Sun-Gmi's Project`<br>project ref: `hqiyegjkehlavfjwsiju`<br>URL: `https://hqiyegjkehlavfjwsiju.supabase.co`<br>리전: AWS 서울 (ap-northeast-2) |
| **Google AI Studio (Gemini)** | ⚠️ 계정이 다름. GitHub/Vercel/Supabase 는 회사 계정 흐름이지만 **Gemini 키는 개인 Gmail `seunghwan.sunwoo@gmail.com`** 으로 발급됨.<br>크롬에서 접근하려면 `https://aistudio.google.com/apikey?authuser=1` (authuser=1 이어야 개인 계정) · GCP 프로젝트명 `melting-copy` |

> **Supabase 무료 플랜은 약 1주일간 사용이 없으면 자동 일시정지(pause)** 됩니다.
> 정지되면 대시보드에서 `Resume project` 를 눌러야 하고, 기동에 1~3분 걸립니다.
> 정지 중에도 랜딩/탐색 페이지는 정적 폴백 데이터로 정상 표시되지만 **채팅은 실패**합니다.

---

## 3. 기술 스택

```
Next.js 16.3.3 (App Router, Turbopack)
React 19.2.8
Tailwind CSS v4
TypeScript 5
@supabase/supabase-js ^2.112.4
server-only ^0.0.1
LLM: Google Gemini (무료 티어, REST 직접 호출 — SDK 미사용)
```

⚠️ **저장소 루트에 `AGENTS.md` / `CLAUDE.md` 가 있고, "이 Next.js 는 당신이 아는 버전이 아니다.
`node_modules/next/dist/docs/` 를 읽고 코드를 쓰라"고 되어 있습니다.** 이 파일은 `next dev` 가
자동으로 다시 만들기 때문에 지우지 마세요. Next 16 관련 작업 전에 해당 docs 를 참고하세요.

---

## 4. 파일 지도

```
app/
  page.tsx                 랜딩(홍보) 페이지 — 히어로/호감도 소개/장르 태그/크리에이터 혜택
  characters/page.tsx      탐색 화면 — 캐릭터 그리드, 실시간 인기/라이징 섹션
  chat/[id]/page.tsx       채팅 페이지 (서버 컴포넌트) — 캐릭터를 불러와 ChatRoom 에 넘김
  api/chat/route.ts        ★ 채팅 API. LLM 호출과 대화 저장이 전부 여기서 일어남
  layout.tsx               Pretendard 폰트 로드, 메타데이터
  globals.css              Tailwind + 다크 테마 토큰

components/
  ChatRoom.tsx             ★ 채팅 UI (클라이언트 컴포넌트). 낙관적 전송, 타이핑 표시, 오류 복구
  CharacterCard.tsx        탐색 화면의 카드
  CharacterArt.tsx         썸네일 대체 그라디언트 아트 (실제 이미지 파일 없음)
  AppShell.tsx             앱 상단바 / 하단 네비게이션

lib/
  characters.ts            Character 타입 + 정적 폴백 데이터 12명
  personas.json            ★ 캐릭터 설정 원본 (단일 진실 공급원)
  prompt.ts                ★ 페르소나 → LLM 시스템 프롬프트 변환. 대화 품질의 핵심
  llm.ts                   ★ LLM 호출부. 제공자 교체 시 이 파일만 수정
  data.ts                  캐릭터 조회 (Supabase → 실패 시 정적 폴백)
  supabase.ts              브라우저/서버 공용 클라이언트 (publishable 키)
  supabaseAdmin.ts         서버 전용 클라이언트 (secret 키, RLS 우회)
  conversation.ts          대화방/메시지 저장·조회 (server-only)

supabase/
  schema.sql               001: characters 테이블 + RLS + 시드 12명
  002_personas.sql         002: 페르소나 컬럼 7개 추가 + 12명 데이터 (personas.json 에서 생성됨)
  003_conversations.sql    003: conversations / messages 테이블
```

---

## 5. 데이터 모델 (Supabase)

### `characters` — 캐릭터 12명
표시용 필드: `id, name, quote, tags[], creator, chats, likes, badge, multi_image, art(jsonb), intro, first_message, sort_order`

LLM 연기용 페르소나 필드 (7개, 전부 `text`):
`age, occupation, personality, speech_style, background, relationship, taboos`

- **RLS: 켜짐 + 익명 읽기 허용 정책 있음** → publishable 키로 조회 가능 (공개 정보라 의도된 것)
- `speech_style` 과 `taboos` 가 캐릭터 개성을 만드는 핵심 필드. 예: 리안은 절대 반말을 쓰지 않고,
  강도현은 "감정을 직접 고백하지 않고 불리하면 계약 이야기로 도망친다"

### `conversations` — 대화방
`id(uuid), user_key(text), character_id(FK), affinity(int, 기본 30), created_at, updated_at`
- `(user_key, character_id)` 유니크 → 한 사람이 한 캐릭터와 갖는 방은 1개
- `user_key` 는 **로그인이 없어서** 브라우저 `localStorage["melting.userKey"]` 에 저장한 익명 UUID

### `messages` — 메시지
`id(uuid), conversation_id(FK), role('user'|'assistant'), content(text), created_at`

- **`conversations` / `messages` 는 RLS 켜짐 + 정책 없음** → 익명 키로는 절대 접근 불가.
  서버의 `SUPABASE_SECRET_KEY` 만 읽고 쓸 수 있습니다. (검증 완료: publishable 키로 조회 시 `[]` 반환)

---

## 6. 환경변수

`.env.local` (로컬) 과 Vercel 프로젝트 설정 양쪽에 있어야 합니다. **값은 이 문서에 적지 않았습니다.**

| 변수 | 노출 범위 | 용도 | 어디서 얻나 |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 공개 | Supabase 주소 | `https://hqiyegjkehlavfjwsiju.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 | 캐릭터 조회용 publishable 키 (`sb_publishable_…`) | Supabase → Settings → API Keys |
| `GEMINI_API_KEY` | **서버 전용** | LLM 호출 | AI Studio (authuser=1 개인 계정) |
| `SUPABASE_SECRET_KEY` | **서버 전용** | 대화 기록 읽기/쓰기 (`sb_secret_…`) | Supabase → Settings → API Keys → Secret keys |
| `LLM_MODELS` | 선택 | 시도할 모델 목록(쉼표 구분). 미설정 시 코드 기본값 사용 | — |

🚨 **`GEMINI_API_KEY` 와 `SUPABASE_SECRET_KEY` 에 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요.**
붙이면 브라우저 번들에 그대로 실려 누구나 볼 수 있습니다.

- 기존 개발 PC에는 `.env.local` 이 이미 있습니다 (git 에서 제외됨 — `.gitignore` 확인 완료).
- Vercel 에는 4개 모두 등록되어 있고, 서버 전용 2개는 **Secret 타입**(저장 후 값 조회 불가)입니다.
- 새 PC에서 시작한다면 `.env.local.example` 을 복사해 위 표대로 값을 채우세요.

---

## 7. 개발 워크플로

```bash
npm install                      # 최초 1회
npm run dev --prefix melting-clone   # 개발 서버 (localhost:3000)
npm run build                    # 타입 검사 포함 — 커밋 전 반드시 통과시킬 것
```

- **배포**: `main` 브랜치에 push 하면 Vercel 이 자동 배포합니다. 별도 명령 불필요.
- **환경변수를 바꾼 경우**에는 push 만으로는 반영되지 않고 Vercel 에서 **Redeploy** 를 눌러야 합니다.

### DB 스키마 변경하는 법
Supabase CLI 를 쓰지 않고 **대시보드 SQL Editor 에 직접 붙여넣어** 실행해 왔습니다.
`supabase/*.sql` 파일은 실행 기록이자 재현용 대본입니다. 새 변경은 `004_*.sql` 처럼 번호를 이어가세요.

브라우저 자동화로 SQL 을 넣을 때 쓴 방법 (긴 SQL 은 이 방식이 확실함):
1. PowerShell `Set-Clipboard` 로 SQL 파일 내용을 클립보드에 올림
2. SQL Editor 페이지에서 Monaco 에디터를 비우고 포커스 → `Ctrl+V`
3. Run 버튼 클릭 (`drop`/`update` 가 있으면 "destructive" 경고 확인 창이 한 번 더 뜸)

---

## 8. 중요한 설계 결정과 이유

1. **로그인 없음** — 사용자가 처음부터 제외하기로 한 범위. 대신 브라우저별 익명 UUID 로 대화를 구분합니다.
   나중에 로그인을 붙이면 `user_key` 를 실제 유저 ID로 바꾸는 것으로 자연스럽게 연결됩니다.

2. **캐릭터 이미지 없음** — 원본 일러스트는 저작물이라 쓸 수 없어서, 캐릭터마다 고유한
   그라디언트 + 이모지 조합(`CharacterArt.tsx`)으로 대체했습니다. 이미지 파일이 0개라 로딩도 빠릅니다.

3. **정적 폴백** — Supabase 가 없거나 정지되어도 앱이 죽지 않도록 `lib/data.ts` 가
   `lib/characters.ts` 의 정적 데이터로 자동 폴백합니다. **이 안전장치를 깨뜨리지 마세요.**

4. **personas.json 이 단일 진실 공급원** — `002_personas.sql` 은 이 JSON 에서 스크립트로 생성했습니다.
   페르소나를 고칠 때 JSON 과 DB 가 따로 놀지 않게 하려는 의도입니다.

5. **ISR (`revalidate = 60`)** — 페이지가 완전 정적이면 DB를 고쳐도 사이트에 영원히 반영되지 않습니다.
   실제로 그 상태였고, 발견해서 고쳤습니다. 세 페이지 모두 60초마다 갱신됩니다.

6. **대화 기록은 서버에서만 접근** — 익명 키에 쓰기 권한을 주면 남의 대화를 읽거나 조작할 수 있어서,
   RLS 정책을 아예 만들지 않고 서버 secret 키로만 접근하게 했습니다.

7. **LLM 은 Gemini 무료 티어** — 사용자가 "가장 저렴한 것 / 무료" 를 원했습니다.
   `lib/llm.ts` 한 파일만 고치면 Claude 등으로 교체 가능하도록 격리해 두었습니다.
   (참고로 비용 비교: Claude Haiku 4.5 ≈ 4원/턴, Sonnet 5 ≈ 8원/턴, Opus 5 ≈ 21원/턴)

---

## 9. ⚠️ 반드시 알아야 할 함정들 (실제로 겪은 문제)

### LLM / Gemini
- **무료 티어는 503 "high demand" 를 자주 냅니다.** 모델 하나만 재시도하는 걸로는 부족했습니다.
  `lib/llm.ts` 는 **3개 모델을 순차 시도**합니다: `gemini-3.5-flash` → `gemini-3.1-flash-lite` → `gemini-3.7-flash`.
  - 벤치마크 결과(2026-09-04): 3.5-flash 2.7초로 가장 안정적. **`gemini-3.8-flash` 와 `gemini-flash-latest` 는 당시 계속 실패**했습니다.
  - 모델별 혼잡도는 수시로 바뀌므로, 느려지면 다시 벤치마크해서 순서를 조정하세요.
- **fetch 에 반드시 타임아웃을 거세요.** 처음엔 없었고, 실제로 요청이 **무한정 매달리는** 버그가 났습니다.
  현재: 시도당 15초(AbortController) + 전체 예산 45초.
- **Vercel 함수 실행 제한** 때문에 `app/api/chat/route.ts` 에 `export const maxDuration = 60` 이 있습니다.
  전체 재시도 예산(45초)은 이 한도 안에 있어야 합니다. 재시도를 늘릴 거면 같이 계산하세요.

### 윈도우 개발 환경
- **Bash 로 한글이 든 curl 요청을 보내면 글자가 깨집니다** (`? ?? ? ????`).
  실제로 이것 때문에 "AI가 기억을 못 한다"고 오진할 뻔했습니다.
  → 한글 페이로드는 **Python 으로 UTF-8 JSON 파일을 쓴 뒤 `curl --data-binary @file.json`** 으로 보내세요.
- **Python 으로 한글을 출력할 때** `PYTHONIOENCODING=utf-8` 을 설정하세요. 없으면 cp1252 오류가 납니다.
- **PowerShell `Set-Content -Encoding utf8` 은 BOM 을 붙입니다.** `.env.local` 에 BOM 이 붙어
  bash `source` 가 깨졌던 적이 있습니다. `[System.IO.File]::WriteAllLines` 에
  `UTF8Encoding($false)` 를 쓰거나 나중에 BOM 을 제거하세요.
- **git push 가 "terminal prompts disabled" 로 실패**하면 `GIT_TERMINAL_PROMPT=1` 을 설정하고
  재시도하세요. Git Credential Manager 가 처리합니다 (최초 1회 이후로는 저장됨).
- curl 이 `CRYPT_E_NO_REVOCATION_CHECK` 로 실패하면 `--ssl-no-revoke` 를 붙이세요.

### 브라우저 자동화 (Vercel/Supabase 대시보드 조작 시)
- **Vercel 환경변수 다이얼로그는 까다롭습니다.** `Escape` 키를 누르면 드롭다운이 아니라
  **다이얼로그 전체가 닫히며 입력이 날아갑니다.** JS `.focus()` 후 `Ctrl+V` 도 잘 안 먹습니다.
  → **좌표 클릭 + `type` 액션**이 가장 확실했습니다.
- Supabase SQL Editor 는 Monaco 라서 `window.monaco.editor.getEditors()[0].setValue(...)` 로
  내용을 직접 넣을 수 있습니다 (긴 SQL 은 클립보드 붙여넣기가 더 안전).
- 페이지를 벗어날 때 "Leave site?" 경고가 뜨면 `navigate` 에 `force: true` 를 주세요.

---

## 10. 아직 안 된 것 / 알려진 한계

| 항목 | 상태 |
|---|---|
| **호감도 시스템** | UI 게이지는 있지만 **장식**. `conversations.affinity` 컬럼은 있으나 항상 30 고정이고 대화에 반응하지 않음 |
| **로그인** | 의도적으로 제외. 기기를 바꾸면 대화가 안 보임 |
| **스트리밍** | 미구현. 답변이 다 만들어질 때까지 타이핑 표시만 보임 (보통 4초, 혼잡하면 더 길어짐) |
| **대화 목록 화면** | 하단 네비의 "대화" 탭은 탐색 페이지로 연결된 더미 |
| **캐릭터 만들기** | "창작" 탭 더미. 생성 기능 없음 |
| **탐색 페이지 필터/탭** | 태그 칩과 추천/라이징/태그 탭이 **클릭해도 동작 안 함** (표시만) |
| **이미지** | 실제 일러스트 없음 (그라디언트 아트로 대체) |
| **대화 길이 관리** | 최근 30턴(`HISTORY_LIMIT`)만 전송. 그 이전 내용은 잊습니다. 요약/압축 미구현 |
| **테스트 코드** | 없음. 검증은 빌드 + 브라우저/curl 수동 확인으로 해왔습니다 |

---

## 11. 다음 단계 후보 (사용자와 논의된 것)

1. **호감도 실제 동작** — LLM 이 답변과 함께 호감도 증감을 판정하도록 하고 `conversations.affinity` 갱신
2. **스트리밍 응답** — 한 글자씩 흘려보내 체감 속도 개선 (Gemini `streamGenerateContent`)
3. **대화 목록 화면** — 진행 중인 대화들을 보여주는 "대화" 탭 구현
4. **탐색 페이지 필터 동작** — 태그 클릭 시 실제 필터링

---

## 12. 사용자에 대해 알아둘 것

- **개발 지식이 없는 분입니다.** 코드 용어를 그대로 쓰지 말고 비유와 함께 풀어서 설명해 주세요.
  (예: GitHub = "코드 전용 클라우드", 커밋 = "게임 세이브 포인트")
- **한국어로 소통합니다.**
- 이 프로젝트는 **연습 목적**입니다. 완벽함보다 "직접 만들어보며 이해하는 것"이 목적입니다.
- 작업을 시킨 뒤 **"지금까지 뭐 했는지 설명해줘"** 라고 물어보는 편입니다. 진행 상황을 정리해 둘 것.
- 검증을 중요하게 여깁니다. **"될 것 같다"가 아니라 실제로 실행해서 확인**한 결과를 보고하세요.
  (예: DB 값을 잠깐 바꿔 배포 사이트에 반영되는지 실제로 확인한 뒤 되돌리는 식)

---

## 13. 빠른 상태 점검 명령

새 세션에서 현재 상태를 확인하고 싶다면:

```bash
# 배포 사이트가 살아있는지
curl -s --ssl-no-revoke -o /dev/null -w "%{http_code}\n" https://melting-clone.vercel.app

# Supabase 가 깨어있는지 (401 이면 정상 기동 / 000 이면 정지 상태일 수 있음)
curl -s --ssl-no-revoke -o /dev/null -w "%{http_code}\n" https://hqiyegjkehlavfjwsiju.supabase.co/rest/v1/

# 빌드가 통과하는지 (타입 검사 포함)
npm run build
```

채팅이 실제로 되는지 확인 (한글 깨짐 방지를 위해 파일 경유):

```bash
python -c "import io,json; io.open('p.json','w',encoding='utf-8').write(json.dumps({'userKey':'healthcheck','characterId':'kang-dohyun','message':'안녕? 잘 지냈어?'},ensure_ascii=False))"
curl -s --ssl-no-revoke --max-time 70 -X POST https://melting-clone.vercel.app/api/chat \
  -H "Content-Type: application/json" --data-binary @p.json
```
