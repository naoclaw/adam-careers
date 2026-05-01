import { NextResponse } from "next/server";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 },
      );
    }

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
      return NextResponse.json(
        { error: `OpenRouter error: ${errText}` },
        { status: 500 },
      );
    }

    const data = await response.json();
    const assistant =
      data?.choices?.[0]?.message?.content ??
      "Sorry, I could not generate a response.";

    return NextResponse.json({ assistant });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return NextResponse.json(
      { error: "Unexpected error while generating chat response" },
      { status: 500 },
    );
  }
}
