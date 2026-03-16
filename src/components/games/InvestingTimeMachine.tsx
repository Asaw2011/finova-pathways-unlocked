import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrendingUp, RotateCcw } from "lucide-react";

const MONTHLY = 100;
const RATE = 0.07;
const END_AGE = 60;

function calculateGrowth(startAge: number) {
  const years = END_AGE - startAge;
  const months = years * 12;
  let total = 0;
  const monthlyRate = RATE / 12;
  for (let i = 0; i < months; i++) {
    total = (total + MONTHLY) * (1 + monthlyRate);
  }
  return Math.round(total);
}

const ages = [18, 25, 35];
const results = ages.map(age => ({ age, value: calculateGrowth(age), years: END_AGE - age }));
const maxValue = Math.max(...results.map(r => r.value));

const InvestingTimeMachine = () => {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="glass rounded-lg p-4">
        <p className="text-sm font-medium mb-1">⏰ Investing Time Machine</p>
        <p className="text-xs text-muted-foreground">Invest <span className="text-primary font-bold">${MONTHLY}/month</span> at <span className="text-primary font-bold">{RATE * 100}% annual growth</span>. See the value at age {END_AGE}.</p>
      </div>

      {selectedAge === null ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">When would you start investing?</p>
          {ages.map(age => (
            <button
              key={age}
              onClick={() => setSelectedAge(age)}
              className="w-full glass rounded-lg p-4 text-left hover:border-primary/30 transition-all"
            >
              <span className="font-display font-bold text-lg">Age {age}</span>
              <span className="text-xs text-muted-foreground ml-2">({END_AGE - age} years of investing)</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bar chart */}
          <div className="space-y-3">
            {results.map(r => {
              const width = (r.value / maxValue) * 100;
              const isSelected = r.age === selectedAge;
              return (
                <div key={r.age} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn("font-medium", isSelected && "text-primary font-bold")}>
                      Start at {r.age} ({r.years} years)
                    </span>
                    <span className={cn("font-display font-bold", isSelected ? "text-primary" : "text-muted-foreground")}>
                      ${(r.value / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="h-8 bg-secondary rounded-lg overflow-hidden">
                    <div
                      className={cn("h-full rounded-lg transition-all duration-1000 flex items-center justify-end pr-2", isSelected ? "bg-primary" : "bg-muted-foreground/30")}
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-[10px] font-bold text-primary-foreground">${r.value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl p-4 bg-primary/5 border border-primary/20 text-center">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium mb-1">
              Starting at {selectedAge} → <span className="text-primary font-bold">${results.find(r => r.age === selectedAge)!.value.toLocaleString()}</span> by age {END_AGE}
            </p>
            <p className="text-xs text-muted-foreground italic">Time matters more than timing the market.</p>
          </div>

          <div className="text-center">
            <Button size="sm" variant="outline" onClick={() => setSelectedAge(null)}>
              <RotateCcw className="w-3 h-3 mr-1" /> Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestingTimeMachine;
