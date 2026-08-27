import Link from "next/link";
import type { Character } from "@/lib/characters";
import CharacterArt from "./CharacterArt";

export default function CharacterCard({ c, rank }: { c: Character; rank?: number }) {
  return (
    <Link
      href={`/chat/${c.id}`}
      className="group block transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#222430]">
        <CharacterArt c={c} />

        {/* 배지 */}
        {c.badge && (
          <span
            className={`absolute top-2 right-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
              c.badge === "only"
                ? "bg-[#ff33a5] text-white"
                : c.badge === "rising"
                ? "bg-amber-400 text-black"
                : "bg-sky-400 text-black"
            }`}
          >
            {c.badge.toUpperCase()}
          </span>
        )}

        {/* 다중 이미지 아이콘 */}
        {c.multiImage && (
          <span className="absolute top-2 left-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white/90">
            🖼 3+
          </span>
        )}

        {/* 순위 */}
        {rank !== undefined && (
          <span className="absolute bottom-14 left-2 text-4xl font-black italic text-white/90 drop-shadow-lg">
            {rank}
          </span>
        )}

        {/* 이름 + 인용구 오버레이 */}
        <div className="absolute inset-x-0 bottom-0 p-2.5">
          <p className="text-sm font-bold text-white">{c.name}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/70">
            {c.quote}
          </p>
        </div>
      </div>

      {/* 카드 하단 메타 */}
      <div className="mt-1.5 flex flex-wrap gap-1 px-0.5">
        {c.tags.slice(0, 2).map((t) => (
          <span key={t} className="text-[10px] text-[#8f90a0]">
            {t}
          </span>
        ))}
        <span className="ml-auto text-[10px] text-[#8f90a0]">💬 {c.chats}</span>
      </div>
    </Link>
  );
}
