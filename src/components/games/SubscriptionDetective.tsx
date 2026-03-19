import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Diamond, RotateCcw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { getGrade, getGemsFromScore } from "@/pages/GamesZone";

interface Subscription {
  name: string; cost: number; category: string; emoji: string; lastUsed: string; timesUsedMonth: number; hidden?: boolean;
}

const allSubs: Subscription[] = [
  { name: "Netflix", cost: 15.99, category: "streaming", emoji: "🎬", lastUsed: "Yesterday", timesUsedMonth: 22 },
  { name: "Hulu", cost: 7.99, category: "streaming", emoji: "📺", lastUsed: "3 days ago", timesUsedMonth: 8 },
  { name: "Disney+", cost: 13.99, category: "streaming", emoji: "✨", lastUsed: "Last week", timesUsedMonth: 4 },
  { name: "Amazon Prime", cost: 14.99, category: "shopping", emoji: "📦", lastUsed: "Today", timesUsedMonth: 12 },
  { name: "Spotify", cost: 10.99, category: "music", emoji: "🎵", lastUsed: "Today", timesUsedMonth: 30 },
  { name: "Apple Music", cost: 10.99, category: "music", emoji: "🎶", lastUsed: "4 months ago", timesUsedMonth: 0 },
  { name: "Gym", cost: 49.99, category: "fitness", emoji: "💪", lastUsed: "2 weeks ago", timesUsedMonth: 2 },
  { name: "Meal Kit", cost: 89.99, category: "food", emoji: "🥗", lastUsed: "Last week", timesUsedMonth: 4 },
  { name: "Cloud Storage", cost: 2.99, category: "tech", emoji: "☁️", lastUsed: "Daily", timesUsedMonth: 30 },
  { name: "News Sub", cost: 14.99, category: "reading", emoji: "📰", lastUsed: "2 months ago", timesUsedMonth: 1 },
  { name: "Adobe Suite", cost: 19.99, category: "tech", emoji: "🎨", lastUsed: "Last month", timesUsedMonth: 3 },
  { name: "Dating App", cost: 29.99, category: "social", emoji: "💝", lastUsed: "Yesterday", timesUsedMonth: 15 },
  { name: "Book Sub", cost: 14.99, category: "reading", emoji: "📚", lastUsed: "Last week", timesUsedMonth: 6 },
  { name: "Gaming Pass", cost: 14.99, category: "gaming", emoji: "🎮", lastUsed: "Yesterday", timesUsedMonth: 18 },
  { name: "Meditation App", cost: 12.99, category: "wellness", emoji: "🧘", lastUsed: "3 months ago", timesUsedMonth: 0 },
  { name: "Password Manager", cost: 3.99, category: "tech", emoji: "🔐", lastUsed: "Daily", timesUsedMonth: 30 },
  { name: "VPN", cost: 9.99, category: "tech", emoji: "🛡️", lastUsed: "Daily", timesUsedMonth: 30 },
  { name: "Fitness App", cost: 19.99, category: "fitness", emoji: "🏃", lastUsed: "5 months ago", timesUsedMonth: 0 },
  { name: "Photo Storage", cost: 9.99, category: "tech", emoji: "📸", lastUsed: "Weekly", timesUsedMonth: 4 },
  { name: "Audiobooks", cost: 14.95, category: "reading", emoji: "🎧", lastUsed: "Last week", timesUsedMonth: 5 },
];

const hiddenSubs: Subscription[] = [
  { name: "Old Magazine", cost: 5.99, category: "reading", emoji: "📄", lastUsed: "Never", timesUsedMonth: 0, hidden: true },
  { name: "Free Trial → Paid", cost: 29.99, category: "tech", emoji: "⚠️", lastUsed: "Never", timesUsedMonth: 0, hidden: true },
  { name: "Forgotten Charity", cost: 10.00, category: "donation", emoji: "🎗️", lastUsed: "Auto", timesUsedMonth: 0, hidden: true },
];

const TARGET_BUDGET = 80;

