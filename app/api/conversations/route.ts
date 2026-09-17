import { NextResponse } from "next/server";
import { getCharacters } from "@/lib/data";
import { listConversations } from "@/lib/conversation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET: 이 사람이 진행 중인 대화 목록 ("대화" 탭용)
 * 캐릭터 페이지를 열기만 해도 빈 방이 만들어지므로, 실제로 말을 주고받은 방만 돌려준다.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userKey = searchParams.get("userKey");
  if (!userKey) {
    return NextResponse.json({ error: "userKey가 필요합니다." }, { status: 400 });
  }

  try {
    const [conversations, characters] = await Promise.all([
      listConversations(userKey),
      getCharacters(),
    ]);
    const byId = new Map(characters.map((c) => [c.id, c]));

    const items = conversations.flatMap((convo) => {
      const character = byId.get(convo.characterId);
      // 삭제된 캐릭터이거나 아직 대화가 없는 방은 목록에서 뺀다
      if (!character || !convo.lastMessage) return [];
      return [
        {
          conversationId: convo.id,
          affinity: convo.affinity,
          updatedAt: convo.updatedAt,
          lastMessage: convo.lastMessage,
          // 화면 표시에 필요한 것만 보낸다 (페르소나 등 내부 설정은 제외)
          character: {
            id: character.id,
            name: character.name,
            creator: character.creator,
            art: character.art,
          },
        },
      ];
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("[api/conversations GET]", e);
    return NextResponse.json({ error: "대화 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}
