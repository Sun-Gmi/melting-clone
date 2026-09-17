"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { CharacterProfile } from "@/lib/characters";
import CharacterArt from "./CharacterArt";
import MessageText from "./MessageText";

/** 이름 뒤에 붙는 조사 "와/과" — 받침이 있으면 "과", 없으면 "와" */
function withJosa(name: string): string {
  const last = name.charCodeAt(name.length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  const hasBatchim = isHangul && (last - 0xac00) % 28 !== 0;
  return `${name}${hasBatchim ? "과" : "와"}`;
}

/**
 * 캐릭터 소개 팝업. 탐색 화면에서 카드를 누르면 대화방으로 바로 가는 대신 이 창이 먼저 뜬다.
 * 모바일에서는 아래에서 올라오는 시트, 넓은 화면에서는 가운데 카드로 보인다.
 */
export default function CharacterProfileModal({
  c,
  onClose,
}: {
  c: CharacterProfile;
  onClose: () => void;
}) {
  // ESC 로 닫기 + 뒤 화면 스크롤 잠금
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const p = c.profile;
  const sections: { title: string; body?: string }[] = [
    { title: "성격", body: p?.personality },
    { title: "세계관", body: p?.background },
    { title: "당신과의 관계", body: p?.relationship },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-[#1c1c26] text-[#f2f1eb] shadow-2xl sm:max-h-[85vh] sm:rounded-3xl"
      >
        {/* 스크롤되는 본문 */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* 아트 헤더 */}
          <div className="relative aspect-[4/3] w-full">
            <CharacterArt c={c} emojiSize="text-7xl" />
            <button
              onClick={onClose}
              aria-label="닫기"
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-lg text-white/90 hover:bg-black/70"
            >
              ×
            </button>
            {c.badge && (
              <span
                className={`absolute top-3 left-3 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
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
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h2 id="character-modal-title" className="text-2xl font-extrabold text-white">
                {c.name}
              </h2>
              <p className="mt-0.5 text-xs text-white/70">
                {c.creator}
                {p?.age && ` · ${p.age}`}
              </p>
            </div>
          </div>

          <div className="space-y-5 px-5 py-4">
            {/* 통계 + 태그 */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8f90a0]">
              <span>💬 {c.chats}</span>
              <span>❤️ {c.likes}</span>
              {p?.occupation && <span className="text-[#ccccd0]">{p.occupation}</span>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <span key={t} className="rounded-full bg-[#2a2b38] px-2.5 py-1 text-[11px] text-[#ccccd0]">
                  {t}
                </span>
              ))}
            </div>

            {/* 한 줄 대사 + 소개 */}
            <div>
              <p className="text-sm font-semibold leading-relaxed text-[#ff7dc4]">{c.quote}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#ccccd0]">{c.intro}</p>
            </div>

            {/* 성격 / 세계관 / 관계 */}
            {sections
              .filter((s) => s.body)
              .map((s) => (
                <section key={s.title}>
                  <h3 className="mb-1 text-xs font-bold text-[#8f90a0]">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-[#e6e5df]">{s.body}</p>
                </section>
              ))}

            {/* 첫 마디 미리보기 */}
            <section>
              <h3 className="mb-2 text-xs font-bold text-[#8f90a0]">첫 마디</h3>
              <div className="flex items-end gap-2">
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full">
                  <CharacterArt c={c} emojiSize="text-xs" />
                </div>
                <div className="whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-[#2a2b38] px-3.5 py-2 text-sm leading-relaxed">
                  <MessageText text={c.firstMessage} actionClassName="text-[#8f90a0]" />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* 하단 고정 버튼 */}
        <div className="shrink-0 border-t border-white/5 bg-[#1c1c26] p-4">
          <Link
            href={`/chat/${c.id}`}
            className="block w-full rounded-full bg-[#ff33a5] py-3 text-center text-sm font-bold text-white transition hover:brightness-110"
          >
            💬 {withJosa(c.name)} 대화하기
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
