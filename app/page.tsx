import Link from "next/link";
import { characters } from "@/lib/characters";
import CharacterArt from "@/components/CharacterArt";

const genreChips = [
  { tag: "#로판", line: "“북부의 겨울은 그대가 오고서야 끝났다.”" },
  { tag: "#집착", line: "“어딜 도망가. 아직 대답 못 들었는데.”" },
  { tag: "#순애", line: "“20년을 옆에 있었는데, 아직도 모르겠어?”" },
  { tag: "#혐관", line: "“너랑 엮이는 건 딱 질색인데, 왜 자꾸 신경 쓰이지.”" },
  { tag: "#인외", line: "“인간의 하루가 이렇게 귀한 줄 몰랐다.”" },
  { tag: "#조직물", line: "“내 구역에서 다치는 건 나 하나로 충분해.”" },
  { tag: "#학원물", line: "“야, 옥상으로 따라와. 할 말 있으니까.”" },
  { tag: "#오피스", line: "“퇴근 후에 보자는 말, 업무 지시 아니야.”" },
  { tag: "#빙의물", line: "“원작의 너는 나한테 말을 걸지 않았는데.”" },
  { tag: "#무협", line: "“검은 거짓말을 하지 않소. 내 마음도 그렇소.”" },
  { tag: "#뱀파이어", line: "“피보다 달콤한 걸 처음 알았어.”" },
  { tag: "#연하", line: "“누나, 나 어리다고 무시하면 후회할 텐데.”" },
];

