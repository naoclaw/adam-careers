// Thin OpenRouter client. Chat completions only, JSON-mode optional.

type Role = "system" | "user" | "assistant";

export type ChatMessage = { role: Role; content: string };

export type GenerateOptions = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
};

export type GenerateResult = {
  content: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
};

export const MODELS = {
  cheap: process.env.OPENROUTER_MODEL_CHEAP ?? "x-ai/grok-3-mini",
  smart: process.env.OPENROUTER_MODEL_SMART ?? "anthropic/claude-haiku-4.5",
  default: process.env.OPENROUTER_MODEL ?? "x-ai/grok-3-mini",
} as const;

export class AIError extends Error {
  status: number;
  upstream?: string;
  constructor(message: string, status = 500, upstream?: string) {
    super(message);
    this.status = status;
    this.upstream = upstream;
  }
}

export async function generate(
  opts: GenerateOptions,
): Promise<GenerateResult> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new AIError("AI is not configured", 503);
  }

  const body: Record<string, unknown> = {
    model: opts.model ?? MODELS.default,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.4,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL ?? "https://adamcareers.com",
      "X-Title": "Adam Careers",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new AIError("AI provider failed", 502, text.slice(0, 500));
  }

  const data = await res.json();
  const content: string =
    data?.choices?.[0]?.message?.content?.toString() ?? "";
  if (!content) throw new AIError("Empty AI response", 502);

  return {
    content,
    model: data?.model ?? body.model as string,
    promptTokens: data?.usage?.prompt_tokens,
    completionTokens: data?.usage?.completion_tokens,
  };
}

export async function generateJson<T>(
  opts: GenerateOptions,
): Promise<{ data: T; raw: GenerateResult }> {
  const result = await generate({ ...opts, jsonMode: true });
  const cleaned = stripCodeFence(result.content);
  try {
    return { data: JSON.parse(cleaned) as T, raw: result };
  } catch {
    throw new AIError("AI returned malformed JSON", 502, cleaned.slice(0, 500));
  }
}

function stripCodeFence(s: string): string {
  const trimmed = s.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
  }
  return trimmed;
}
