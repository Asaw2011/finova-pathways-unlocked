import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Get user's financial profile
    const { data: profile } = await supabase
      .from("financial_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile) throw new Error("No financial profile found. Complete the assessment first.");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Generate personalized course structure
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
            name: "generate_course",
            description: "Generate a personalized financial literacy course with 7 units of 5 lessons each.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Custom course title based on user's goals" },
                description: { type: "string", description: "1-2 sentence course description" },
                units: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      lessons: {
                        type: "array",
                        items: { type: "string" },
                        description: "5 lesson titles for this unit"
                      }
                    },
                    required: ["title", "description", "lessons"]
                  },
                  description: "Exactly 7 units"
                },
                action_plan: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      week: { type: "string", description: "e.g. Week 1-2" },
                      action: { type: "string", description: "Specific actionable step" }
                    },
                    required: ["week", "action"]
                  },
                  description: "90-day action plan with 6 milestones"
                }
              },
              required: ["title", "description", "units", "action_plan"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_course" } },
        messages: [
          {
            role: "system",
            content: `You are a financial education curriculum designer. Create a personalized course based on the user's profile. The course should have exactly 7 units with 5 lessons each (35 total). Include a 90-day action plan.

Focus areas based on goals:
- "save": Emergency funds, high-yield savings, automation, goal-based saving
- "invest": Market basics, index funds, compound interest, portfolio building  
- "debt": Debt avalanche/snowball, credit repair, refinancing, budgeting
- "earn": Side hustles, salary negotiation, career growth, passive income
- "budget": Zero-based budgeting, expense tracking, spending psychology

Adjust complexity based on knowledge level (beginner/intermediate/advanced).`
          },
          {
            role: "user",
            content: `Create a personalized course for this learner:
- Life stage: ${profile.life_stage}
- Primary goal: ${profile.primary_goal}
- Knowledge level: ${profile.knowledge_level}
- Learning pace: ${profile.learning_pace}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI unavailable" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI error: " + response.status);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const courseData = JSON.parse(toolCall.function.arguments);

    // Create the course in DB using service role
    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user already has a custom course (Course 7)
    const courseId = `c7-${user.id.slice(0, 8)}`;
    const { data: existingCourse } = await adminSupabase
      .from("courses")
      .select("id")
      .eq("id", courseId)
      .maybeSingle();

    if (existingCourse) {
      // Delete existing modules/lessons for regeneration
      const { data: existingModules } = await adminSupabase.from("modules").select("id").eq("course_id", courseId);
      if (existingModules) {
        for (const mod of existingModules) {
          await adminSupabase.from("lessons").delete().eq("module_id", mod.id);
        }
        await adminSupabase.from("modules").delete().eq("course_id", courseId);
      }
      await adminSupabase.from("courses").update({
        title: courseData.title,
        description: courseData.description,
      }).eq("id", courseId);
    } else {
      await adminSupabase.from("courses").insert({
        id: courseId,
        title: courseData.title,
        description: courseData.description,
        category: "Custom",
        difficulty: profile.knowledge_level,
        is_premium: true,
        sort_order: 7,
        estimated_hours: 20,
      });
    }

    // Create units and lessons
    for (let ui = 0; ui < courseData.units.length; ui++) {
      const unit = courseData.units[ui];
      const { data: mod } = await adminSupabase.from("modules").insert({
        course_id: courseId,
        title: unit.title,
        description: unit.description,
        sort_order: ui + 1,
      }).select().single();

      if (mod) {
        const lessonInserts = unit.lessons.map((title: string, li: number) => ({
          module_id: mod.id,
          title,
          type: "reading",
          sort_order: li + 1,
          duration_minutes: 10,
        }));
        await adminSupabase.from("lessons").insert(lessonInserts);
      }
    }

    return new Response(JSON.stringify({
      courseId,
      title: courseData.title,
      description: courseData.description,
      action_plan: courseData.action_plan,
      units: courseData.units.length,
      lessons: courseData.units.reduce((sum: number, u: any) => sum + u.lessons.length, 0),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-custom-course error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
