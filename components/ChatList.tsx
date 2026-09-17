"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Character } from "@/lib/characters";
import { getUserKey } from "@/lib/userKey";
import CharacterArt from "./CharacterArt";

type Item = {
  conversationId: string;
  affinity: number;
  updatedAt: string;
  lastMessage: { role: "user" | "assistant"; content: string; createdAt: string };
  character: Pick<Character, "id" | "name" | "creator" | "art">;
};

/** "방금", "5분 전", "어제" 처럼 사람이 읽기 좋은 상대 시간 */
function timeAgo(iso: string, now: number): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day === 1) return "어제";
  if (day < 7) return `${day}일 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function ChatList() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/conversations?userKey=${encodeURIComponent(getUserKey())}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "불러오기 실패");
        setItems(data.items ?? []);
        setNow(Date.now());
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "오류가 발생했어요.");
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="mt-20 text-center text-sm text-[#8f90a0]">
        <p>{error}</p>
        <button
          onClick={() => location.reload()}
          className="mt-3 rounded-full bg-[#2a2b38] px-4 py-1.5 text-xs font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (items === null) {
    return <p className="mt-20 text-center text-xs text-[#6b6c7d]">대화 목록을 불러오는 중…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-20 flex flex-col items-center gap-3 text-center">
        <span className="text-4xl">💬</span>
        <p className="text-sm font-bold text-white">아직 나눈 대화가 없어요</p>
        <p className="text-xs text-[#8f90a0]">마음에 드는 캐릭터를 골라 첫 인사를 건네보세요</p>
        <Link
          href="/characters"
          className="mt-2 rounded-full bg-[#ff33a5] px-5 py-2 text-xs font-bold text-white transition hover:brightness-110"
        >
          캐릭터 탐색하기
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/5">
      {items.map((item) => {
        const { character: c, lastMessage } = item;
        const preview = (lastMessage.role === "user" ? "나: " : "") + lastMessage.content;
        return (
          <li key={item.conversationId}>
            <Link
              href={`/chat/${c.id}`}
              className="flex items-center gap-3 py-3 transition hover:bg-white/[0.03]"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full">
                <CharacterArt c={c} emojiSize="text-2xl" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-bold text-white">{c.name}</p>
                  <span className="shrink-0 text-[11px] text-[#6b6c7d]">
                    {timeAgo(lastMessage.createdAt, now)}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[#8f90a0]">{preview}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#ff7dc4]">
                <span>💗</span>
                {item.affinity}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
