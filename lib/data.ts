import {
  characters as fallbackCharacters,
  type Character,
  type Persona,
} from "./characters";
import { supabase } from "./supabase";

// DB row -> Character 매핑 (DB는 snake_case)
type CharacterRow = {
  id: string;
  name: string;
  quote: string;
  tags: string[];
  creator: string;
  chats: string;
  likes: string;
  badge: Character["badge"] | null;
  multi_image: boolean;
  art: Character["art"];
  intro: string;
  first_message: string;
  // 페르소나 (LLM 입력용) — 아직 채워지지 않은 행은 null 일 수 있다
  age: string | null;
  occupation: string | null;
  personality: string | null;
  speech_style: string | null;
  background: string | null;
  relationship: string | null;
  taboos: string | null;
};

const PERSONA_FIELDS = [
  "age",
  "occupation",
  "personality",
  "speech_style",
  "background",
  "relationship",
  "taboos",
] as const;

// 페르소나 컬럼이 전부 채워진 경우에만 Persona 로 취급한다
function toPersona(row: CharacterRow): Persona | undefined {
  if (PERSONA_FIELDS.some((f) => !row[f])) return undefined;
  return Object.fromEntries(
    PERSONA_FIELDS.map((f) => [f, row[f] as string])
  ) as unknown as Persona;
}

function toCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    name: row.name,
    quote: row.quote,
    tags: row.tags,
    creator: row.creator,
    chats: row.chats,
    likes: row.likes,
    badge: row.badge ?? undefined,
    multiImage: row.multi_image,
    art: row.art,
    intro: row.intro,
    firstMessage: row.first_message,
    persona: toPersona(row),
  };
}

export async function getCharacters(): Promise<Character[]> {
  if (!supabase) return fallbackCharacters;

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    if (error) console.error("[supabase] characters 조회 실패:", error.message);
    return fallbackCharacters;
  }
  return (data as CharacterRow[]).map(toCharacter);
}

export async function getCharacter(id: string): Promise<Character | undefined> {
  const all = await getCharacters();
  return all.find((c) => c.id === id);
}
