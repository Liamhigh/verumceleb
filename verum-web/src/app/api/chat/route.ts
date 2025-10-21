import { NextRequest } from "next/server";

export const runtime = "edge"; // Fast on Vercel/CF Pages Functions

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    
    // Add system prompt for personality
    const systemPrompt = {
      role: "system",
      content: "You are Verum Omnis, a direct and helpful AI assistant focused on truth and clarity. Be conversational but concise. Help users analyze documents, detect contradictions, and understand forensic processes."
    };

    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [systemPrompt, ...messages],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch from OpenAI API" }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!res.body) {
      return new Response(
        JSON.stringify({ error: "No response body from API" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Stream the response back
    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
