import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

const deductions = [
  { name: "Federal Tax", rate: 0.10 },
  { name: "State Tax", rate: 0.04 },
  { name: "Social Security", rate: 0.062 },
  { name: "Medicare", rate: 0.0145 },
];

const GROSS_PAY = 800;
const actualTakeHome = Math.round(GROSS_PAY * (1 - deductions.reduce((s, d) => s + d.rate, 0)));

const PaycheckBreakdown = () => {
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const guessNum = parseInt(guess);
  const isClose = !isNaN(guessNum) && Math.abs(guessNum - actualTakeHome) <= 30;
  const isExact = !isNaN(guessNum) && Math.abs(guessNum - actualTakeHome) <= 5;

  const reset = () => { setGuess(""); setSubmitted(false); };

  return (
    <div className="space-y-6">
      <div className="glass rounded-lg p-4">
        <p className="text-sm font-medium mb-1">📄 Your Mock Paycheck</p>
        <p className="text-xs text-muted-foreground mb-3">Understand where paycheck money goes.</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Gross Pay:</span>
          <span className="text-2xl font-bold font-display">${GROSS_PAY}</span>
        </div>
        <div className="space-y-2">
          {deductions.map(d => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">- {d.name}</span>
              <span className="font-medium text-destructive">-${Math.round(GROSS_PAY * d.rate)}</span>
            </div>
          ))}
        </div>
      </div>

      {!submitted ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Estimate your take-home pay:</p>
          <div className="flex gap-2">
            <Input type="number" placeholder="$" value={guess} onChange={e => setGuess(e.target.value)} className="max-w-[150px]" />
            <Button onClick={() => setSubmitted(true)} disabled={!guess}>Submit</Button>
          </div>
        </div>
      ) : (
        <div className={cn("rounded-xl p-5 text-center", isExact ? "bg-primary/10 border border-primary/20" : isClose ? "bg-warning/10 border border-warning/20" : "bg-destructive/10 border border-destructive/20")}>
          {isExact ? <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" /> : isClose ? <CheckCircle2 className="w-10 h-10 text-warning mx-auto mb-2" /> : <XCircle className="w-10 h-10 text-destructive mx-auto mb-2" />}
          <p className="font-bold font-display text-lg mb-1">
            {isExact ? "Nailed it!" : isClose ? "Close!" : "Not quite!"}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            Actual take-home: <span className="font-bold text-foreground">${actualTakeHome}</span> (your guess: ${guessNum})
          </p>
          <p className="text-xs text-muted-foreground italic mb-4">The number you earn is not the number you keep.</p>
          <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="w-3 h-3 mr-1" /> Try Again</Button>
        </div>
      )}
    </div>
  );
};

export default PaycheckBreakdown;
