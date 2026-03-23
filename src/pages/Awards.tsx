import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Award, Trophy, Share2, Medal, Star, Flame, BookOpen, Printer, Target, Zap, Brain, GraduationCap, Crown, Shield, Gem, Moon, Sun, Gamepad2, Bot, TrendingUp, Heart, Lock as LockIcon } from "lucide-react";
import { modules } from "@/data/course-modules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import confetti from "canvas-confetti";

interface BadgeDef {
  id: string;
  name: string;
  desc: string;
  icon: typeof Target;
  category: "learning" | "streak" | "performance" | "premium";
  check: (stats: Stats) => boolean;
}

interface Stats {
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  perfectQuizzes: number;
  hasPremium: boolean;
  paperTrades: number;
  coachUses: number;
  totalModules: number;
  completedModules: number;
}

const allBadges: BadgeDef[] = [
  // Learning Milestones
  { id: "first-steps", name: "First Steps", desc: "Complete your first lesson", icon: Target, category: "learning", check: s => s.lessonsCompleted >= 1 },
  { id: "knowledge-seeker", name: "Knowledge Seeker", desc: "Complete 10 lessons", icon: BookOpen, category: "learning", check: s => s.lessonsCompleted >= 10 },
  { id: "scholar", name: "Scholar", desc: "Complete 25 lessons", icon: GraduationCap, category: "learning", check: s => s.lessonsCompleted >= 25 },
  { id: "financial-wizard", name: "Financial Wizard", desc: "Complete 50 lessons", icon: Brain, category: "learning", check: s => s.lessonsCompleted >= 50 },
  { id: "master-of-money", name: "Master of Money", desc: "Complete all modules", icon: Crown, category: "learning", check: s => s.completedModules >= s.totalModules },

  // Streak Badges
  { id: "warming-up", name: "Warming Up", desc: "3-day streak", icon: Flame, category: "streak", check: s => s.longestStreak >= 3 },
  { id: "on-fire", name: "On Fire", desc: "7-day streak", icon: Flame, category: "streak", check: s => s.longestStreak >= 7 },
  { id: "blazing", name: "Blazing", desc: "30-day streak", icon: Flame, category: "streak", check: s => s.longestStreak >= 30 },
  { id: "unstoppable", name: "Unstoppable", desc: "100-day streak", icon: Zap, category: "streak", check: s => s.longestStreak >= 100 },

  // Performance Badges
  { id: "perfectionist", name: "Perfectionist", desc: "100% on any quiz", icon: Star, category: "performance", check: s => s.perfectQuizzes >= 1 },
  { id: "perfect-week", name: "Perfect Week", desc: "Daily challenge every day for a week", icon: Star, category: "performance", check: s => s.longestStreak >= 7 },
  { id: "speed-demon", name: "Speed Demon", desc: "Complete a lesson in under 90 seconds", icon: Zap, category: "performance", check: () => false },
  { id: "night-owl", name: "Night Owl", desc: "Complete a lesson after 10pm", icon: Moon, category: "performance", check: () => { const h = new Date().getHours(); return h >= 22; } },
  { id: "early-bird", name: "Early Bird", desc: "Complete a lesson before 7am", icon: Sun, category: "performance", check: () => { const h = new Date().getHours(); return h < 7; } },

  // Premium Badges
  { id: "supporter", name: "Supporter", desc: "Subscribe to Premium", icon: Gem, category: "premium", check: s => s.hasPremium },
  { id: "paper-trader", name: "Paper Trader", desc: "Complete 10 paper trades", icon: TrendingUp, category: "premium", check: s => s.paperTrades >= 10 },
  { id: "coach-regular", name: "Money Coach Regular", desc: "Use Money Coach 10 times", icon: Bot, category: "premium", check: s => s.coachUses >= 10 },
];

const categoryLabels: Record<string, { label: string; icon: typeof Target; color: string }> = {
  learning: { label: "Learning Milestones", icon: BookOpen, color: "text-primary" },
  streak: { label: "Streak Badges", icon: Flame, color: "text-amber-500" },
  performance: { label: "Performance", icon: Star, color: "text-purple-500" },
  premium: { label: "Premium Badges", icon: Crown, color: "text-amber-500" },
};

