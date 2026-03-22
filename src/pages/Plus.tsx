import { Link } from "react-router-dom";
import { ArrowLeft, Check, Crown, Heart, BookOpen, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: Heart, label: "Unlimited hearts", description: "Never stop learning" },
  { icon: BookOpen, label: "Premium courses", description: "Exclusive advanced content" },
  { icon: Zap, label: "No ads, ever", description: "Distraction-free experience" },
  { icon: Shield, label: "Streak repair", description: "Protect your streak if you miss a day" },
  { icon: Star, label: "Exclusive badges", description: "Stand out on the leaderboard" },
  { icon: Crown, label: "Early access", description: "Get new features first" },
];

const Plus = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-lg font-bold font-display"><span className="gradient-text">FinOva</span></span>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="font-semibold">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-3">
            FinOva <span className="gradient-gold">Plus</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            The premium way to master money. No limits, no interruptions.
          </p>
        </div>
      </section>

      {/* Perks grid */}
      <section className="bg-card border-y border-border/40 px-6 py-14 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map(({ icon: Icon, label, description }) => (
              <div key={label} className="flex items-start gap-4 p-5 rounded-2xl bg-background border border-border/60">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-sm mb-0.5">{label}</h3>
                  <p className="text-muted-foreground text-xs">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-6 py-14 md:py-16">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-extrabold font-display text-center mb-8">Free vs Plus</h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-bold bg-secondary/50 px-4 py-3">
              <span>Feature</span>
              <span className="text-center">Free</span>
              <span className="text-center gradient-gold">Plus</span>
            </div>
            {[
              ["Hearts", "5/day", "Unlimited"],
              ["Courses", "Basic", "All"],
              ["Ads", "Yes", "None"],
              ["Streak repair", "No", "Yes"],
              ["Exclusive badges", "No", "Yes"],
              ["Early access", "No", "Yes"],
            ].map(([feature, free, plus], i) => (
              <div key={feature} className={`grid grid-cols-3 text-sm px-4 py-3 ${i % 2 === 0 ? "bg-background" : "bg-secondary/20"}`}>
                <span className="font-medium">{feature}</span>
                <span className="text-center text-muted-foreground">{free}</span>
                <span className="text-center font-semibold text-amber-600">{plus}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-card border-y border-border/40 px-6 py-14 md:py-16 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-extrabold font-display mb-3">Upgrade today</h2>
          <p className="text-muted-foreground text-sm mb-6">Start your free trial and unlock everything FinOva has to offer.</p>
          <Link to="/auth">
            <Button size="lg" className="font-bold rounded-xl px-8 bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-lg">
              Try Plus Free <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-5 px-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} FinOva ·{" "}
          <Link to="/" className="hover:text-foreground">Home</Link> ·{" "}
          <Link to="/disclaimers" className="hover:text-foreground">Terms</Link>
        </p>
      </footer>
    </div>
  );
};

export default Plus;
