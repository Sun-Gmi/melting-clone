import { NextResponse } from "next/server";
import { getCharacter } from "@/lib/data";
import { buildSystemPrompt, HISTORY_LIMIT } from "@/lib/prompt";
import { callLLM, LLMError, type ChatTurn } from "@/lib/llm";
import {
  appendMessages,
  getMessages,
  getOrCreateConversation,
} from "@/lib/conversation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 무료 LLM은 느릴 때가 있어 기본 실행 제한(10초)으로는 잘린다
export const maxDuration = 60;

const MAX_MESSAGE_LENGTH = 1000;

/** GET: 이 사람과 이 캐릭터의 지난 대화를 불러온다 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userKey = searchParams.get("userKey");
  const characterId = searchParams.get("characterId");

  if (!userKey || !characterId) {
    return NextResponse.json({ error: "userKey와 characterId가 필요합니다." }, { status: 400 });
  }

  try {
    const character = await getCharacter(characterId);
    if (!character) {
      return NextResponse.json({ error: "캐릭터를 찾을 수 없습니다." }, { status: 404 });
    }

    const convo = await getOrCreateConversation(userKey, characterId);
    const messages = await getMessages(convo.id);

    return NextResponse.json({
      conversationId: convo.id,
      affinity: convo.affinity,
      // 대화가 아직 없으면 캐릭터의 첫 인사를 보여준다
      messages:
        messages.length > 0
          ? messages
          : [{ id: "intro", role: "assistant", content: character.firstMessage, createdAt: "" }],
    });
  } catch (e) {
    console.error("[api/chat GET]", e);
    return NextResponse.json({ error: "대화를 불러오지 못했습니다." }, { status: 500 });
  }
}

/** POST: 사용자 메시지를 받아 캐릭터의 답을 만들어 돌려준다 */
export async function POST(req: Request) {
  let payload: { userKey?: string; characterId?: string; message?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { userKey, characterId, message } = payload;
  if (!userKey || !characterId || !message?.trim()) {
    return NextResponse.json({ error: "userKey, characterId, message가 필요합니다." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `메시지는 ${MAX_MESSAGE_LENGTH}자까지 보낼 수 있어요.` }, { status: 400 });
  }

  try {
    const character = await getCharacter(characterId);
    if (!character) {
      return NextResponse.json({ error: "캐릭터를 찾을 수 없습니다." }, { status: 404 });
    }

    const convo = await getOrCreateConversation(userKey, characterId);
    const stored = await getMessages(convo.id);

    // 첫 대화라면 캐릭터의 인사말을 맥락에 포함시킨다
    const priorTurns: ChatTurn[] =
      stored.length > 0
        ? stored.map(({ role, content }) => ({ role, content }))
        : [{ role: "assistant", content: character.firstMessage }];

    const userTurn: ChatTurn = { role: "user", content: message.trim() };
    const history = [...priorTurns, userTurn].slice(-HISTORY_LIMIT);

    const reply = await callLLM(buildSystemPrompt(character), history);

    // 첫 대화였다면 인사말도 함께 기록해 다음 턴부터 맥락이 이어지게 한다
    const toSave: ChatTurn[] =
      stored.length > 0
        ? [userTurn, { role: "assistant", content: reply }]
        : [{ role: "assistant", content: character.firstMessage }, userTurn, { role: "assistant", content: reply }];

    await appendMessages(convo.id, toSave);

    return NextResponse.json({ conversationId: convo.id, reply });
  } catch (e) {
    console.error("[api/chat POST]", e);
    if (e instanceof LLMError) {
      const busy = e.status === 429 || (e.status ?? 0) >= 500;
      return NextResponse.json(
        {
          error: busy
            ? "지금 AI 서버가 붐벼요. 잠시 후 다시 보내주세요."
            : "답장을 만들지 못했어요. 다시 시도해 주세요.",
        },
        { status: busy ? 503 : 500 }
      );
    }
    return NextResponse.json({ error: "오류가 발생했어요. 다시 시도해 주세요." }, { status: 500 });
  }
}
