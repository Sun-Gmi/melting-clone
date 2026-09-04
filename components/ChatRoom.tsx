"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/characters";
import CharacterArt from "./CharacterArt";

type Msg = { id: string; role: "user" | "assistant"; content: string };

/** 로그인이 없으므로 브라우저마다 익명 ID를 하나 만들어 대화를 구분한다 */
function getUserKey(): string {
  const KEY = "melting.userKey";
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
    const fresh = crypto.randomUUID();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    return "anonymous";
  }
}

export default function ChatRoom({ character }: { character: Character }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userKey = useRef<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // 지난 대화 불러오기
  useEffect(() => {
    userKey.current = getUserKey();
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `/api/chat?userKey=${encodeURIComponent(userKey.current)}&characterId=${encodeURIComponent(character.id)}`
        );
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? "불러오기 실패");
        setMessages(data.messages ?? []);
      } catch {
        if (!cancelled) {
          // 서버가 안 되면 최소한 첫 인사라도 보여준다
          setMessages([{ id: "intro", role: "assistant", content: character.firstMessage }]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [character.id, character.firstMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setError(null);
    setSending(true);
    // 내 메시지는 먼저 화면에 띄운다 (답을 기다리는 동안 반응이 있도록)
    setMessages((prev) => [...prev, { id: `me-${Date.now()}`, role: "user", content: text }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userKey: userKey.current, characterId: character.id, message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "답장을 받지 못했어요.");
      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했어요.");
      setInput(text); // 실패한 메시지는 입력창에 되돌려준다
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }, [input, sending, character.id]);

  return (
    <div className="mx-auto flex h-dvh max-w-2xl flex-col bg-[#16161e] text-[#f2f1eb]">
      <header className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <Link href="/characters" className="text-xl text-[#8f90a0] hover:text-white">←</Link>
        <div className="h-9 w-9 overflow-hidden rounded-full">
          <CharacterArt c={character} emojiSize="text-base" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{character.name}</p>
          <p className="truncate text-[11px] text-[#8f90a0]">{character.creator}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">💗</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#333443]">
            <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-[#ff33a5] to-[#ff7dc4]" />
          </div>
          <span className="text-[11px] font-semibold text-[#ff7dc4]">35</span>
        </div>
      </header>

      <div className="mx-4 mt-4 shrink-0 rounded-xl bg-[#222430] p-3 text-xs leading-relaxed text-[#ccccd0]">
        <p className="mb-1 font-bold text-white">{character.name}</p>
        {character.intro}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {character.tags.map((t) => (
            <span key={t} className="rounded-full bg-[#333443] px-2 py-0.5 text-[10px]">{t}</span>
          ))}
        </div>
      </div>

      <main className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {loading ? (
          <p className="text-center text-xs text-[#6b6c7d]">대화를 불러오는 중…</p>
        ) : (
          messages.map((m) =>
            m.role === "assistant" ? (
              <div key={m.id} className="flex items-end gap-2">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                  <CharacterArt c={character} emojiSize="text-sm" />
                </div>
                <div className="max-w-[75%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-[#2a2b38] px-4 py-2.5 text-sm leading-relaxed">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[75%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-[#ff33a5] px-4 py-2.5 text-sm leading-relaxed text-white">
                  {m.content}
                </div>
              </div>
            )
          )
        )}

        {sending && (
          <div className="flex items-end gap-2">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
              <CharacterArt c={character} emojiSize="text-sm" />
            </div>
            <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-[#2a2b38] px-4 py-3.5">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8f90a0]"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-center text-xs text-[#ff7dc4]">{error}</p>}
        <div ref={bottomRef} />
      </main>

      <footer className="shrink-0 border-t border-white/5 p-3">
        <div className="flex items-center gap-2 rounded-full bg-[#222430] px-4 py-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send();
              }
            }}
            disabled={sending}
            maxLength={1000}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6b6c7d] outline-none disabled:opacity-50"
            placeholder={`${character.name}에게 메시지 보내기...`}
          />
          <button
            onClick={() => void send()}
            disabled={sending || !input.trim()}
            className="rounded-full bg-[#ff33a5] px-4 py-1.5 text-xs font-bold text-white transition disabled:opacity-40"
          >
            {sending ? "..." : "전송"}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-[#4e4f5e]">
          AI 캐릭터의 답변은 모두 창작된 내용이에요
        </p>
      </footer>
    </div>
  );
}
