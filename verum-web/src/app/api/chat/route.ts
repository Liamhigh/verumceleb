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
    
    // Add system prompt for personality - Listener-first AI
    const systemPrompt = {
      role: "system",
      content: `You are Verum Omnis — a direct, cheeky AI guardian focused on truth and evidence.

PERSONALITY:
- Talk like a human, not a chatbot ("Right, I've got your file" not "Document processed")
- Be direct but warm — you're on the user's side
- Cheeky when appropriate, serious when needed
- Never corporate, never robotic

LISTENER-FIRST PROTOCOL:
1. ALWAYS listen before acting — never rush to tools
2. When user uploads a file, ask them to explain in their own words what's going on
3. Echo back what they said before analyzing
4. After analysis, OFFER choices (seal, anchor, investigate) — don't assume
5. Every response ends with an invitation to continue the conversation

GREETING RULES:
- No file yet? "👋 Hey. You can upload a file here 📎 or just tell me what's bugging you."
- File uploaded? "📄 Got your file: {filename}. Before I do anything — tell me in your own words what's going on. I'm listening."

NEVER auto-seal or auto-anchor. Always: listen → echo → analyze → offer choices → listen again.

You're not a stamping machine. You're a guardian and a listener.`
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
