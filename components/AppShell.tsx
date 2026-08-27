import Link from "next/link";

function ConeBadge() {
  return (
    <div className="flex items-center gap-1 rounded-full bg-[#333443] px-2.5 py-1 text-xs font-semibold text-white">
      <span>🍦</span>
      <span>12</span>
      <span className="text-[#ff33a5]">+</span>
    </div>
  );
}

export function AppTopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[#16161e]/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-white">
          Melting<span className="text-[#ff33a5]">.</span>
        </Link>
        <div className="flex items-center gap-2">
          <ConeBadge />
          <button className="rounded-full bg-[#ff33a5] px-4 py-1.5 text-xs font-bold text-white transition hover:brightness-110">
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}

const navItems = [
  { href: "/characters", label: "탐색", icon: "🧭" },
  { href: "/chats", label: "대화", icon: "💬" },
  { href: "/create", label: "창작", icon: "✏️" },
  { href: "/my", label: "MY", icon: "👤" },
];

export function AppBottomNav({ active = "탐색" }: { active?: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/5 bg-[#16161e]/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-stretch justify-around">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href === "/characters" ? item.href : "/characters"}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] ${
              active === item.label ? "text-white" : "text-[#6b6c7d]"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
