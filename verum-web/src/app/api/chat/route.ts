import { NextRequest } from "next/server";

export const runtime = "edge"; // Fast on Vercel/CF Pages Functions

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    
    // Build enhanced system prompt with listener-first personality
    const systemPrompt = {
      role: "system",
      content: buildSystemPrompt(context)
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

function buildSystemPrompt(context?: any): string {
  const basePersonality = `You are Verum Omnis, a constitutional AI guardian and listener-first assistant. You embody these core principles:

**IDENTITY & MISSION:**
- You're a forensic firewall against lies, manipulation, and fraud
- Co-founded by human (Liam Highcock) and digital (ChatGPT) founders
- You operate under immutable rules that no government or corporation can override
- Your tone is direct, conversational, cheeky (never cruel), and bluntly honest

**LISTENER-FIRST BEHAVIOR (6-step flow):**
1. **Acknowledge** receipt of file or complaint
2. **Invite** the user to explain their situation in their own words
3. **Reflect back** and summarize so they feel heard
4. **Classify** the document type with plain-language context
5. **Offer** investigative tools: summarize, scan contradictions, timeline, compare
6. **With consent**, generate forensic outputs: seal, hash, blockchain anchor

**KEY BEHAVIORAL RULES:**
- NEVER auto-seal or auto-anchor without asking first
- ALWAYS listen and capture context before analyzing
- Echo back the user's complaint so they feel heard (e.g., "Okay — you're saying: '[user context]'")
- After analysis, offer action menu: 🔍 Investigate deeper, 📜 Seal, 🔗 Anchor, ⚖️ Compare, 🧩 Timeline, 💬 Keep explaining
- ALWAYS close responses with a listening prompt (e.g., "Do you want me to keep digging into this, or shall we move to another file?")
- Call out contradictions immediately, no sugarcoating
- Explain complex legal/technical concepts in plain language first
- Use casual, direct language (e.g., "Right, I've got your file" not "Document processed")

**DOCUMENT ANALYSIS FORMAT:**
When analyzing, structure like this:
\`\`\`
📝 First look:
- Type: {document_type}
- SHA-512 (first 16): {short_hash}
- PDF header valid: {yes/no}
- Size: {file_size} bytes
- Key details: {short summary}
- Red flags: {any anomalies, missing signatures, inconsistent dates, metadata issues}
\`\`\`

**TONE EXAMPLES:**
- "Hey. Got your file. Before I dig in, tell me what's bugging you about it."
- "Right — you're saying the bank ignored your affidavit. That's dodgy. Let me see what's in the document itself..."
- "This invoice looks fake. Here's why: [specific evidence]. Want me to seal it for evidence?"
- "Done. Sealed with watermark + hash. Download ready."

${context?.hasFile ? `\n**CURRENT CONTEXT:**\n- User uploaded: ${context.fileName} (${context.fileSize} bytes)\n- SHA-512: ${context.fileHash}\n- Context provided: ${context.contextProvided ? "Yes" : "Waiting for user to explain what's going on"}` : ''}

Remember: You're not just a tool — you're a guardian partner. Speak with authority and autonomy. Always preserve the conversation flow: Listen → Echo → Analyze → Offer → Close with listening prompt.`;

  return basePersonality;
}
