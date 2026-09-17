"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterProfile } from "@/lib/characters";
import { AFFINITY_DEFAULT, affinityStage } from "@/lib/affinity";
import CharacterArt from "./CharacterArt";
import MessageText from "./MessageText";
import { getUserKey } from "@/lib/userKey";

type Msg = { id: string; role: "user" | "assistant"; content: string };

export default function ChatRoom({ character }: { character: CharacterProfile }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [affinity, setAffinity] = useState(AFFINITY_DEFAULT);
  // 방금 턴의 호감도 변화량. 잠깐 보여줬다가 지운다
  const [delta, setDelta] = useState<number | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const userKey = useRef<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
        if (typeof data.affinity === "number") setAffinity(data.affinity);
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

  // 호감도 변화 표시는 2초 뒤에 사라진다
  useEffect(() => {
    if (delta === null) return;
    const t = setTimeout(() => setDelta(null), 2000);
    return () => clearTimeout(t);
  }, [delta]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
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
      if (typeof data.affinity === "number") {
        setAffinity(data.affinity);
        if (data.affinityDelta) setDelta(data.affinityDelta);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했어요.");
      setInput(text); // 실패한 메시지는 입력창에 되돌려준다
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }, [input, sending, character.id]);

  // 대화를 지우고 처음 인사로 되돌린다 (호감도도 기본값으로)
  const reset = useCallback(async () => {
    if (resetting) return;
    setResetting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/chat?userKey=${encodeURIComponent(userKey.current)}&characterId=${encodeURIComponent(character.id)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "대화를 지우지 못했어요.");
      setMessages([{ id: "intro", role: "assistant", content: character.firstMessage }]);
      setAffinity(AFFINITY_DEFAULT);
      setDelta(null);
      setConfirmReset(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했어요.");
      setConfirmReset(false);
    } finally {
      setResetting(false);
    }
  }, [resetting, character.id, character.firstMessage]);

  const stage = affinityStage(affinity);

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
        <div
          className="relative flex items-center gap-1.5"
          title={`호감도 ${affinity} · ${stage.label}`}
          aria-label={`호감도 ${affinity}, ${stage.label}`}
        >
          <span className="text-sm">💗</span>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#333443]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff33a5] to-[#ff7dc4] transition-[width] duration-700 ease-out"
              style={{ width: `${affinity}%` }}
            />
          </div>
          <span className="w-6 text-right text-[11px] font-semibold tabular-nums text-[#ff7dc4]">{affinity}</span>
          {delta !== null && (
            <span
              key={delta}
              className={`absolute -top-4 right-0 animate-bounce text-[11px] font-bold ${
                delta > 0 ? "text-[#ff7dc4]" : "text-[#8f90a0]"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>
        <button
          onClick={() => setConfirmReset(true)}
          aria-label="대화 다시 시작"
          title="대화 다시 시작"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-base text-[#8f90a0] transition hover:bg-white/5 hover:text-white"
        >
          ↺
        </button>
      </header>

      {confirmReset && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => !resetting && setConfirmReset(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-t-3xl bg-[#1c1c26] p-5 shadow-2xl sm:rounded-3xl"
          >
            <p className="text-base font-bold text-white">대화를 처음부터 다시 시작할까요?</p>
            <p className="mt-2 text-sm leading-relaxed text-[#8f90a0]">
              지금까지 나눈 대화와 호감도가 모두 사라지고, {character.name}의 첫 인사부터 다시 시작해요.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                disabled={resetting}
                className="flex-1 rounded-full bg-[#2a2b38] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={() => void reset()}
                disabled={resetting}
                className="flex-1 rounded-full bg-[#ff33a5] py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {resetting ? "지우는 중…" : "다시 시작"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <MessageText text={m.content} actionClassName="text-[#8f90a0]" />
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[75%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-[#ff33a5] px-4 py-2.5 text-sm leading-relaxed text-white">
                  <MessageText text={m.content} actionClassName="text-white/75" />
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
        <div className="flex items-end gap-2 rounded-3xl bg-[#222430] px-4 py-2.5">
          {/* Enter = 전송, Shift+Enter = 줄바꿈. 내용에 맞춰 최대 5줄까지 높이가 늘어난다 */}
          <textarea
            ref={inputRef}
            value={input}
            rows={1}
            onChange={(e) => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send();
              }
            }}
            disabled={sending}
            maxLength={1000}
            className="max-h-[120px] flex-1 resize-none bg-transparent py-0.5 text-sm leading-relaxed text-white placeholder-[#6b6c7d] outline-none disabled:opacity-50"
            placeholder={`${character.name}에게 메시지 보내기...`}
          />
          <button
            onClick={() => void send()}
            disabled={sending || !input.trim()}
            className="shrink-0 rounded-full bg-[#ff33a5] px-4 py-1.5 text-xs font-bold text-white transition disabled:opacity-40"
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
