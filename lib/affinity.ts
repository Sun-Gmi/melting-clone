/**
 * 호감도 규칙. 서버(프롬프트·저장)와 브라우저(게이지 표시)가 같이 쓴다.
 * 0~100 사이 정수이며, 한 턴에 최대 ±5 만 움직인다.
 */
export const AFFINITY_MIN = 0;
export const AFFINITY_MAX = 100;
export const AFFINITY_DEFAULT = 30;
export const AFFINITY_MAX_DELTA = 5;

export function clampAffinity(v: number): number {
  return Math.min(AFFINITY_MAX, Math.max(AFFINITY_MIN, Math.round(v)));
}

export type AffinityStage = { label: string; description: string };

/** 호감도 구간별 태도. 프롬프트에도 들어가고, UI 툴팁에도 쓴다. */
export function affinityStage(v: number): AffinityStage {
  if (v < 20) return { label: "차가움", description: "경계하고 거리를 둔다. 말이 짧고 방어적이다." };
  if (v < 40) return { label: "낯섦", description: "예의는 지키지만 마음을 열지 않는다. 사적인 질문은 피한다." };
  if (v < 60) return { label: "호기심", description: "상대에게 관심이 생겼다. 먼저 말을 걸거나 되묻기도 한다." };
  if (v < 80) return { label: "설렘", description: "감정이 새어 나온다. 캐릭터 특유의 방식으로 애정을 드러낸다." };
  return { label: "애착", description: "깊이 신뢰한다. 약한 모습도 보여주고 상대를 우선한다." };
}

/** 답변 끝에 붙는 호감도 태그. 예: [호감도 +2] */
const TAG_RE = /\[\s*호감도\s*([+-]?\s*\d+)\s*\]/g;

/**
 * LLM 답변에서 호감도 태그를 떼어낸다.
 * 태그가 없으면 변화량 0. 태그를 뗀 뒤 답변이 비면 원문을 그대로 돌려준다.
 */
export function parseAffinityTag(raw: string): { reply: string; delta: number } {
  let delta = 0;
  let found = false;
  const reply = raw
    .replace(TAG_RE, (_, n: string) => {
      if (!found) {
        found = true;
        delta = parseInt(n.replace(/\s+/g, ""), 10) || 0;
      }
      return "";
    })
    .trim();
  delta = Math.max(-AFFINITY_MAX_DELTA, Math.min(AFFINITY_MAX_DELTA, delta));
  return { reply: reply || raw.trim(), delta };
}
