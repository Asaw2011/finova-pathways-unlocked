import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, RefreshCw, Sparkles } from "lucide-react";
import FinancialAssessment from "@/components/onboarding/FinancialAssessment";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";

const Profile = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { hasAccess: isPlusUser } = usePremiumAccess();
  const [displayName, setDisplayName] = useState("");
  const [showAssessment, setShowAssessment] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

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

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground">Loading profile...</div>;
  }

  if (showAssessment) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button
          onClick={() => setShowAssessment(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Profile
        </button>
        <FinancialAssessment
          isPlusUser={isPlusUser}
          isRedo
          onComplete={() => {
            setShowAssessment(false);
            queryClient.invalidateQueries({ queryKey: ["financial-profile"] });
            toast.success("Your learning profile has been updated!");
          }}
        />
      </div>
    );
  }

  const goalLabels: Record<string, string> = {
    save: "Build savings",
    invest: "Start investing",
    debt: "Get out of debt",
    earn: "Earn more money",
  };

  const stageLabels: Record<string, string> = {
    teen: "Teen (13–17)",
    young_adult: "Young Adult (18–24)",
    mid_career: "Working Adult (25–44)",
    established: "Established (45+)",
    parent: "Parent",
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <div>
        <h1 className="text-3xl font-bold font-display">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <div className="glass rounded-xl p-6 space-y-6">
        {/* Avatar placeholder */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-display font-semibold">{profile?.display_name || "Learner"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Edit form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Financial Profile / Onboarding */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Learning Profile
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAssessment(true)}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {financialProfile ? "Retake Assessment" : "Take Assessment"}
          </Button>
        </div>

        {financialProfile ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Life Stage</p>
              <p className="text-sm font-semibold mt-0.5">{stageLabels[financialProfile.life_stage] || financialProfile.life_stage}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Primary Goal</p>
              <p className="text-sm font-semibold mt-0.5">{goalLabels[financialProfile.primary_goal] || financialProfile.primary_goal}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Knowledge</p>
              <p className="text-sm font-semibold mt-0.5 capitalize">{financialProfile.knowledge_level}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Learning Pace</p>
              <p className="text-sm font-semibold mt-0.5 capitalize">{financialProfile.learning_pace}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Take the financial assessment to personalize your learning experience and get tailored advice from the Money Coach.
          </p>
        )}
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="font-display font-semibold mb-2">Account</h3>
        <Button variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
