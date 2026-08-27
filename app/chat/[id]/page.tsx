import Link from "next/link";
import { notFound } from "next/navigation";
import { characters } from "@/lib/characters";
import CharacterArt from "@/components/CharacterArt";

export function generateStaticParams() {
  return characters.map((c) => ({ id: c.id }));
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = characters.find((ch) => ch.id === id);
  if (!c) notFound();

  const messages = [
    { from: "ai", text: c.firstMessage },
    { from: "me", text: "안녕! 오늘 처음 왔는데, 잘 부탁해." },
    {
      from: "ai",
      text: "…처음이라. 그럼 규칙부터 알려줄게. 여기서 나눈 이야기는 전부 기억해 둘 거야. 각오는 됐어?",
    },
  ];

  return (
    <div className="mx-auto flex h-dvh max-w-2xl flex-col bg-[#16161e] text-[#f2f1eb]">
      {/* 채팅 헤더 */}
      <header className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <Link href="/characters" className="text-xl text-[#8f90a0]">
          ←
        </Link>
        <div className="h-9 w-9 overflow-hidden rounded-full">
          <CharacterArt c={c} emojiSize="text-base" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{c.name}</p>
          <p className="truncate text-[11px] text-[#8f90a0]">{c.creator}</p>
        </div>
        {/* 호감도 게이지 */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm">💗</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#333443]">
            <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-[#ff33a5] to-[#ff7dc4]" />
          </div>
          <span className="text-[11px] font-semibold text-[#ff7dc4]">35</span>
        </div>
      </header>

      {/* 캐릭터 소개 카드 */}
      <div className="mx-4 mt-4 rounded-xl bg-[#222430] p-3 text-xs leading-relaxed text-[#ccccd0]">
        <p className="mb-1 font-bold text-white">{c.name}</p>
        {c.intro}
        <div className="mt-2 flex gap-1.5">
          {c.tags.map((t) => (
            <span key={t} className="rounded-full bg-[#333443] px-2 py-0.5 text-[10px]">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 메시지 */}
      <main className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.map((m, i) =>
          m.from === "ai" ? (
            <div key={i} className="flex items-end gap-2">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                <CharacterArt c={c} emojiSize="text-sm" />
              </div>
              <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-[#2a2b38] px-4 py-2.5 text-sm leading-relaxed">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-[#ff33a5] px-4 py-2.5 text-sm leading-relaxed text-white">
                {m.text}
              </div>
            </div>
          )
        )}
        <p className="pt-2 text-center text-[11px] text-[#6b6c7d]">
          호감도가 5 상승했어요 💗
        </p>
      </main>

      {/* 입력창 */}
      <footer className="border-t border-white/5 p-3">
        <div className="flex items-center gap-2 rounded-full bg-[#222430] px-4 py-2.5">
          <input
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6b6c7d] outline-none"
            placeholder={`${c.name}에게 메시지 보내기...`}
          />
          <button className="rounded-full bg-[#ff33a5] px-4 py-1.5 text-xs font-bold text-white">
            전송
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-[#4e4f5e]">
          AI 캐릭터의 답변은 모두 창작된 내용이에요
        </p>
      </footer>
    </div>
  );
}
