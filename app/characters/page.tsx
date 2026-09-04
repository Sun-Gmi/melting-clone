import { tagFilters } from "@/lib/characters";
import { getCharacters } from "@/lib/data";
import CharacterCard from "@/components/CharacterCard";
import { AppTopBar, AppBottomNav } from "@/components/AppShell";

// DB 변경분을 최대 60초 안에 사이트에 반영 (ISR)
export const revalidate = 60;


export const metadata = { title: "인기 AI 캐릭터 | Melting Clone" };

export default async function CharactersPage() {
  const characters = await getCharacters();
  const rising = characters.filter((c) => c.badge === "rising" || c.badge === "new");
  const top = characters.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#16161e] pb-20 text-[#f2f1eb]">
      <AppTopBar />

      <main className="mx-auto max-w-4xl px-4">
        {/* 상단 탭 */}
        <div className="sticky top-14 z-10 -mx-4 flex gap-5 bg-[#16161e]/95 px-4 pt-3 backdrop-blur">
          {["추천", "라이징", "태그"].map((tab, i) => (
            <button
              key={tab}
              className={`border-b-2 pb-2 text-sm font-bold transition ${
                i === 0
                  ? "border-[#ff33a5] text-white"
                  : "border-transparent text-[#6b6c7d] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 안내 배너 */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#222430] px-3 py-2.5 text-xs text-[#ccccd0]">
          <span>🛡️</span> 안전한 콘텐츠만 표시되고 있어요
          <button className="ml-auto text-[#ff33a5]">설정</button>
        </div>

        {/* 태그 필터 */}
        <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
          {tagFilters.map((t, i) => (
            <button
              key={t}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                i === 0
                  ? "bg-[#f2f1eb] text-[#16161e]"
                  : "bg-[#2a2b38] text-[#ccccd0] hover:bg-[#333443]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 실시간 인기 */}
        <section className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-extrabold">🔥 실시간 인기</h2>
            <button className="text-xs text-[#8f90a0]">전체보기</button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {top.map((c, i) => (
              <CharacterCard key={c.id} c={c} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* 라이징 */}
        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-extrabold">🚀 라이징 캐릭터</h2>
            <button className="text-xs text-[#8f90a0]">전체보기</button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {rising.map((c) => (
              <CharacterCard key={c.id} c={c} />
            ))}
          </div>
        </section>

        {/* 전체 */}
        <section className="mt-8">
          <h2 className="mb-3 text-base font-extrabold">✨ 이런 캐릭터는 어때요?</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {characters.map((c) => (
              <CharacterCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      </main>

      <AppBottomNav active="탐색" />
    </div>
  );
}