const Awards = () => {
  const { user } = useAuth();
  const { currentStreak, longestStreak, totalLessonsCompleted, perfectLessonsCount } = useGameEconomy();
  const [tab, setTab] = useState<"badges" | "certificates">("badges");
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null);

  const { data: badges } = useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_badges").select("*").eq("user_id", user!.id).order("earned_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["certificates-full", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("certificates").select("*, courses(title, category)").eq("user_id", user!.id).order("issued_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ["user-subscription", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_subscriptions").select("plan").eq("user_id", user!.id).neq("plan", "free").maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const { data: paperTradesCount } = useQuery({
    queryKey: ["paper-trades-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("paper_trades").select("id", { count: "exact", head: true }).eq("user_id", user!.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: coachMessagesCount } = useQuery({
    queryKey: ["coach-messages-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("coach_messages").select("id", { count: "exact", head: true }).eq("user_id", user!.id).eq("role", "user");
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: streak } = useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_streaks").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: profileData } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: completedQuizzes } = useQuery({
    queryKey: ["completed-quizzes-awards", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("source_id").eq("user_id", user!.id).eq("source", "unit-quiz");
      return new Set(data?.map(d => d.source_id) ?? []);
    },
    enabled: !!user,
  });

  const stats: Stats = {
    lessonsCompleted: totalLessonsCompleted,
    currentStreak: streak?.current_streak ?? currentStreak,
    longestStreak: Math.max(streak?.longest_streak ?? 0, longestStreak),
    perfectQuizzes: perfectLessonsCount,
    hasPremium: subscriptionData ?? false,
    paperTrades: paperTradesCount ?? 0,
    coachUses: coachMessagesCount ?? 0,
    totalModules: modules.length,
    completedModules: modules.filter(m => m.lessons.every(l => false) && completedQuizzes?.has(m.id)).length, // simplified
  };

  const earnedBadgeNames = new Set(badges?.map(b => b.badge_name) ?? []);

  // Confetti on newly unlocked badge
  useEffect(() => {
    if (newlyUnlocked) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      const t = setTimeout(() => setNewlyUnlocked(null), 3000);
      return () => clearTimeout(t);
    }
  }, [newlyUnlocked]);

  const getModuleTitle = (cert: any) => cert.courses?.title || modules.find(m => m.id === cert.course_id)?.title || "Financial Literacy";
  const getModuleCategory = (cert: any) => cert.courses?.category || "Learning Path Module";

  const handleShare = (cert: any) => {
    const text = `I just earned a FinOva Certificate in ${getModuleTitle(cert)}! 🎓 #FinOva #FinancialLiteracy`;
    if (navigator.share) navigator.share({ title: "FinOva Certificate", text });
    else { navigator.clipboard.writeText(text); toast.success("Copied to clipboard!"); }
  };

  const handlePrint = (cert: any) => {
    const title = getModuleTitle(cert);
    const name = profileData?.display_name || "Learner";
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Certificate</title><style>body{font-family:Georgia,serif;text-align:center;padding:60px;border:8px double #c4a35a;margin:40px;min-height:80vh;display:flex;flex-direction:column;justify-content:center}h1{color:#c4a35a;font-size:18px;letter-spacing:4px;margin-bottom:8px}h2{font-size:32px;margin:20px 0}p{color:#555;font-size:16px;line-height:1.6}</style></head><body><h1>FINOVA</h1><h2>Certificate of Completion</h2><p>This certifies that<br/><strong style="font-size:24px;color:#222">${name}</strong><br/>has successfully completed<br/><strong style="font-size:20px;color:#222">${title}</strong></p><p style="margin-top:40px;font-size:12px">Certificate #${cert.certificate_number}<br/>Issued: ${new Date(cert.issued_at).toLocaleDateString()}</p></body></html>`);
    w.document.close();
    w.print();
  };

  const totalUnlocked = allBadges.filter(b => earnedBadgeNames.has(b.name) || b.check(stats)).length;

  const renderBadgeCategory = (category: string) => {
    const catBadges = allBadges.filter(b => b.category === category);
    const catInfo = categoryLabels[category];
    const CatIcon = catInfo.icon;

    return (
      <div key={category}>
        <h3 className="font-bold font-display text-sm text-muted-foreground mb-3 flex items-center gap-2">
          <CatIcon className={cn("w-4 h-4", catInfo.color)} />
          {catInfo.label}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {catBadges.map(badge => {
            const earnedInDb = earnedBadgeNames.has(badge.name);
            const qualifies = badge.check(stats);
            const unlocked = earnedInDb || qualifies;
            const BadgeIcon = badge.icon;
            const earned = badges?.find(b => b.badge_name === badge.name);

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={unlocked ? { scale: 1.05 } : {}}
                className={cn(
                  "rounded-2xl p-4 text-center border-2 transition-all relative overflow-hidden",
                  unlocked ? "bg-card border-primary/30 shadow-sm" : "bg-muted/20 border-border opacity-50",
                  newlyUnlocked === badge.id && "ring-4 ring-amber-400 ring-offset-2"
                )}
              >
                {!unlocked && (
                  <div className="absolute inset-0 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <LockIcon className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                )}
                <div className={cn(
                  "w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center",
                  unlocked ? "bg-primary/10" : "bg-muted"
                )}>
                  <BadgeIcon className={cn("w-6 h-6", unlocked ? "text-primary" : "text-muted-foreground")} />
                </div>
                <p className="text-xs font-extrabold font-display">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{badge.desc}</p>
                {earned && (
                  <p className="text-[9px] text-primary font-bold mt-1">{new Date(earned.earned_at).toLocaleDateString()}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display flex items-center gap-3">
          <Trophy className="w-7 h-7 text-amber-500" />
          Awards
        </h1>
        <p className="text-muted-foreground mt-1">Your trophy room — badges, achievements, and certificates</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold font-display">{totalUnlocked}</p>
          <p className="text-xs text-muted-foreground">Badges</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <Award className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold font-display">{certificates?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground">Certificates</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <Star className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-extrabold font-display">{totalLessonsCompleted}</p>
          <p className="text-xs text-muted-foreground">Lessons Done</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        <button onClick={() => setTab("badges")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
            tab === "badges" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          <Trophy className="w-4 h-4" /> Badges ({totalUnlocked}/{allBadges.length})
        </button>
        <button onClick={() => setTab("certificates")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
            tab === "certificates" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          <Award className="w-4 h-4" /> Certificates
        </button>
      </div>

      {tab === "badges" && (
        <div className="space-y-8">
          {["learning", "streak", "performance", "premium"].map(cat => renderBadgeCategory(cat))}
        </div>
      )}

      {tab === "certificates" && (
        <div>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map(i => <div key={i} className="rounded-2xl border border-border p-6 animate-pulse h-48 bg-card" />)}
            </div>
          ) : certificates && certificates.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {certificates.map(cert => (
                <motion.div key={cert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-amber-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-6 h-6 text-amber-500" />
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">Certificate</span>
                    </div>
                    <h3 className="font-display font-extrabold text-lg mb-1">{getModuleTitle(cert)}</h3>
                    <p className="text-xs text-muted-foreground mb-1">{getModuleCategory(cert)}</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Issued: {new Date(cert.issued_at).toLocaleDateString()} • ID: {cert.certificate_number}
                    </p>
                    {cert.score !== null && (
                      <p className="text-sm mb-4">Score: <span className="font-bold text-primary">{cert.score}%</span></p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleShare(cert)} className="rounded-xl">
                        <Share2 className="w-3 h-3 mr-1" /> Share
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePrint(cert)} className="rounded-xl">
                        <Printer className="w-3 h-3 mr-1" /> Print
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border p-12 text-center bg-card">
              <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-display font-bold mb-1">No certificates yet</h3>
              <p className="text-sm text-muted-foreground">Complete unit quizzes to earn certificates</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Awards;
