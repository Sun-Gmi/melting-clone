import { notFound } from "next/navigation";
import { toProfile } from "@/lib/characters";
import { getCharacter, getCharacters } from "@/lib/data";
import ChatRoom from "@/components/ChatRoom";

// DB 변경분을 최대 60초 안에 사이트에 반영 (ISR)
export const revalidate = 60;

export async function generateStaticParams() {
  const characters = await getCharacters();
  return characters.map((c) => ({ id: c.id }));
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const character = await getCharacter(id);
  if (!character) notFound();

  // 캐릭터 정보는 서버에서 넘기고, 실제 대화는 클라이언트 컴포넌트가 담당한다.
  // 연기 대본(말투·금기)은 서버 API 에서만 쓰므로 브라우저에는 보내지 않는다.
  return <ChatRoom character={toProfile(character)} />;
}