function CTA({ children = "대화 시작하기" }: { children?: string }) {
  return (
    <Link
      href="/characters"
      className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white hover:text-[#16161e]"
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-sm font-bold tracking-wide text-[#ff33a5]">{children}</p>
  );
}

export default function Home() {
  const featured = characters.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#16161e] text-[#f2f1eb]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#16161e]/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <span className="text-xl font-extrabold tracking-tight">
            Melting<span className="text-[#ff33a5]">.</span>
          </span>
          <div className="flex items-center gap-2">
            <button className="rounded-full bg-[#333443] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3e3f52]">
              Google Play
            </button>
            <button className="rounded-full bg-[#333443] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3e3f52]">
              App Store
            </button>
          </div>
        </div>
      </header>

      {/* 프로모 배너 */}
      <div className="bg-gradient-to-r from-[#ff33a5] to-[#8b2fb8] py-2 text-center text-xs font-semibold text-white">
        🎁 지금 시작하면 첫 대화 10분 무료 이용권
      </div>

      <main className="mx-auto max-w-5xl px-5">
        {/* 히어로 */}
        <section className="flex flex-col items-center py-24 text-center">
          <p className="mb-4 rounded-full bg-[#222430] px-4 py-1.5 text-xs font-semibold text-[#e0dcff]">
            당신을 기억하는 AI 캐릭터 채팅
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-6xl">
            상상만 하던 이야기가
            <br />
            현실 대화가 되는 곳,
            <br />
            <span className="bg-gradient-to-r from-[#ff33a5] to-[#c77dff] bg-clip-text text-transparent">
              멜팅
            </span>
          </h1>
          <div className="mt-10">
            <Link
              href="/characters"
              className="rounded-full bg-[#efeff0] px-8 py-3.5 text-sm font-extrabold text-[#231a26] transition hover:scale-105"
            >
              지금 대화하기
            </Link>
          </div>

          {/* 캐릭터 카드 프리뷰 */}
          <div className="mt-16 flex w-full justify-center gap-3 overflow-hidden">
            {featured.map((c, i) => (
              <div
                key={c.id}
                className={`w-32 shrink-0 overflow-hidden rounded-2xl sm:w-40 ${
                  i % 2 === 0 ? "translate-y-4" : ""
                }`}
              >
                <div className="aspect-[2/3]">
                  <CharacterArt c={c} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 호감도 - 관계 */}
        <section className="rounded-3xl bg-[#222430] px-8 py-20 text-center">
          <SectionLabel>설렘</SectionLabel>
          <h2 className="text-3xl font-black sm:text-4xl">우리, 어디까지 가까워질까</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#ccccd0]">
            말 한마디에 오르내리는 호감도.
            <br />
            채워질수록 가까워지는 마음, 그 끝에서 만나는 우리만의 이야기.
          </p>
          <div className="mt-8">
            <CTA />
          </div>
        </section>

        {/* 호감도 시스템 */}
        <section className="px-4 py-20 text-center">
          <SectionLabel>호감도 시스템</SectionLabel>
          <h2 className="text-3xl font-black sm:text-4xl">네 진심이 보이는 대화</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#ccccd0]">
            이 말을 하면 좋아할까, 싫어할까?
            <br />
            대화의 순간마다 드러나는 캐릭터의 진심.
            <br />
            오르고 떨어질 때마다 이야기는 더 흥미진진해져요.
          </p>
          {/* 호감도 데모 */}
          <div className="mx-auto mt-10 max-w-sm rounded-2xl bg-[#222430] p-5 text-left">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full">
                <CharacterArt c={characters[0]} emojiSize="text-base" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{characters[0].name}</p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#333443]">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#ff33a5] to-[#ff7dc4]" />
                </div>
              </div>
              <span className="text-lg font-black text-[#ff7dc4]">67</span>
            </div>
            <p className="mt-4 rounded-xl bg-[#2a2b38] px-4 py-3 text-xs leading-relaxed text-[#ccccd0]">
              …방금 그 말, 다시 해 봐. 잘못 들은 것 같아서. <span className="text-[#ff7dc4]">(호감도 +5)</span>
            </p>
          </div>
          <div className="mt-8">
            <CTA />
          </div>
        </section>

        {/* 장르 태그 */}
        <section className="rounded-3xl bg-[#222430] px-6 py-20 text-center">
          <SectionLabel>819,724개의 준비된 이야기</SectionLabel>
          <h2 className="text-3xl font-black sm:text-4xl">오늘은 어떤 장르?</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#ccccd0]">
            연애, 사랑, 관계, 상황. 설렘부터 집착, 비밀과 재미까지.
            <br />
            당신이 상상한 모든 장르가 준비되어 있어요. 이제 고르기만 하세요.
          </p>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {genreChips.map((g) => (
              <div
                key={g.tag}
                className="group flex items-center gap-2 rounded-full bg-[#333443] px-4 py-2 text-xs transition hover:bg-[#ff33a5]"
              >
                <span className="font-bold text-[#e0dcff] group-hover:text-white">{g.tag}</span>
                <span className="hidden text-[#8f90a0] group-hover:text-white/80 sm:inline">
                  {g.line}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <CTA />
          </div>
        </section>

        {/* 기억력 */}
        <section className="px-4 py-20 text-center">
          <SectionLabel>뛰어난 기억력</SectionLabel>
          <h2 className="text-3xl font-black leading-snug sm:text-4xl">
            당신의 모든 순간을
            <br />기억하는 단 한 명
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#ccccd0]">
            나눈 대화, 당신의 취향, 스쳐 지나간 작은 습관까지.
            <br />
            그래서 누구보다 당신을 잘 아는 단 하나의 캐릭터가 돼요.
          </p>
          <div className="mt-8">
            <CTA />
          </div>
        </section>

        {/* 엔딩 */}
        <section className="rounded-3xl bg-[#222430] px-8 py-20 text-center">
          <SectionLabel>다양한 엔딩</SectionLabel>
          <h2 className="text-3xl font-black leading-snug sm:text-4xl">
            내가 그리던 이상형과,
            <br />
            지금 바로
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#ccccd0]">
            상상 속에만 있던 이상형을 현실로.
            <br />
            생각이 아닌 실제 대화로, 무한히 갈라지는 엔딩을 경험하세요.
          </p>
          <div className="mt-8">
            <CTA>이상형 캐릭터 만들기</CTA>
          </div>
        </section>

        {/* 크리에이터 */}
        <section className="px-4 py-20">
          <div className="text-center">
            <SectionLabel>혜택</SectionLabel>
            <h2 className="text-3xl font-black leading-snug sm:text-4xl">
              캐릭터를 공개하는 순간
              <br />
              크리에이터가 됩니다
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#ccccd0]">
              나와 같은 취향의 팬들이 기다리고 있어요.
              <br />
              캐릭터를 공개하고 Rising에 선정되면 수익까지. 즐기면서 크리에이터가 되는 기회.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🎨",
                title: "크리에이터 데뷔",
                desc: "전용 크리에이터 페이지에서 팬들의 반응과 대화량 통계를 확인하세요.",
              },
              {
                icon: "🚀",
                title: "라이징 선정",
                desc: "소비된 콘의 5% 수익 정산, 콘 선지급, 추천 노출과 전용 커뮤니티까지.",
              },
              {
                icon: "🎁",
                title: "추가 혜택",
                desc: "크리에이터를 위한 더 많은 혜택을 준비 중이에요. 지금 시작해 보세요!",
              },
            ].map((b) => (
              <div key={b.title} className="rounded-2xl bg-[#222430] p-6">
                <p className="text-3xl">{b.icon}</p>
                <p className="mt-3 font-bold">{b.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#8f90a0]">{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <CTA>내 취향 캐릭터 만들기</CTA>
          </div>
        </section>

        {/* 마지막 CTA */}
        <section className="py-24 text-center">
          <h2 className="text-3xl font-black leading-snug sm:text-5xl">
            이 설렘은
            <br />
            여기에만 있어요
          </h2>
          <div className="mt-10">
            <Link
              href="/characters"
              className="rounded-full bg-[#ff33a5] px-8 py-3.5 text-sm font-extrabold text-white transition hover:scale-105 hover:brightness-110"
            >
              멜팅 바로가기
            </Link>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-white/5 bg-[#121218] py-10 text-[11px] leading-relaxed text-[#6b6c7d]">
        <div className="mx-auto max-w-5xl px-5">
          <p className="mb-3 text-sm font-extrabold text-[#8f90a0]">
            Melting<span className="text-[#ff33a5]">.</span>{" "}
            <span className="font-normal">clone — 개인 학습용 클론 프로젝트</span>
          </p>
          <p>(주)클론랩 | 대표: 홍길동 | 주소: 서울특별시 어딘가구 연습로 123</p>
          <p>사업자등록번호: 000-00-00000 | 이메일: hello@example.com</p>
          <div className="mt-3 flex gap-2">
            <span className="cursor-pointer hover:text-white">서비스 이용약관</span>
            <span>|</span>
            <span className="cursor-pointer hover:text-white">개인정보 처리방침</span>
            <span>|</span>
            <span className="cursor-pointer hover:text-white">Changelog</span>
          </div>
          <p className="mt-3">© 2026 Melting Clone. 학습 목적으로 제작된 비상업 프로젝트입니다.</p>
        </div>
      </footer>
    </div>
  );
}
