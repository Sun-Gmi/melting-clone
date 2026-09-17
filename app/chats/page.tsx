import ChatList from "@/components/ChatList";
import { AppTopBar, AppBottomNav } from "@/components/AppShell";

export const metadata = { title: "대화 | Melting Clone" };

/**
 * "대화" 탭 — 내가 진행 중인 대화방 목록.
 * 누구의 대화인지는 브라우저에 저장된 익명 ID로 정해지므로,
 * 목록 자체는 클라이언트 컴포넌트(ChatList)가 API로 불러온다.
 */
export default function ChatsPage() {
  return (
    <div className="min-h-screen bg-[#16161e] pb-20 text-[#f2f1eb]">
      <AppTopBar />
      <main className="mx-auto max-w-4xl px-4">
        <h1 className="pt-4 pb-1 text-lg font-extrabold">대화</h1>
        <ChatList />
      </main>
      <AppBottomNav active="대화" />
    </div>
  );
}
