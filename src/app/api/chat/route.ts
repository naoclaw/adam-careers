import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

const MAX_MESSAGES = 40;
const MAX_CONTENT_CHARS = 8_000;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let messages: Message[];
  try {
    ({ messages } = (await req.json()) as { messages: Message[] });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "No messages provided" },
      { status: 400 },
    );
  }

  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: `Too many messages (max ${MAX_MESSAGES})` },
      { status: 400 },
    );
  }

  for (const m of messages) {
    if (
      !m ||
      typeof m.content !== "string" ||
      !["user", "assistant", "system"].includes(m.role)
    ) {
      return NextResponse.json(
        { error: "Malformed message" },
        { status: 400 },
      );
    }
    if (m.content.length > MAX_CONTENT_CHARS) {
      return NextResponse.json(
        { error: `Message too long (max ${MAX_CONTENT_CHARS} chars)` },
        { status: 400 },
      );
    }
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "Chat is not configured" },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          "X-Title": "Adam Careers",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL ?? "x-ai/grok-3-mini",
          messages: [
            {
              role: "system",
              content:
                "You are Adam Careers, an English AI job helper. Help users improve CVs, write motivation letters, prepare interviews, and apply strategically.",
            },
            ...messages,
          ],
          temperature: 0.6,
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error", response.status, errText);
      return NextResponse.json(
        { error: "Upstream chat provider failed" },
        { status: 502 },
      );
    }

    const data = await response.json();
    const assistant =
      data?.choices?.[0]?.message?.content ??
      "Sorry, I could not generate a response.";

    return NextResponse.json({ assistant });
  } catch (error) {
    console.error("Chat route error", error);
    return NextResponse.json(
      { error: "Unexpected error while generating chat response" },
      { status: 500 },
    );
  }
}
