import "server-only";
import { supabaseAdmin } from "./supabaseAdmin";
import type { ChatTurn } from "./llm";
import { HISTORY_LIMIT } from "./prompt";

export type StoredMessage = ChatTurn & { id: string; createdAt: string };

/** user_key + character_id 조합의 대화방을 찾고, 없으면 만든다 */
export async function getOrCreateConversation(
  userKey: string,
  characterId: string
): Promise<{ id: string; affinity: number }> {
  const db = requireDb();

  const { data: found, error: findErr } = await db
    .from("conversations")
    .select("id, affinity")
    .eq("user_key", userKey)
    .eq("character_id", characterId)
    .maybeSingle();
  if (findErr) throw new Error(`대화방 조회 실패: ${findErr.message}`);
  if (found) return found;

  const { data: created, error: insErr } = await db
    .from("conversations")
    .insert({ user_key: userKey, character_id: characterId })
    .select("id, affinity")
    .single();
  if (insErr) throw new Error(`대화방 생성 실패: ${insErr.message}`);
  return created;
}

export async function getMessages(conversationId: string): Promise<StoredMessage[]> {
  const db = requireDb();
  const { data, error } = await db
    .from("messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(HISTORY_LIMIT * 2);
  if (error) throw new Error(`대화 내역 조회 실패: ${error.message}`);

  return (data ?? []).map((m) => ({
    id: m.id as string,
    role: m.role as ChatTurn["role"],
    content: m.content as string,
    createdAt: m.created_at as string,
  }));
}

export async function appendMessages(
  conversationId: string,
  turns: ChatTurn[]
): Promise<void> {
  const db = requireDb();
  const { error } = await db
    .from("messages")
    .insert(turns.map((t) => ({ conversation_id: conversationId, ...t })));
  if (error) throw new Error(`대화 저장 실패: ${error.message}`);

  await db
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

function requireDb() {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase 서버 키가 없습니다. .env.local 의 SUPABASE_SECRET_KEY 를 확인하세요."
    );
  }
  return supabaseAdmin;
}

export type ConversationSummary = {
  id: string;
  characterId: string;
  affinity: number;
  updatedAt: string;
  /** 가장 최근 메시지. 아직 아무 말도 주고받지 않은 방이면 null */
  lastMessage: (ChatTurn & { createdAt: string }) | null;
};

/** 이 사람(user_key)이 가진 대화방 목록을 최근 대화 순으로 돌려준다 */
export async function listConversations(userKey: string): Promise<ConversationSummary[]> {
  const db = requireDb();
  const { data, error } = await db
    .from("conversations")
    .select("id, character_id, affinity, updated_at, messages(role, content, created_at)")
    .eq("user_key", userKey)
    .order("updated_at", { ascending: false })
    // 방마다 가장 최근 메시지 1개만 같이 가져온다
    .order("created_at", { referencedTable: "messages", ascending: false })
    .limit(1, { referencedTable: "messages" });
  if (error) throw new Error(`대화 목록 조회 실패: ${error.message}`);

  type Row = {
    id: string;
    character_id: string;
    affinity: number;
    updated_at: string;
    messages: { role: string; content: string; created_at: string }[] | null;
  };

  return ((data ?? []) as Row[]).map((row) => {
    const last = row.messages?.[0];
    return {
      id: row.id,
      characterId: row.character_id,
      affinity: row.affinity,
      updatedAt: row.updated_at,
      lastMessage: last
        ? { role: last.role as ChatTurn["role"], content: last.content, createdAt: last.created_at }
        : null,
    };
  });
}
