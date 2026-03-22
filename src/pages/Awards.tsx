import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Award, Trophy, Share2, Medal, Star, Flame, BookOpen, Printer, Target, Zap, Brain, GraduationCap, Heart, Crown, Shield, Gem } from "lucide-react";
import { modules } from "@/data/course-modules";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

const achievementBadges = [
  { id: "first-lesson", name: "First Step", desc: "Complete your first lesson", icon: Target },
  { id: "five-lessons", name: "Getting Started", desc: "Complete 5 lessons", icon: BookOpen },
  { id: "ten-lessons", name: "Dedicated Learner", desc: "Complete 10 lessons", icon: Flame },
  { id: "twenty-lessons", name: "Knowledge Seeker", desc: "Complete 20 lessons", icon: Brain },
  { id: "all-lessons", name: "Financial Scholar", desc: "Complete all lessons", icon: Trophy },
  { id: "streak-3", name: "3-Day Streak", desc: "Learn 3 days in a row", icon: Zap },
  { id: "streak-7", name: "Week Warrior", desc: "7-day learning streak", icon: Star },
  { id: "streak-30", name: "Monthly Master", desc: "30-day learning streak", icon: Gem },
];

const Awards = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"badges" | "certificates">("badges");

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
      const { data } = await supabase
        .from("certificates")
        .select("*, courses(title, category)")
        .eq("user_id", user!.id)
        .order("issued_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: xpRecords } = useQuery({
    queryKey: ["user-xp", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("*").eq("user_id", user!.id);
      return data ?? [];
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

  const lessonsCompleted = xpRecords?.filter(x => x.source === "lesson").length ?? 0;
  const currentStreak = streak?.current_streak ?? 0;

  const getModuleTitle = (cert: any) => cert.courses?.title || modules.find(m => m.id === cert.course_id)?.title || "Financial Literacy";
  const getModuleCategory = (cert: any) => cert.courses?.category || "Learning Path Module";

  const handleShare = (cert: any) => {
    const text = `I just earned a FinOva Certificate in ${getModuleTitle(cert)}! 🎓 #FinOva #FinancialLiteracy`;
    if (navigator.share) {
      navigator.share({ title: "FinOva Certificate", text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  const handlePrint = (cert: any) => {
    const title = getModuleTitle(cert);
    const name = profile?.display_name || "Learner";
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Certificate</title><style>body{font-family:Georgia,serif;text-align:center;padding:60px;border:8px double #c4a35a;margin:40px;min-height:80vh;display:flex;flex-direction:column;justify-content:center}h1{color:#c4a35a;font-size:18px;letter-spacing:4px;margin-bottom:8px}h2{font-size:32px;margin:20px 0}p{color:#555;font-size:16px;line-height:1.6}</style></head><body><h1>FINOVA</h1><h2>Certificate of Completion</h2><p>This certifies that<br/><strong style="font-size:24px;color:#222">${name}</strong><br/>has successfully completed<br/><strong style="font-size:20px;color:#222">${title}</strong></p><p style="margin-top:40px;font-size:12px">Certificate #${cert.certificate_number}<br/>Issued: ${new Date(cert.issued_at).toLocaleDateString()}</p></body></html>`);
    w.document.close();
    w.print();
  };

  // profile data for print
  const { data: profileData } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });
  const profile = profileData;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display">Awards</h1>
        <p className="text-muted-foreground mt-1">Your badges, achievements, and certificates</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold font-display">{badges?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground">Badges</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <Award className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-extrabold font-display">{certificates?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground">Certificates</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <Star className="w-6 h-6 text-primary mx-auto mb-1" />
          <p className="text-2xl font-extrabold font-display">{lessonsCompleted}</p>
          <p className="text-xs text-muted-foreground">Lessons Done</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        <button
          onClick={() => setTab("badges")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
            tab === "badges" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          <Trophy className="w-4 h-4" /> Badges
        </button>
        <button
          onClick={() => setTab("certificates")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
            tab === "certificates" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          <Award className="w-4 h-4" /> Certificates
        </button>
      </div>

      {tab === "badges" && (
        <div className="space-y-6">
          {/* Achievement Badges */}
          <div>
            <h3 className="font-bold font-display text-sm text-muted-foreground mb-3">ACHIEVEMENTS</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {achievementBadges.map(badge => {
                const earned = badges?.find(b => b.badge_name === badge.name);
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "rounded-2xl p-4 text-center border transition-all",
                      earned ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-muted/30 border-border opacity-40"
                    )}
                  >
                    {(() => { const BadgeIcon = badge.icon; return <BadgeIcon className={cn("w-8 h-8 mx-auto mb-2", earned ? "text-amber-500" : "text-muted-foreground")} />; })()}
                    <p className="text-xs font-extrabold font-display">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</p>
                    {earned && (
                      <p className="text-[9px] text-amber-600 font-bold mt-1">
                        {new Date(earned.earned_at).toLocaleDateString()}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Unit Badges */}
          {badges && badges.filter(b => !achievementBadges.find(ab => ab.name === b.badge_name)).length > 0 && (
            <div>
              <h3 className="font-bold font-display text-sm text-muted-foreground mb-3">UNIT COMPLETION</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.filter(b => !achievementBadges.find(ab => ab.name === b.badge_name)).map(b => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl p-4 text-center bg-emerald-50 border border-emerald-200 shadow-sm"
                  >
                    <Medal className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-extrabold font-display">{b.badge_name}</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">
                      {new Date(b.earned_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {(!badges || badges.length === 0) && (
            <div className="rounded-2xl border border-border p-12 text-center bg-card">
              <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-display font-bold mb-1">No badges yet</h3>
              <p className="text-sm text-muted-foreground">Complete lessons to earn your first badge!</p>
            </div>
          )}
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
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-amber-500" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-6 h-6 text-amber-500" />
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        Certificate
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-lg mb-1">
                      {getModuleTitle(cert)}
                    </h3>
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
