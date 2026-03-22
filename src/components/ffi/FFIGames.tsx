import { useState } from "react";
import { Gamepad2, DollarSign, ShoppingCart, TrendingUp, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Budget Builder ───
const BUDGET_CATEGORIES = ["Food", "Entertainment", "Transportation", "Savings", "Miscellaneous"];
const INCOME = 500;

const BudgetBuilder = () => {
  const [allocs, setAllocs] = useState<Record<string, number>>({ Food: 150, Entertainment: 50, Transportation: 80, Savings: 120, Miscellaneous: 100 });
  const [submitted, setSubmitted] = useState(false);

  const total = Object.values(allocs).reduce((a, b) => a + b, 0);
  const savingsPercent = ((allocs.Savings / INCOME) * 100).toFixed(0);
  const isValid = total === INCOME;
  const isWin = isValid && allocs.Savings >= INCOME * 0.2;

  const update = (cat: string, val: number) => {
    setAllocs((prev) => ({ ...prev, [cat]: Math.max(0, val) }));
    setSubmitted(false);
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg">Budget Builder</h3>
      </div>
      <div className="bg-secondary/50 rounded-lg p-3 mb-4 text-sm space-y-1">
        <p><strong>What you learn:</strong> How to allocate income responsibly.</p>
        <p><strong>How to play:</strong> Distribute your $500 across 5 categories using the sliders.</p>
        <p><strong>Goal:</strong> Spend exactly $500 and save at least 20% ($100+).</p>
      </div>

      <div className="space-y-3">
        {BUDGET_CATEGORIES.map((cat) => (
          <div key={cat}>
            <div className="flex justify-between text-sm mb-1">
              <span>{cat}</span>
              <span className="font-mono font-semibold">${allocs[cat]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={INCOME}
              step={10}
              value={allocs[cat]}
              onChange={(e) => update(cat, Number(e.target.value))}
              className="w-full accent-primary h-2 rounded-full"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <span>Total: <span className={total === INCOME ? "text-primary font-bold" : "text-destructive font-bold"}>${total}</span> / ${INCOME}</span>
        <span>Savings: <span className="font-bold">{savingsPercent}%</span></span>
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={() => setSubmitted(true)} disabled={!isValid} className="flex-1">Check Budget</Button>
        <Button variant="outline" size="icon" onClick={() => { setAllocs({ Food: 150, Entertainment: 50, Transportation: 80, Savings: 120, Miscellaneous: 100 }); setSubmitted(false); }}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {submitted && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${isWin ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
          {isWin ? "🎉 Great job! You're building financial stability." : `Almost! Your savings is ${savingsPercent}% — aim for at least 20%.`}
        </div>
      )}
    </div>
  );
};

// ─── Needs vs Wants ───
const ITEMS: { name: string; type: "need" | "want" }[] = [
  { name: "Groceries", type: "need" },
  { name: "Rent", type: "need" },
  { name: "Medicine", type: "need" },
  { name: "Gas", type: "need" },
  { name: "Netflix", type: "want" },
  { name: "New Shoes", type: "want" },
  { name: "Video Games", type: "want" },
  { name: "Takeout", type: "want" },
];

const NeedsVsWants = () => {
  const [answers, setAnswers] = useState<Record<string, "need" | "want">>({});
  const [submitted, setSubmitted] = useState(false);

  const toggle = (name: string, choice: "need" | "want") => {
    setAnswers((p) => ({ ...p, [name]: choice }));
    setSubmitted(false);
  };

  const score = ITEMS.filter((i) => answers[i.name] === i.type).length;

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingCart className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg">Needs vs Wants</h3>
      </div>
      <div className="bg-secondary/50 rounded-lg p-3 mb-4 text-sm space-y-1">
        <p><strong>What you learn:</strong> The difference between essential and optional spending.</p>
        <p><strong>How to play:</strong> For each item, tap "Need" or "Want."</p>
        <p><strong>Goal:</strong> Classify all 8 items correctly.</p>
      </div>

      <div className="space-y-2">
        {ITEMS.map((item) => {
          const ans = answers[item.name];
          const correct = submitted && ans === item.type;
          const wrong = submitted && ans && ans !== item.type;
          return (
            <div key={item.name} className="flex items-center justify-between gap-2 bg-secondary/30 rounded-lg px-3 py-2">
              <span className="text-sm font-medium flex items-center gap-2">
                {item.name}
                {correct && <CheckCircle2 className="w-4 h-4 text-primary" />}
                {wrong && <XCircle className="w-4 h-4 text-destructive" />}
              </span>
              <div className="flex gap-1">
                <button onClick={() => toggle(item.name, "need")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${ans === "need" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"}`}>Need</button>
                <button onClick={() => toggle(item.name, "want")} className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${ans === "want" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"}`}>Want</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < ITEMS.length} className="flex-1">Check Answers</Button>
        <Button variant="outline" size="icon" onClick={() => { setAnswers({}); setSubmitted(false); }}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {submitted && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${score === ITEMS.length ? "bg-primary/10 text-primary" : "bg-accent/50"}`}>
          {score === ITEMS.length ? "🎉 Perfect! Smart spending starts by knowing the difference." : `You got ${score}/${ITEMS.length}. Review and try again!`}
        </div>
      )}
    </div>
  );
};

// ─── Investing Timeline ───
const GROWTH_DATA = [
  { age: 18, label: "Age 18", emoji: "🎓", monthly: 100, at60: "$403,927", raw: 403927, data: [0, 8, 20, 42, 78, 130, 200, 290, 404] },
  { age: 25, label: "Age 25", emoji: "💼", monthly: 100, at60: "$229,388", raw: 229388, data: [0, 6, 15, 30, 55, 95, 150, 229] },
  { age: 35, label: "Age 35", emoji: "🏠", monthly: 100, at60: "$118,589", raw: 118589, data: [0, 5, 12, 24, 48, 80, 119] },
];

export const InvestingTimeline = () => {
  const [selected, setSelected] = useState(0);
  const d = GROWTH_DATA[selected];
  const maxVal = 404;
  const diff18 = GROWTH_DATA[0].raw - d.raw;

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg">Start Investing Early</h3>
            <p className="text-xs text-muted-foreground">See why time beats timing</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Age selector */}
        <div className="flex gap-2 my-5">
          {GROWTH_DATA.map((g, i) => (
            <button
              key={g.age}
              onClick={() => setSelected(i)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                selected === i
                  ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                  : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
              }`}
            >
              <span className="block text-base">{g.emoji}</span>
              <span className="block text-xs mt-0.5">{g.label}</span>
            </button>
          ))}
        </div>

        {/* Bar chart */}
        <div className="relative flex items-end gap-1.5 h-44 mb-5 px-1">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(pct => (
            <div key={pct} className="absolute left-0 right-0 border-t border-border/40" style={{ bottom: `${pct}%` }} />
          ))}
          {d.data.map((val, i) => {
            const height = (val / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end relative z-10 group">
                {val > 0 && (
                  <span className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    ${val}k
                  </span>
                )}
                <div
                  className="w-full rounded-t-md transition-all duration-700 ease-out"
                  style={{
                    height: `${height}%`,
                    minHeight: val > 0 ? 6 : 0,
                    background: `linear-gradient(to top, hsl(var(--primary)), hsl(var(--accent)))`,
                    opacity: 0.15 + (i / d.data.length) * 0.85,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Result card */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border p-5 text-center">
          <p className="text-sm text-muted-foreground mb-1">
            Investing <span className="font-bold text-foreground">${d.monthly}/mo</span> starting at <span className="font-bold text-foreground">{d.label}</span>
          </p>
          <p className="text-3xl md:text-4xl font-black font-display gradient-text mb-1">{d.at60}</p>
          <p className="text-xs text-muted-foreground">by age 60</p>
          {selected > 0 && (
            <p className="text-xs text-destructive font-semibold mt-2">
              That's ${diff18.toLocaleString()} less than starting at 18
            </p>
          )}
          {selected === 0 && (
            <p className="text-xs text-primary font-semibold mt-2">
              ✨ Starting earliest = maximum compound growth
            </p>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-3">
          *Hypothetical example · 8% avg annual return · Compounded monthly · Not a guarantee
        </p>
      </div>
    </div>
  );
};

// ─── Main Games Section ───
const FFIGames = () => (
  <section className="mb-16">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-primary/10">
        <Gamepad2 className="w-5 h-5 text-primary" />
      </div>
      <h2 className="text-2xl font-bold font-display">
        Financial <span className="gradient-text">Games</span>
      </h2>
    </div>
    <p className="text-muted-foreground mb-8 max-w-2xl">
      Practice real financial skills with these interactive games. No pressure — just learning by doing.
    </p>
    <div className="grid lg:grid-cols-2 gap-6">
      <BudgetBuilder />
      <NeedsVsWants />
      <div className="lg:col-span-2">
        <InvestingTimeline />
      </div>
    </div>
  </section>
);

export default FFIGames;
