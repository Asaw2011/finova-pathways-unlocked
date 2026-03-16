import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, DollarSign } from "lucide-react";

const subscriptions = [
  { name: "Spotify", cost: 10 },
  { name: "Netflix", cost: 15 },
  { name: "Apple Music", cost: 11 },
  { name: "Gaming Pass", cost: 17 },
  { name: "Random App", cost: 5 },
];

const BUDGET = 30;

const SubscriptionTrap = () => {
  const [kept, setKept] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const totalKept = subscriptions.reduce((s, sub, i) => s + (kept.has(i) ? sub.cost : 0), 0);
  const allTotal = subscriptions.reduce((s, sub) => s + sub.cost, 0);

  const toggle = (i: number) => {
    if (submitted) return;
    setKept(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const reset = () => { setKept(new Set()); setSubmitted(false); };

  return (
    <div className="space-y-4">
      <div className="glass rounded-lg p-4">
        <p className="text-sm font-medium mb-1">💳 Monthly Subscriptions</p>
        <p className="text-xs text-muted-foreground mb-3">You have a <span className="text-primary font-bold">${BUDGET}/month</span> entertainment budget. Choose wisely.</p>
        <p className="text-xs text-muted-foreground">Total if you kept all: <span className="font-bold text-destructive">${allTotal}/month</span> = <span className="font-bold text-destructive">${allTotal * 12}/year</span></p>
      </div>

      <div className="space-y-2">
        {subscriptions.map((sub, i) => (
          <button
            key={sub.name}
            onClick={() => toggle(i)}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all",
              kept.has(i) ? "glass border-primary/30 bg-primary/5" : "glass opacity-60",
              submitted && "cursor-default"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center", kept.has(i) ? "bg-primary border-primary" : "border-muted-foreground")}>
                {kept.has(i) && <span className="text-primary-foreground text-xs">✓</span>}
              </div>
              <span className="font-medium">{sub.name}</span>
            </div>
            <span className="font-display font-semibold">${sub.cost}/mo</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-muted-foreground">Selected total:</span>
        <span className={cn("font-bold font-display", totalKept <= BUDGET ? "text-primary" : "text-destructive")}>${totalKept}/mo</span>
      </div>

      {!submitted ? (
        <Button onClick={() => setSubmitted(true)} className="w-full" disabled={kept.size === 0}>Lock In Choices</Button>
      ) : (
        <div className={cn("rounded-xl p-5 text-center", totalKept <= BUDGET ? "bg-primary/10 border border-primary/20" : "bg-destructive/10 border border-destructive/20")}>
          <p className="font-bold font-display text-lg mb-1">
            {totalKept <= BUDGET ? "Great budgeting! 🎉" : "Over budget! 💸"}
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            You chose ${totalKept}/mo out of a ${BUDGET} budget.
            {totalKept > BUDGET && ` That's $${(totalKept - BUDGET) * 12} over per year!`}
          </p>
          <p className="text-xs text-muted-foreground italic mb-4">Small subscriptions can quietly drain your money.</p>
          <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="w-3 h-3 mr-1" /> Try Again</Button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionTrap;
