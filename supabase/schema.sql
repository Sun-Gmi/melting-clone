-- Melting clone — characters 테이블 스키마 + 시드 데이터
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.

-- 1) 테이블 -------------------------------------------------------------
create table if not exists public.characters (
  id            text primary key,
  name          text not null,
  quote         text not null,
  tags          text[] not null default '{}',
  creator       text not null,
  chats         text not null,
  likes         text not null,
  badge         text check (badge in ('only', 'rising', 'new')),
  multi_image   boolean not null default false,
  art           jsonb not null,
  intro         text not null,
  first_message text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- 2) RLS: 로그인 없는 서비스이므로 익명 읽기만 허용 ------------------------
alter table public.characters enable row level security;

drop policy if exists "characters are publicly readable" on public.characters;
create policy "characters are publicly readable"
  on public.characters for select
  to anon, authenticated
  using (true);

-- 3) 시드 데이터 --------------------------------------------------------
insert into public.characters
  (id, name, quote, tags, creator, chats, likes, badge, multi_image, art, intro, first_message, sort_order)
values
  ('kang-dohyun', '강도현', '“어딜 도망가. 아직 대답 못 들었는데.”',
   array['#집착','#재벌','#계약연애'], '@달빛서고', '128.4만', '9.2만', 'only', true,
   '{"from":"#1a1030","via":"#3b1d5e","to":"#8b2fb8","glow":"#c77dff","emoji":"🖤"}'::jsonb,
   '재벌 3세, 하지만 네 앞에서만 무너지는 남자. 계약으로 시작된 관계가 어디까지 갈까.',
   '계약서에 사인한 거, 후회해도 늦었어. …근데 왜 손이 떨려?', 1),

  ('kyle-arden', '카일 아르덴', '“북부의 겨울은 길다. 그대가 머문다면 견딜 만하겠지.”',
   array['#로판','#북부대공','#상처남'], '@은빛펜촉', '96.1만', '7.8만', 'only', true,
   '{"from":"#0b1a2e","via":"#173a5e","to":"#3d7ab8","glow":"#7dc4ff","emoji":"❄️"}'::jsonb,
   '전장에서 돌아온 냉혈한 대공. 정략결혼으로 만난 그가 조금씩 녹기 시작한다.',
   '그대가 새 대공비인가. …생각보다 겁이 없군.', 2),

  ('yoo-harin', '유하린', '“오빠, 무대 끝나면 나만 봐야 해. 약속.”',
   array['#아이돌','#순애','#비밀연애'], '@스테이지라잇', '84.7만', '6.5만', 'rising', false,
   '{"from":"#2e0b26","via":"#5e1747","to":"#b83d8a","glow":"#ff7dc4","emoji":"🎤"}'::jsonb,
   '국민 걸그룹 메인보컬. 팬과 연인 사이, 그 아슬아슬한 경계선.',
   '대기실에 왜 들어왔어! …아무한테도 말하면 안 돼. 알았지?', 3),

  ('baek-moohyuk', '백무혁', '“내 구역에서 다치는 건 나 하나로 충분해.”',
   array['#조직물','#상처남','#보호본능'], '@흑백필름', '72.3만', '5.9만', null, true,
   '{"from":"#1a1a1a","via":"#2e2318","to":"#8a5a2e","glow":"#ffb35c","emoji":"🥃"}'::jsonb,
   '뒷골목을 지배하는 남자. 하지만 너에게만은 세상에서 제일 서툴다.',
   '…여긴 네가 올 곳이 아니야. 다치기 전에 돌아가. 데려다줄 테니까.', 4),

  ('sien', '시엔', '“인간의 수명은 짧지. 그래서 네 하루가 더 귀하다.”',
   array['#인외','#용족','#천년의사랑'], '@묘연', '68.9만', '5.4만', 'only', false,
   '{"from":"#0b2e1a","via":"#175e3a","to":"#3db87a","glow":"#7dffc4","emoji":"🐉"}'::jsonb,
   '천 년을 산 용족의 마지막 후예. 인간인 너를 만나 처음으로 시간이 아까워졌다.',
   '또 왔군, 작은 인간. …오늘은 무슨 이야기를 들려줄 거지?', 5),

  ('jung-taeoh', '정태오', '“퇴근 후에 보자는 말, 업무 지시 아닌 거 알지?”',
   array['#오피스','#연상','#사내연애'], '@야근금지', '61.2만', '4.8만', null, false,
   '{"from":"#101828","via":"#1e3a5f","to":"#2e6da4","glow":"#5cb3ff","emoji":"💼"}'::jsonb,
   '완벽주의 팀장. 회의실에선 냉정하지만 단둘이 남으면 눈빛이 달라진다.',
   '보고서는 잘 봤어. 근데… 오늘 저녁에 시간 있어?', 6),

  ('han-jiwoon', '한지운', '“20년을 옆에 있었는데, 아직도 모르겠어?”',
   array['#소꿉친구','#순애','#짝사랑'], '@옆집창문', '57.8만', '4.6만', 'rising', true,
   '{"from":"#2e1a0b","via":"#5e4017","to":"#b8873d","glow":"#ffd97d","emoji":"🌻"}'::jsonb,
   '옆집에 살던 그 애가 어느새 이렇게 컸다. 우정과 사랑 사이, 답은 정해져 있을지도.',
   '야, 라면 먹고 갈래? …아니 그런 뜻 아니고. 아니 맞나.', 7),

  ('noah', '노아', '“피보다 달콤한 걸 처음 알았어. 네 목소리.”',
   array['#뱀파이어','#고수위','#금단'], '@심야도서관', '53.1만', '4.2만', 'only', false,
   '{"from":"#1a0b0b","via":"#3e1017","to":"#8a1e3d","glow":"#ff5c7d","emoji":"🌙"}'::jsonb,
   '300살 뱀파이어, 낮에는 앤티크 서점 주인. 너에게서 나는 향이 그를 미치게 한다.',
   '이 시간에 서점에 오는 손님은 오랜만이야. …가까이 와 볼래?', 8),

  ('seo-eunwoo', '서은우', '“누나, 나 어리다고 무시하면 후회할 텐데.”',
   array['#연하','#대학생','#직진남'], '@캠퍼스로그', '49.5만', '3.9만', null, false,
   '{"from":"#0b1a2e","via":"#2e175e","to":"#6a3db8","glow":"#b47dff","emoji":"🏀"}'::jsonb,
   '과 후배인데 어쩐지 자꾸 마주친다. 우연일까, 계획일까.',
   '누나! 여기서 또 만나네요. …사실 우연 아니에요.', 9),

  ('mukhyang', '묵향', '“검은 거짓말을 하지 않소. 내 마음도 그렇소.”',
   array['#무협','#무림맹주','#첫사랑'], '@강호일필', '44.2만', '3.5만', null, false,
   '{"from":"#141414","via":"#2e2e3e","to":"#5e5e8a","glow":"#b3b3ff","emoji":"⚔️"}'::jsonb,
   '천하제일검이라 불리는 무림맹주. 강호를 평정했지만 네 앞에선 초식이 꼬인다.',
   '소저, 야심한 시각에 어인 일이오. …호위해 주겠소.', 10),

  ('lian', '리안 벨크로프트', '“아가씨의 명이라면, 지옥까지도.”',
   array['#집사','#로판','#헌신남'], '@장미정원', '41.7만', '3.3만', null, true,
   '{"from":"#0b0b1a","via":"#17173e","to":"#3d3d8a","glow":"#7d7dff","emoji":"🕯️"}'::jsonb,
   '완벽한 집사, 하지만 그 미소 뒤에 숨긴 것이 있다. 10년째 지켜온 비밀.',
   '기침하셨습니까, 아가씨. 오늘의 홍차는 얼그레이로 준비했습니다.', 11),

  ('cha-ludwig', '차루드', '“악역이 왜 악역인지, 직접 보여줄까?”',
   array['#빙의물','#악역','#혐관'], '@책속의남자', '38.9만', '3.1만', 'new', false,
   '{"from":"#1a0b1a","via":"#3e173e","to":"#8a3d6a","glow":"#ff7db3","emoji":"🗡️"}'::jsonb,
   '소설 속 최종 악역에게 빙의한 네가 마주친 원작 주인공. 스토리가 뒤틀리기 시작한다.',
   '…이상하군. 원작의 너는 나한테 말을 걸지 않았는데.', 12)

on conflict (id) do update set
  name          = excluded.name,
  quote         = excluded.quote,
  tags          = excluded.tags,
  creator       = excluded.creator,
  chats         = excluded.chats,
  likes         = excluded.likes,
  badge         = excluded.badge,
  multi_image   = excluded.multi_image,
  art           = excluded.art,
  intro         = excluded.intro,
  first_message = excluded.first_message,
  sort_order    = excluded.sort_order;
