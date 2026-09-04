-- 003: 대화 저장 구조
-- 로그인이 없으므로 브라우저마다 발급한 익명 ID(user_key)로 대화를 구분한다.
-- 읽기/쓰기는 전부 서버(Next.js API route)에서 service_role 키로 수행하므로
-- 익명 사용자에게는 어떤 권한도 주지 않는다.

create table if not exists public.conversations (
  id           uuid primary key default gen_random_uuid(),
  user_key     text not null,                       -- 브라우저에 저장된 익명 ID
  character_id text not null references public.characters(id) on delete cascade,
  affinity     int  not null default 30,            -- 호감도 (0~100)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 한 사람이 한 캐릭터와 갖는 대화방은 하나
create unique index if not exists conversations_user_character_idx
  on public.conversations (user_key, character_id);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

-- RLS 켜고 정책은 만들지 않는다 => 익명 키로는 접근 불가.
-- 서버의 service_role 키만 RLS를 우회해서 읽고 쓸 수 있다.
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