const SubscriptionDetective = ({ earnGems, onComplete, personalBest, gemsMultiplier = 1 }: {
  earnGems: (n: number) => Promise<void>; onComplete?: (score: number) => void; personalBest?: number | null; gemsMultiplier?: number;
}) => {
  const [phase, setPhase] = useState<"reveal" | "eliminate" | "hunt" | "negotiate" | "results">("reveal");
  const [kept, setKept] = useState<Set<number>>(new Set(allSubs.map((_, i) => i)));
  const [foundHidden, setFoundHidden] = useState<Set<number>>(new Set());
  const [negotiated, setNegotiated] = useState<Set<number>>(new Set());
  const [gemsClaimed, setGemsClaimed] = useState(false);
  const [huntClicks, setHuntClicks] = useState(0);

  const monthlyTotal = allSubs.reduce((s, sub, i) => s + (kept.has(i) ? (negotiated.has(i) ? sub.cost * 0.75 : sub.cost) : 0), 0);
  const yearlyTotal = monthlyTotal * 12;
  const allTotal = allSubs.reduce((s, sub) => s + sub.cost, 0);
  const hiddenTotal = hiddenSubs.reduce((s, sub, i) => s + (foundHidden.has(i) ? 0 : sub.cost), 0);

  const toggleKeep = (i: number) => {
    setKept(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const tryNegotiate = (i: number) => {
    if (negotiated.has(i) || !kept.has(i)) return;
    const success = Math.random() > 0.3;
    if (success) {
      setNegotiated(prev => new Set(prev).add(i));
      toast.success(`${allSubs[i].name} discounted 25%!`);
    } else {
      toast.error(`${allSubs[i].name} won't budge on price.`);
    }
  };

  // Duplicates detection
  const duplicates = new Map<string, number[]>();
  allSubs.forEach((sub, i) => {
    if (!kept.has(i)) return;
    const existing = duplicates.get(sub.category) || [];
    existing.push(i);
    duplicates.set(sub.category, existing);
  });
  const dupCategories = Array.from(duplicates.entries()).filter(([_, indices]) => indices.length > 1);

  // Score
  const gameScore = (() => {
    const budgetScore = monthlyTotal <= TARGET_BUDGET ? 40 : Math.max(0, 40 - Math.round((monthlyTotal - TARGET_BUDGET) / 5));
    const dupScore = dupCategories.length === 0 ? 20 : Math.max(0, 20 - dupCategories.length * 5);
    const hiddenScore = foundHidden.size * 7;
    const negotiateScore = negotiated.size * 3;
    const unusedKept = allSubs.filter((s, i) => kept.has(i) && s.timesUsedMonth === 0).length;
    const unusedPenalty = unusedKept * 5;
    return Math.min(100, Math.max(0, budgetScore + dupScore + hiddenScore + negotiateScore - unusedPenalty));
  })();

  if (phase === "reveal") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="bg-card rounded-2xl border-2 p-5 text-center space-y-3">
          <p className="text-3xl">💳</p>
          <p className="font-display font-extrabold text-lg">Your Monthly Subscriptions</p>
          <p className="text-sm text-muted-foreground">You're currently spending:</p>
          <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-3xl font-black font-display text-destructive">${allTotal.toFixed(2)}/month</motion.p>
          <p className="text-sm text-muted-foreground">That's <span className="font-bold text-destructive">${(allTotal * 12).toFixed(0)}/year</span></p>
          <p className="text-xs text-muted-foreground">If invested at 8% → <span className="font-bold text-primary">${Math.round(allTotal * 12 * 10 * 1.08).toLocaleString()}</span> in 10 years</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-sm font-bold">🎯 Target: Get below <span className="text-primary">${TARGET_BUDGET}/month</span></p>
          <p className="text-xs text-muted-foreground">Find duplicates, eliminate waste, negotiate discounts</p>
        </div>
        <Button onClick={() => setPhase("eliminate")} className="w-full rounded-xl font-bold py-3">Start Eliminating →</Button>
      </motion.div>
    );
  }

  if (phase === "eliminate") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div><p className="text-xs text-muted-foreground">Current Monthly</p><p className={cn("font-bold font-display", monthlyTotal <= TARGET_BUDGET ? "text-emerald-600" : "text-destructive")}>${monthlyTotal.toFixed(2)}</p></div>
          <div className="text-right"><p className="text-xs text-muted-foreground">Target</p><p className="font-bold font-display text-primary">${TARGET_BUDGET}/mo</p></div>
        </div>

        {dupCategories.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-bold text-amber-700">⚠️ Duplicates found:</p>
            {dupCategories.map(([cat, indices]) => (
              <p key={cat} className="text-xs text-amber-600">
                {cat}: {indices.map(i => allSubs[i].name).join(" & ")} — pick one!
              </p>
            ))}
          </div>
        )}

        <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
          {allSubs.map((sub, i) => (
            <div key={sub.name} className={cn("rounded-xl border p-2.5 flex items-center gap-2 transition-all",
              kept.has(i) ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-50")}>
              <button onClick={() => toggleKeep(i)} className={cn("w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                kept.has(i) ? "bg-primary border-primary" : "border-muted-foreground")}>
                {kept.has(i) && <span className="text-primary-foreground text-[10px]">✓</span>}
              </button>
              <span className="text-lg">{sub.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm truncate">{sub.name}</span>
                  {sub.timesUsedMonth === 0 && kept.has(i) && <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded font-bold">UNUSED</span>}
                </div>
                <p className="text-[10px] text-muted-foreground">Used {sub.timesUsedMonth}x/month • {sub.lastUsed}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("font-bold text-xs", negotiated.has(i) ? "text-emerald-600 line-through" : "")}>${sub.cost}</p>
                {negotiated.has(i) && <p className="text-xs font-bold text-emerald-600">${(sub.cost * 0.75).toFixed(2)}</p>}
              </div>
              {kept.has(i) && !negotiated.has(i) && (
                <button onClick={() => tryNegotiate(i)} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold shrink-0 hover:bg-primary/20">Deal?</button>
              )}
            </div>
          ))}
        </div>

        <Button onClick={() => setPhase("hunt")} className="w-full rounded-xl font-bold">
          🔍 Hunt for Hidden Subscriptions →
        </Button>
      </div>
    );
  }

  if (phase === "hunt") {
    const spots = ["📱 Check phone", "💳 Credit card statement", "📧 Old emails", "🗂️ App drawer", "📋 Bank statement"];
    return (
      <div className="space-y-4">
        <p className="font-display font-extrabold text-lg text-center">🔍 Hidden Subscription Hunt</p>
        <p className="text-sm text-muted-foreground text-center">Tap to search for forgotten subscriptions. You have 5 searches.</p>
        <div className="grid grid-cols-2 gap-2">
          {spots.map((spot, i) => {
            const found = i < hiddenSubs.length && foundHidden.has(i);
            const searched = huntClicks > i;
            return (
              <button key={spot} disabled={searched}
                onClick={() => {
                  setHuntClicks(c => c + 1);
                  if (i < hiddenSubs.length) {
                    setFoundHidden(prev => new Set(prev).add(i));
                    toast.success(`Found: ${hiddenSubs[i].name} — $${hiddenSubs[i].cost}/mo!`);
                  } else {
                    toast("Nothing hidden here!");
                  }
                }}
                className={cn("rounded-xl border-2 p-4 text-center transition-all",
                  searched ? (found ? "border-emerald-300 bg-emerald-50" : "border-border bg-muted/30 opacity-50") : "border-border hover:border-primary/30")}>
                <p className="text-2xl mb-1">{searched && found ? "✅" : searched ? "❌" : "❓"}</p>
                <p className="text-xs font-medium">{spot}</p>
                {found && <p className="text-[10px] text-emerald-600 font-bold mt-1">{hiddenSubs[i].name}: ${hiddenSubs[i].cost}/mo</p>}
              </button>
            );
          })}
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Hidden subs found: <span className="font-bold">{foundHidden.size}</span> saving <span className="font-bold text-emerald-600">${hiddenSubs.filter((_, i) => foundHidden.has(i)).reduce((s, h) => s + h.cost, 0).toFixed(2)}/mo</span></p>
        </div>
        <Button onClick={() => setPhase("results")} className="w-full rounded-xl font-bold">See Final Results 🏁</Button>
      </div>
    );
  }

  // RESULTS
  const grade = getGrade(gameScore);
  const gems = getGemsFromScore(gameScore);
  const saved = allTotal - monthlyTotal + hiddenSubs.filter((_, i) => foundHidden.has(i)).reduce((s, h) => s + h.cost, 0);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center">
      <p className="text-5xl">{gameScore >= 80 ? "🏆" : gameScore >= 50 ? "🔍" : "💸"}</p>
      <p className="text-4xl font-black font-display">{grade}</p>
      <p className="text-2xl font-bold">{gameScore}/100</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200"><p className="text-xs text-emerald-700">Monthly Savings</p><p className="font-bold text-emerald-700">${saved.toFixed(2)}</p></div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200"><p className="text-xs text-blue-700">Yearly Savings</p><p className="font-bold text-blue-700">${(saved * 12).toFixed(0)}</p></div>
      </div>
      <p className="text-xs text-muted-foreground">Hidden subs found: {foundHidden.size}/3 • Negotiated: {negotiated.size} discounts</p>
      {monthlyTotal <= TARGET_BUDGET ? (
        <p className="text-sm font-bold text-emerald-600">✅ Under ${TARGET_BUDGET}/month target!</p>
      ) : (
        <p className="text-sm font-bold text-destructive">Still ${(monthlyTotal - TARGET_BUDGET).toFixed(2)} over budget</p>
      )}
      {personalBest !== null && personalBest !== undefined && gameScore > personalBest && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-yellow-400 text-yellow-900 rounded-xl p-3 font-extrabold text-sm">🎉 NEW PERSONAL BEST!</motion.div>
      )}
      {!gemsClaimed ? (
        <Button onClick={async () => { await earnGems(gems * gemsMultiplier); onComplete?.(gameScore); setGemsClaimed(true); toast.success(`+${gems * gemsMultiplier} gems!`); }}
          className="w-full rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white"><Diamond className="w-4 h-4 mr-1" /> Claim {gems * gemsMultiplier} Gems</Button>
      ) : <p className="text-cyan-600 font-bold text-sm">✓ Gems claimed!</p>}
      <Button variant="outline" onClick={() => { setPhase("reveal"); setKept(new Set(allSubs.map((_, i) => i))); setFoundHidden(new Set()); setNegotiated(new Set()); setGemsClaimed(false); setHuntClicks(0); }}
        className="w-full rounded-xl"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
    </motion.div>
  );
};

export default SubscriptionDetective;
