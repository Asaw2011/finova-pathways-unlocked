import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";

const options = [
  { label: "Use Emergency Savings", icon: "💰", result: "You covered the cost with no debt! Your emergency fund protected you from financial stress.", correct: true, impact: "No debt, peace of mind" },
  { label: "Put It on a Credit Card", icon: "💳", result: "You'll pay $600 + interest. At 24% APR, that's $744 if it takes a year to pay off.", correct: false, impact: "+$144 in interest" },
  { label: "Borrow from a Friend", icon: "🤝", result: "You got the money, but now you owe someone. This can strain relationships and create stress.", correct: false, impact: "Social debt + stress" },
  { label: "Delay the Repair", icon: "⏳", result: "The problem gets worse. What was $600 could become $1,200 later, plus you can't get to work.", correct: false, impact: "Higher cost + lost income" },
];

const EmergencyFundBuilder = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <p className="font-bold font-display">Emergency Scenario</p>
        </div>
        <p className="text-sm text-muted-foreground mb-2">Your car breaks down unexpectedly.</p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground">Repair cost:</span>
          <span className="text-2xl font-bold font-display text-destructive">$600</span>
        </div>
      </div>

      {selected === null ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">How do you handle this?</p>
          {options.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => setSelected(i)}
              className="w-full glass rounded-lg p-4 text-left hover:border-primary/30 transition-all"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{opt.icon}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className={cn(
          "rounded-xl p-5 border",
          options[selected].correct ? "bg-primary/10 border-primary/20" : "bg-destructive/10 border-destructive/20"
        )}>
          {options[selected].correct ? (
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-2" />
          )}
          <p className="font-bold font-display text-center text-lg mb-2">
            {options[selected].correct ? "Smart move! ✅" : "There's a better option 🤔"}
          </p>
          <p className="text-sm text-center text-muted-foreground mb-2">{options[selected].result}</p>
          <p className="text-xs text-center font-medium mb-1">Impact: {options[selected].impact}</p>
          {!options[selected].correct && (
            <p className="text-xs text-center text-primary mt-2 font-medium">Best choice: Emergency Savings — no debt, no stress.</p>
          )}
          <p className="text-xs text-center text-muted-foreground italic mt-3">Emergency funds prevent financial stress.</p>
          <div className="text-center mt-4">
            <Button size="sm" variant="outline" onClick={() => setSelected(null)}><RotateCcw className="w-3 h-3 mr-1" /> Try Again</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyFundBuilder;
