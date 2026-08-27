import { characters as fallbackCharacters, type Character } from "./characters";
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
};

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
