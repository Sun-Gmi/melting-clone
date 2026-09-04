/**
 * LLM 호출부. 제공자를 바꾸고 싶으면 이 파일만 고치면 된다.
 *
 * 지금은 Google Gemini(무료 티어)를 쓴다. 무료 티어는 모델이 붐비면 503을 자주
 * 내기 때문에, 재시도 + 여러 모델 순차 시도로 성공률을 끌어올린다.
 * Claude 로 바꾸려면 requestOnce 안의 fetch 부분만 교체하면 된다.
 */

export type ChatTurn = { role: "user" | "assistant"; content: string };

/** 앞에서부터 시도한다. 벤치마크 기준 응답 속도/성공률 순. */
const MODELS = (process.env.LLM_MODELS ?? "gemini-3.5-flash,gemini-3.1-flash-lite,gemini-3.7-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

const RETRY_STATUS = new Set([429, 500, 502, 503, 504]);
/** 모델 하나당 시도 횟수 */
const ATTEMPTS_PER_MODEL = 2;
/** 한 번의 호출 제한 시간 (응답이 영영 안 올 수 있으므로 필수) */
const ATTEMPT_TIMEOUT_MS = 15_000;
/** 전체 예산 — Vercel 함수 실행 제한(60초) 안에 반드시 끝나야 한다 */
const TOTAL_BUDGET_MS = 45_000;

export class LLMError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "LLMError";
  }
}

export async function callLLM(
  systemPrompt: string,
  history: ChatTurn[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new LLMError("GEMINI_API_KEY가 설정되지 않았습니다.");

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    // Gemini는 assistant 를 "model" 이라고 부른다
    contents: history.map((t) => ({
      role: t.role === "assistant" ? "model" : "user",
      parts: [{ text: t.content }],
    })),
    generationConfig: {
      temperature: 1.0, // 창작이므로 다양성을 높게
      maxOutputTokens: 8000,
    },
  });

  const deadline = Date.now() + TOTAL_BUDGET_MS;
  let lastStatus: number | undefined;
  let lastMessage = "LLM 요청에 실패했습니다.";

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= ATTEMPTS_PER_MODEL; attempt++) {
      if (Date.now() >= deadline) {
        throw new LLMError("응답이 너무 오래 걸립니다.", lastStatus ?? 504);
      }

      const result = await requestOnce(model, apiKey, body);

      if (result.ok) return result.text;

      lastStatus = result.status;
      lastMessage = result.message;

      // 재시도해도 소용없는 오류(잘못된 키, 잘못된 요청 등)면 즉시 중단
      if (result.status && !RETRY_STATUS.has(result.status)) {
        throw new LLMError(lastMessage, result.status);
      }
      // 같은 모델로 한 번 더 시도할 때만 잠깐 쉰다
      if (attempt < ATTEMPTS_PER_MODEL) await sleep(1000);
    }
    // 이 모델은 포기하고 다음 모델로 넘어간다
  }

  throw new LLMError(lastMessage, lastStatus ?? 503);
}

type Result =
  | { ok: true; text: string }
  | { ok: false; status?: number; message: string };

async function requestOnce(model: string, apiKey: string, body: string): Promise<Result> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);

  try {
    const res = await fetch(`${ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        ok: false,
        status: res.status,
        message: `LLM 요청 실패 (${model}, ${res.status}) ${detail.slice(0, 160)}`,
      };
    }

    const data = await res.json();
    const text = extractText(data);
    if (text) return { ok: true, text };

    // 안전 필터 등으로 본문이 비어 돌아온 경우 — 다른 모델로 넘어가도 같을 확률이 높다
    const reason = data?.candidates?.[0]?.finishReason ?? "unknown";
    return { ok: false, status: 422, message: `응답이 비어 있습니다 (${reason})` };
  } catch {
    // 타임아웃(abort)과 네트워크 오류를 함께 처리한다
    return { ok: false, status: 504, message: `${model} 응답 없음 (시간 초과)` };
  } finally {
    clearTimeout(timer);
  }
}

function extractText(data: unknown): string {
  const parts =
    (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
      ?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? "").join("").trim();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
