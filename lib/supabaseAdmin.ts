import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 전용 Supabase 클라이언트.
 * 비밀 키를 쓰므로 RLS를 우회한다 — 절대 클라이언트 컴포넌트에서 import 하지 말 것.
 * (conversations / messages 테이블은 익명 접근을 막아뒀기 때문에 이 클라이언트가 필요하다)
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

export const supabaseAdmin: SupabaseClient | null =
  url && secret
    ? createClient(url, secret, { auth: { persistSession: false } })
    : null;
