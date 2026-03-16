import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

const actions = [
  { text: "Pay credit card on time", impact: 30, good: true },
  { text: "Keep balance below 30%", impact: 20, good: true },
  { text: "Miss a payment", impact: -50, good: false },
  { text: "Max out your credit card", impact: -40, good: false },
  { text: "Close your oldest account", impact: -25, good: false },
  { text: "Set up autopay", impact: 15, good: true },
  { text: "Apply for 5 cards at once", impact: -30, good: false },
  { text: "Pay more than minimum", impact: 25, good: true },
];

const CreditScoreChallenge = () => {
  const [score, setScore] = useState(650);
  const [history, setHistory] = useState<{ text: string; impact: number }[]>([]);
  const [done, setDone] = useState(false);
  const [remaining, setRemaining] = useState([...actions].sort(() => Math.random() - 0.5));

  const handleAction = (index: number) => {
    const action = remaining[index];
    const newScore = Math.max(300, Math.min(850, score + action.impact));
    setScore(newScore);
    setHistory(prev => [...prev, { text: action.text, impact: action.impact }]);
    setRemaining(prev => prev.filter((_, i) => i !== index));
    if (remaining.length <= 1) setDone(true);
  };

  const reset = () => {
    setScore(650);
    setHistory([]);
    setDone(false);
    setRemaining([...actions].sort(() => Math.random() - 0.5));
  };

  const scoreColor = score >= 740 ? "text-primary" : score >= 670 ? "text-warning" : "text-destructive";
  const scoreLabel = score >= 740 ? "Excellent" : score >= 670 ? "Good" : score >= 580 ? "Fair" : "Poor";
  const pct = ((score - 300) / 550) * 100;

  return (
    <div className="space-y-4">
      {/* Score meter */}
      <div className="glass rounded-xl p-5 text-center">
        <p className="text-xs text-muted-foreground mb-1">Your Credit Score</p>
        <p className={cn("text-4xl font-bold font-display", scoreColor)}>{score}</p>
        <p className={cn("text-sm font-medium", scoreColor)}>{scoreLabel}</p>
        <div className="mt-3 h-3 bg-secondary rounded-full overflow-hidden relative">
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-destructive/40" />
            <div className="flex-1 bg-warning/40" />
            <div className="flex-1 bg-primary/40" />
          </div>
          <div className="absolute top-0 bottom-0 w-1 bg-foreground rounded-full transition-all" style={{ left: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>300</span><span>580</span><span>670</span><span>740</span><span>850</span>
        </div>
      </div>

      {/* Actions */}
      {!done ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">Choose an action:</p>
          {remaining.slice(0, 3).map((action, i) => (
            <button
              key={action.text}
              onClick={() => handleAction(i)}
              className="w-full glass rounded-lg p-3 text-left text-sm hover:border-primary/30 transition-all"
            >
              {action.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-5 text-center bg-primary/5 border border-primary/20">
          <p className="font-bold font-display text-lg mb-1">
            Final Score: {score}
          </p>
          <p className="text-xs text-muted-foreground italic mb-4">Responsible habits build strong credit.</p>
          <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="w-3 h-3 mr-1" /> Play Again</Button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">History:</p>
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-secondary/30">
              <span>{h.text}</span>
              <span className={cn("font-bold", h.impact > 0 ? "text-primary" : "text-destructive")}>
                {h.impact > 0 ? "+" : ""}{h.impact}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreditScoreChallenge;
