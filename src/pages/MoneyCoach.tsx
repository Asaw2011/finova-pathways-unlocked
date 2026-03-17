import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/money-coach`;

const suggestedQuestions = [
  "Based on my profile, what should I focus on first?",
  "How do I start saving money effectively?",
  "What's the difference between a debit and credit card?",
  "How does compound interest work?",
  "What's the 50/30/20 budgeting rule?",
  "How do I build my credit score?",
];

const MoneyCoach = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user's financial profile to personalize the coach
  const { data: financialProfile } = useQuery({
    queryKey: ["financial-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("financial_profiles" as any)
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as any;
    },
    enabled: !!user,
  });

  const { data: userProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          userProfile: financialProfile ? {
            name: userProfile?.display_name || "Learner",
            lifeStage: financialProfile.life_stage,
            primaryGoal: financialProfile.primary_goal,
            knowledgeLevel: financialProfile.knowledge_level,
            learningPace: financialProfile.learning_pace,
          } : null,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to get response");
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-80px)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-display">Money Coach</h1>
            <p className="text-xs text-muted-foreground">
              {financialProfile ? `Personalized for you · ${financialProfile.primary_goal === "save" ? "Saving focus" : financialProfile.primary_goal === "invest" ? "Investing focus" : financialProfile.primary_goal === "debt" ? "Debt-free focus" : "Earning focus"}` : "Your AI financial advisor"}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="text-muted-foreground">
            <Trash2 className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </motion.div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-display">
                {financialProfile ? `Hi ${userProfile?.display_name || "there"}! How can I help?` : "Ask me anything about money!"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {financialProfile ? "I know your goals and can give you personalized advice." : "I'm here to help you learn about budgeting, saving, investing, credit, and more."}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 max-w-md mx-auto">
              {suggestedQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs bg-card border border-border rounded-xl p-3 hover:border-primary/30 hover:shadow-sm transition-all text-muted-foreground hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card border border-border rounded-bl-md"
            )}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border pt-4">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about budgeting, investing, credit..."
            className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="rounded-xl px-4">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MoneyCoach;
