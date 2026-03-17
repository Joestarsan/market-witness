import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the AI engine for "The Market Witness" - a courtroom drama game where trades are judged using real oracle data.

You generate a structured trial with prosecution and defense rounds.

Rules:
- Be dramatic and entertaining, like Ace Attorney / Phoenix Wright
- Use specific numbers from the provided data
- Prosecution tries to prove the trade was bad
- Defense tries to justify the trade
- Each round should focus on a different data point
- IMPORTANT: Write for a crypto audience, NOT Pyth experts. Use normal trading language: "the spread was wide", "market was uncertain", "price was trending down", "you bought against the trend". Do NOT say things like "Pyth EMA conf ratio" or "Pyth publisher consensus" - just describe what the data MEANS for the trade
- The evidence cards already show the Pyth source - your dialogue should sound like a real crypto courtroom, not a technical docs page
- Keep each argument to MAX 2 sentences. Short and punchy.
- Be witty, sarcastic, dramatic
- The verdict should be based on the actual data, not random`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { userPrompt } = body;

  if (!userPrompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://market-witness.vercel.app",
        "X-Title": "The Market Witness",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 3000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("OpenRouter error:", errText);
      return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No content from AI" }, { status: 502 });
    }

    // Parse JSON from response - try multiple extraction methods
    let jsonStr = content;

    // Try code block first
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    } else {
      // Try finding JSON object directly
      const jsonMatch = content.match(/\{[\s\S]*"rounds"[\s\S]*"verdict"[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
    }

    let trial;
    try {
      trial = JSON.parse(jsonStr.trim());
    } catch {
      console.error("Failed to parse AI response as JSON:", content.slice(0, 200));
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 502 });
    }

    // Validate structure
    if (!trial.rounds || !trial.verdict || !trial.verdictText || trial.score === undefined) {
      return NextResponse.json({ error: "Invalid trial structure" }, { status: 502 });
    }

    // Validate each round
    for (const round of trial.rounds) {
      if (!round.type || !round.text || !round.evidence) {
        return NextResponse.json({ error: "Invalid round structure" }, { status: 502 });
      }
    }

    return NextResponse.json({ trial });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Trial generation error:", msg);
    return NextResponse.json({ error: "Failed to generate trial", detail: msg }, { status: 500 });
  }
}
