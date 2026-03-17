import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lessonTitle, moduleTitle, courseTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        tools: [{
          type: "function",
          function: {
            name: "generate_lesson",
            description: "Generate a complete financial literacy lesson with 4 parts: intro, worked example, practice questions, and quiz.",
            parameters: {
              type: "object",
              properties: {
                intro: {
                  type: "string",
                  description: "A 2-3 paragraph concept introduction explaining the topic clearly with real-world relevance. Written for a general audience learning about personal finance."
                },
                example: {
                  type: "object",
                  properties: {
                    scenario: { type: "string", description: "A real-world scenario illustrating the concept" },
                    question: { type: "string", description: "A question about the scenario" },
                    options: { type: "array", items: { type: "string" }, description: "4 answer choices" },
                    correct: { type: "integer", description: "Index of correct answer (0-3)" },
                    explanation: { type: "string", description: "Why the correct answer is right" }
                  },
                  required: ["scenario", "question", "options", "correct", "explanation"]
                },
                practice: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      correct: { type: "integer" },
                      explanation: { type: "string" }
                    },
                    required: ["question", "options", "correct", "explanation"]
                  },
                  description: "3 practice questions with explanations"
                },
                quiz: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      correct: { type: "integer" },
                      explanation: { type: "string" }
                    },
                    required: ["question", "options", "correct", "explanation"]
                  },
                  description: "5 quiz questions to test understanding"
                }
              },
              required: ["intro", "example", "practice", "quiz"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_lesson" } },
        messages: [
          {
            role: "system",
            content: `You are a financial literacy course content creator. Generate high-quality educational lesson content for a personal finance learning platform. The audience ranges from beginners to intermediate learners of all ages.

Rules:
- Use clear, accessible language
- Include practical real-world examples
- Make questions challenging but fair
- All 4 answer options should be plausible
- Explanations should teach, not just state the answer
- Practice should have exactly 3 questions
- Quiz should have exactly 5 questions
- Each question must have exactly 4 options`
          },
          {
            role: "user",
            content: `Generate a complete lesson for:
Course: ${courseTitle}
Unit: ${moduleTitle}
Lesson: ${lessonTitle}

Create engaging, educational content with the 4-part structure.`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error: " + response.status);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const lessonContent = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ content: lessonContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-lesson-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
