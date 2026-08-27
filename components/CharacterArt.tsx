import type { Character } from "@/lib/characters";

// 실제 일러스트 대신 사용하는 그라디언트 아트 썸네일
export default function CharacterArt({
  c,
  className = "",
  emojiSize = "text-5xl",
}: {
  c: Character;
  className?: string;
  emojiSize?: string;
}) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(160deg, ${c.art.from} 0%, ${c.art.via} 55%, ${c.art.to} 100%)`,
      }}
    >
      {/* glow */}
      <div
        className="absolute -top-8 -right-8 h-40 w-40 rounded-full opacity-40 blur-3xl"
        style={{ background: c.art.glow }}
      />
      <div
        className="absolute bottom-6 -left-10 h-32 w-32 rounded-full opacity-25 blur-3xl"
        style={{ background: c.art.glow }}
      />
      {/* 캐릭터 실루엣 느낌의 이모지 */}
      <div className={`absolute inset-0 flex items-center justify-center ${emojiSize} drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]`}>
        {c.art.emoji}
      </div>
      {/* 하단 그라데이션 (텍스트 가독성) */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
  );
}
