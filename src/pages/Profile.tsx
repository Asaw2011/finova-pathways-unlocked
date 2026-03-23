import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { User, RefreshCw, Sparkles, Flame, Zap, BookOpen, Gamepad2, Clock, CheckCircle2 } from "lucide-react";
import FinancialAssessment from "@/components/onboarding/FinancialAssessment";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { useAvatar } from "@/contexts/AvatarContext";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import { modules } from "@/data/course-modules";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const ActivityHeatmap = ({ activityDates }: { activityDates: Set<string> }) => {
  const weeks = useMemo(() => {
    const result: string[][] = [];
    const today = new Date();
    for (let w = 11; w >= 0; w--) {
      const week: string[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + (6 - d)));
        week.push(date.toISOString().split("T")[0]);
      }
      result.push(week);
    }
    return result;
  }, []);

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-muted-foreground">Last 12 weeks</p>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(day => (
              <div key={day} className={cn(
                "w-3 h-3 rounded-sm",
                activityDates.has(day) ? "bg-primary" : "bg-muted"
              )} title={day} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { hasAccess: isPlusUser } = usePremiumAccess();
  const { currentStreak, level, xp } = useGameEconomy();
  const { avatarConfig } = useAvatar();
  const [displayName, setDisplayName] = useState("");
  const [showAssessment, setShowAssessment] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: financialProfile } = useQuery({
    queryKey: ["financial-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("financial_profiles" as any).select("*").eq("user_id", user!.id).maybeSingle();
      return data as any;
    },
    enabled: !!user,
  });

  const { data: xpRecords } = useQuery({
    queryKey: ["user-xp-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: gamesPlayed } = useQuery({
    queryKey: ["games-played-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("games_played").select("id").eq("user_id", user!.id);
      return data?.length ?? 0;
    },
    enabled: !!user,
  });

  const completedLessons = useMemo(() => new Set(xpRecords?.filter(x => x.source === "lesson").map(x => x.source_id) ?? []), [xpRecords]);
  const totalLessons = completedLessons.size;
  const quizzesPassed = xpRecords?.filter(x => x.source === "unit-quiz").length ?? 0;
  const timeEstimate = totalLessons * 4;

  const activityDates = useMemo(() => {
    const dates = new Set<string>();
    xpRecords?.forEach(r => { dates.add(r.earned_at.split("T")[0]); });
    return dates;
  }, [xpRecords]);

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name || "");
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["profile"] }); toast.success("Profile updated!"); },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="animate-pulse text-muted-foreground">Loading profile...</div>;

  if (showAssessment) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setShowAssessment(false)} className="text-sm text-muted-foreground hover:text-foreground">← Back to Profile</button>
        <FinancialAssessment isPlusUser={isPlusUser} isRedo
          onComplete={() => { setShowAssessment(false); queryClient.invalidateQueries({ queryKey: ["financial-profile"] }); toast.success("Your learning profile has been updated!"); }} />
      </div>
    );
  }

  const goalLabels: Record<string, string> = { save: "Build savings", invest: "Start investing", debt: "Get out of debt", earn: "Earn more money" };
  const stageLabels: Record<string, string> = { teen: "Teen (13–17)", young_adult: "Young Adult (18–24)", mid_career: "Working Adult (25–44)", established: "Established (45+)", parent: "Parent" };

  const statCards = [
    { icon: Zap, label: "Total XP", value: `${xp.toLocaleString()}`, sub: `Level ${level}`, color: "text-primary" },
    { icon: Flame, label: "Streak", value: `${currentStreak}`, sub: "days", color: "text-orange-500" },
    { icon: BookOpen, label: "Lessons", value: `${totalLessons}`, sub: "completed", color: "text-primary" },
    { icon: CheckCircle2, label: "Quizzes", value: `${quizzesPassed}`, sub: "passed", color: "text-emerald-500" },
    { icon: Gamepad2, label: "Games", value: `${gamesPlayed ?? 0}`, sub: "played", color: "text-violet-500" },
    { icon: Clock, label: "Time", value: `${timeEstimate}`, sub: "minutes", color: "text-sky-500" },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <div>
        <h1 className="text-3xl font-bold font-display">Profile</h1>
        <p className="text-muted-foreground mt-1">Your stats and account settings</p>
      </div>

      {/* My Stats */}
      <div className="glass rounded-xl p-5 space-y-5">
        <h3 className="font-display font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> My Stats</h3>
        <div className="grid grid-cols-3 gap-2">
          {statCards.map(s => (
            <div key={s.label} className="rounded-xl bg-muted/50 p-3 text-center">
              <s.icon className={cn("w-5 h-5 mx-auto mb-1", s.color)} />
              <p className="text-lg font-extrabold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="font-display font-semibold">Learning Activity</h3>
        <ActivityHeatmap activityDates={activityDates} />
      </div>

      {/* Module Progress */}
      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="font-display font-semibold">Module Progress</h3>
        <div className="space-y-2">
          {modules.map(mod => {
            const done = mod.lessons.filter(l => completedLessons.has(l.id)).length;
            const total = mod.lessons.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={mod.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    {pct === 100 && <CheckCircle2 className="w-3 h-3 text-primary" />}
                    {mod.title}
                  </span>
                  <span className="text-muted-foreground">{done}/{total} — {pct}%</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Info */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <AvatarRenderer config={avatarConfig} size="lg" />
          <div>
            <p className="font-display font-semibold">{profile?.display_name || "Learner"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Link to="/avatar-builder" className="text-xs font-bold text-primary hover:underline mt-1 inline-block">
              ✏️ Customize Avatar
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Learning Profile */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Learning Profile</h3>
          <Button variant="outline" size="sm" onClick={() => setShowAssessment(true)} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            {financialProfile ? "Retake Assessment" : "Take Assessment"}
          </Button>
        </div>
        {financialProfile ? (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Life Stage", value: stageLabels[financialProfile.life_stage] || financialProfile.life_stage },
              { label: "Primary Goal", value: goalLabels[financialProfile.primary_goal] || financialProfile.primary_goal },
              { label: "Knowledge", value: financialProfile.knowledge_level },
              { label: "Learning Pace", value: financialProfile.learning_pace },
            ].map(item => (
              <div key={item.label} className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-semibold mt-0.5 capitalize">{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Take the financial assessment to personalize your learning experience.</p>
        )}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-display font-semibold mb-2">Account</h3>
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>
    </div>
  );
};

export default Profile;
