import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Search, Flame, Zap, Trophy, Check, X, Mail, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FriendData {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friendProfile?: { display_name: string | null; avatar_url: string | null; user_id: string };
  friendStreak?: { current_streak: number; longest_streak: number };
  friendXp?: number;
}

const Friends = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchEmail, setSearchEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  // Fetch friendships
  const { data: friendships = [], isLoading } = useQuery({
    queryKey: ["friendships", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${user!.id},friend_id.eq.${user!.id}`);
      if (error) throw error;
      
      // Enrich with profiles, streaks, xp for accepted friends
      const enriched: FriendData[] = [];
      for (const f of (data || [])) {
        const friendUserId = f.user_id === user!.id ? f.friend_id : f.user_id;
        
        let friendProfile = null;
        let friendStreak = null;
        let friendXp = 0;

        if (f.status === "accepted") {
          const [profileRes, streakRes, xpRes] = await Promise.all([
            supabase.from("profiles").select("display_name, avatar_url, user_id").eq("user_id", friendUserId).maybeSingle(),
            supabase.from("user_streaks").select("current_streak, longest_streak").eq("user_id", friendUserId).maybeSingle(),
            supabase.from("user_xp").select("xp_amount").eq("user_id", friendUserId),
          ]);
          friendProfile = profileRes.data;
          friendStreak = streakRes.data;
          friendXp = (xpRes.data || []).reduce((sum: number, x: any) => sum + (x.xp_amount || 0), 0);
        } else {
          const profileRes = await supabase.from("profiles").select("display_name, avatar_url, user_id").eq("user_id", friendUserId).maybeSingle();
          friendProfile = profileRes.data;
        }

        enriched.push({
          ...f,
          friendProfile: friendProfile || { display_name: "Unknown", avatar_url: null, user_id: friendUserId },
          friendStreak: friendStreak || { current_streak: 0, longest_streak: 0 },
          friendXp,
        });
      }
      return enriched;
    },
    enabled: !!user,
  });

  const acceptedFriends = friendships.filter(f => f.status === "accepted");
  const pendingReceived = friendships.filter(f => f.status === "pending" && f.friend_id === user?.id);
  const pendingSent = friendships.filter(f => f.status === "pending" && f.user_id === user?.id);

  // Check premium status for friends
  const friendUserIds = useMemo(() => acceptedFriends.map(f => f.friendProfile?.user_id).filter(Boolean) as string[], [acceptedFriends]);
  const { data: premiumFriends } = useQuery({
    queryKey: ["premium-friends", friendUserIds],
    queryFn: async () => {
      if (friendUserIds.length === 0) return new Set<string>();
      const { data } = await supabase.from("user_subscriptions").select("user_id").in("user_id", friendUserIds).neq("plan", "free");
      return new Set(data?.map(s => s.user_id) ?? []);
    },
    enabled: friendUserIds.length > 0,
  });

  // Add friend by email
  const addFriendMutation = useMutation({
    mutationFn: async (email: string) => {
      // Look up user by email through profiles (we search display_name as proxy, or use the auth approach)
      // Since we can't query auth.users, we'll search profiles - user needs to share their email
      // For simplicity, we'll use a workaround: search by display name
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .ilike("display_name", `%${email}%`)
        .neq("user_id", user!.id)
        .limit(1);

      if (!profiles || profiles.length === 0) {
        throw new Error("No user found with that name. Ask your friend for their display name!");
      }

      const friendId = profiles[0].user_id;

      // Check if already friends
      const { data: existing } = await supabase
        .from("friendships")
        .select("id")
        .or(`and(user_id.eq.${user!.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user!.id})`);

      if (existing && existing.length > 0) {
        throw new Error("Friend request already exists!");
      }

      const { error } = await supabase
        .from("friendships")
        .insert({ user_id: user!.id, friend_id: friendId, status: "pending" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      toast.success("Friend request sent!");
      setSearchEmail("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Accept friend request
  const acceptMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      toast.success("Friend added!");
    },
  });

  // Remove/decline friend
  const removeMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendships"] });
      toast.success("Removed.");
    },
  });

  const getLevelFromXp = (xp: number) => {
    const levels = ["Penny", "Nickel", "Dime", "Quarter", "Dollar", "Investor", "Tycoon", "Mogul", "Quant"];
    const idx = Math.min(Math.floor(xp / 200), levels.length - 1);
    return levels[idx];
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold font-display flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Friends
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Connect with friends and see how they're doing!</p>
      </motion.div>

      {/* Add friend */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-4 card-shadow">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-primary" /> Add a Friend
        </h3>
        <p className="text-xs text-muted-foreground mb-3">Search by display name to send a friend request.</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter display name..."
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
              className="pl-9 rounded-xl"
              onKeyDown={e => e.key === "Enter" && searchEmail.trim() && addFriendMutation.mutate(searchEmail.trim())}
            />
          </div>
          <Button onClick={() => searchEmail.trim() && addFriendMutation.mutate(searchEmail.trim())}
            disabled={!searchEmail.trim() || addFriendMutation.isPending}
            className="rounded-xl">
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("friends")}
          className={cn("flex-1 py-2 rounded-xl text-sm font-bold transition-colors",
            activeTab === "friends" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
          Friends ({acceptedFriends.length})
        </button>
        <button onClick={() => setActiveTab("requests")}
          className={cn("flex-1 py-2 rounded-xl text-sm font-bold transition-colors relative",
            activeTab === "requests" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
          Requests
          {pendingReceived.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-duo-red text-white text-[10px] font-bold flex items-center justify-center">
              {pendingReceived.length}
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">Loading...</div>
      ) : activeTab === "friends" ? (
        <div className="space-y-3">
          {acceptedFriends.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground font-semibold">No friends yet</p>
              <p className="text-xs text-muted-foreground">Add friends to see their learning progress!</p>
            </div>
          ) : (
            acceptedFriends.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-4 card-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {(f.friendProfile?.display_name || "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold truncate">{f.friendProfile?.display_name || "Friend"}</p>
                      {premiumFriends?.has(f.friendProfile?.user_id ?? "") && (
                        <span className="text-[8px] font-extrabold bg-amber-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                          <Crown className="w-2.5 h-2.5" /> PRO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> {getLevelFromXp(f.friendXp || 0)}
                    </p>
                  </div>
                  <button onClick={() => removeMutation.mutate(f.id)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-duo-red">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="rounded-xl bg-muted/50 p-2.5 text-center">
                    <Flame className="w-4 h-4 text-duo-orange mx-auto" />
                    <p className="text-sm font-extrabold mt-0.5">{f.friendStreak?.current_streak ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">Streak</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-2.5 text-center">
                    <Zap className="w-4 h-4 text-primary mx-auto" />
                    <p className="text-sm font-extrabold mt-0.5">{f.friendXp || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Total XP</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-2.5 text-center">
                    <Trophy className="w-4 h-4 text-duo-gold mx-auto" />
                    <p className="text-sm font-extrabold mt-0.5">{f.friendStreak?.longest_streak ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">Best Streak</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {pendingReceived.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground">Received</h3>
              {pendingReceived.map(f => (
                <div key={f.id} className="bg-card rounded-2xl border border-border p-4 card-shadow flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{f.friendProfile?.display_name || "Someone"}</p>
                    <p className="text-xs text-muted-foreground">wants to be your friend</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => acceptMutation.mutate(f.id)}
                      className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeMutation.mutate(f.id)}
                      className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-duo-red/10 hover:text-duo-red transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {pendingSent.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-muted-foreground">Sent</h3>
              {pendingSent.map(f => (
                <div key={f.id} className="bg-card rounded-2xl border border-border p-4 card-shadow flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-muted-foreground">
                      {(f.friendProfile?.display_name || "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{f.friendProfile?.display_name || "Friend"}</p>
                    <p className="text-xs text-muted-foreground">Pending...</p>
                  </div>
                  <button onClick={() => removeMutation.mutate(f.id)}
                    className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-duo-red transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {pendingReceived.length === 0 && pendingSent.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <Mail className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground font-semibold text-sm">No pending requests</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
