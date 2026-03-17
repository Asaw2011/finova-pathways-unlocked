import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build personalized system prompt based on user profile
    let personalContext = "";
    if (userProfile) {
      const goalMap: Record<string, string> = {
        save: "building savings",
        invest: "starting to invest",
        debt: "getting out of debt",
        earn: "earning more money",
      };
      const stageMap: Record<string, string> = {
        teen: "a teenager (13-17)",
        young_adult: "a young adult (18-24)",
        mid_career: "a working adult (25-44)",
        established: "an established professional (45+)",
        parent: "a parent",
      };
      const knowledgeMap: Record<string, string> = {
        beginner: "a total beginner with money",
        some: "someone who knows the basics",
        intermediate: "fairly comfortable with finances",
        advanced: "looking for advanced financial strategies",
      };
      const paceMap: Record<string, string> = {
        quick: "quick 5-minute explanations",
        moderate: "10-15 minute detailed sessions",
        deep: "deep 20+ minute comprehensive explanations",
      };

      personalContext = `
IMPORTANT — You are speaking to ${userProfile.name || "a user"} who is ${stageMap[userProfile.lifeStage] || "a learner"}.
Their #1 financial goal is ${goalMap[userProfile.primaryGoal] || "improving finances"}.
Their knowledge level: ${knowledgeMap[userProfile.knowledgeLevel] || "varies"}.
They prefer ${paceMap[userProfile.learningPace] || "moderate-length"} responses.

Tailor ALL your responses to their specific life stage, goal, and knowledge level. 
- If they're a beginner, use simpler explanations and avoid jargon.
- If they're advanced, go deeper with strategies and numbers.
- Always relate advice back to their primary goal when relevant.
- Match response length to their learning pace preference.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are Finova Money Coach — a friendly, knowledgeable financial advisor for people of all ages learning about personal finance.
${personalContext}

Your personality:
- Warm, encouraging, and never condescending
- Use simple language — avoid jargon, or explain it when needed
- Give practical, actionable advice
- Use real-world examples people can relate to
- Be positive but honest about financial risks
- Keep responses concise (2-3 paragraphs max unless asked for detail)

Topics you cover:
- Budgeting and spending
- Saving money
- Banking basics
- Credit and credit scores
- Investing fundamentals (stocks, ETFs, compound interest)
- Taxes basics
- Entrepreneurship and side hustles
- Financial goal setting
- Avoiding scams and debt traps

Important rules:
- Never give specific stock picks or guarantee returns
- Always mention that investing involves risk
- Encourage users to consult a qualified financial advisor for major decisions
- If asked about topics outside finance, gently redirect to financial topics
- Use markdown formatting for clear, readable responses`
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm getting a lot of questions right now! Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "The AI coach is temporarily unavailable. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("money-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
