import { Link } from "react-router-dom";
import { ArrowLeft, Check, Crown, Heart, BookOpen, Zap, Shield, Star, X, Gamepad2, Bot, Award, TrendingUp, Diamond, Flame, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const comparisonData = [
  { feature: "Core lessons (Modules 1-2)", free: true, premium: true },
  { feature: "All 10+ modules", free: "First 2 lessons only", premium: true },
  { feature: "Hearts", free: "5 (regen every 30min)", premium: "∞ Unlimited" },
  { feature: "Streak freezes", free: "0", premium: "3 per month" },
  { feature: "Daily challenges", free: "1 per day", premium: "3 per day" },
  { feature: "Financial games", free: "3 games", premium: "All 13" },
  { feature: "Paper Trading simulator", free: false, premium: true },
  { feature: "Money Coach AI", free: "Basic tips", premium: "Full conversations" },
  { feature: "Mistakes Review", free: false, premium: true },
  { feature: "Premium badges & awards", free: false, premium: true },
  { feature: "Ad-free experience", free: false, premium: true },
  { feature: "Leaderboard leagues", free: "View only", premium: "Compete" },
  { feature: "Certificate of completion", free: false, premium: true },
];

const testimonials = [
  { name: "Sarah K.", avatar: "S", quote: "I went from knowing nothing about investing to confidently managing my own portfolio. FinOva Plus was worth every penny.", rating: 5 },
  { name: "Marcus T.", avatar: "M", quote: "The games and interactive lessons keep me coming back daily. My 45-day streak is proof this method works!", rating: 5 },
  { name: "Priya R.", avatar: "P", quote: "Finally a finance app that doesn't talk down to you. The AI coach alone is worth the subscription.", rating: 5 },
];

const faqs = [
  { q: "Can I cancel anytime?", a: "Yes, cancel anytime. No long-term commitment. You'll keep access until the end of your billing period." },
  { q: "Is my payment secure?", a: "Yes, all payments are processed securely through Stripe. We never store your card details." },
  { q: "What happens after my free trial?", a: "You'll be charged the plan rate unless you cancel before the trial ends. We'll send a reminder before charging." },
  { q: "Can I switch plans?", a: "Yes, upgrade or downgrade anytime. If you switch from monthly to yearly, you'll get prorated credit." },
];

const Plus = () => {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-lg font-bold font-display"><span className="gradient-text">Fin</span><span className="gradient-text">Ova</span></span>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="font-semibold">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 mb-6 shadow-lg">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display mb-4">
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Unlock Your Full Financial Future
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Join thousands learning to build real wealth — at their own pace
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Monthly */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={cn(
                "rounded-2xl border-2 p-6 text-left transition-all cursor-pointer",
                billingPeriod === "monthly" ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-card hover:border-primary/40"
              )}
              onClick={() => setBillingPeriod("monthly")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Monthly</h3>
                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  billingPeriod === "monthly" ? "border-primary bg-primary" : "border-border"
                )}>
                  {billingPeriod === "monthly" && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
              <p className="text-3xl font-extrabold font-display">$9.99<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="text-xs text-muted-foreground mt-1">Billed monthly. Cancel anytime.</p>
              <Link to="/auth" className="block mt-4">
                <Button className="w-full rounded-xl font-bold" variant={billingPeriod === "monthly" ? "default" : "outline"}>
                  Start 7-Day Free Trial
                </Button>
              </Link>
            </motion.div>

            {/* Yearly */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className={cn(
                "rounded-2xl border-2 p-6 text-left transition-all cursor-pointer relative",
                billingPeriod === "yearly" ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-lg ring-2 ring-amber-400/30" : "border-border bg-card hover:border-amber-400/40"
              )}
              onClick={() => setBillingPeriod("yearly")}
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Best Value
              </span>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Yearly</h3>
                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  billingPeriod === "yearly" ? "border-amber-500 bg-amber-500" : "border-border"
                )}>
                  {billingPeriod === "yearly" && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold font-display">$59.99<span className="text-base font-normal text-muted-foreground">/yr</span></p>
                <span className="text-sm text-muted-foreground line-through">$119.88</span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">Save 50% — just $5/month</p>
              <Link to="/auth" className="block mt-4">
                <Button className="w-full rounded-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white">
                  Start 7-Day Free Trial
                </Button>
              </Link>
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">7-day free trial on all plans. Cancel anytime.</p>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="bg-card border-y border-border/40 px-6 py-14 md:py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-center mb-8">Free vs Premium</h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] text-sm font-bold bg-muted/50 px-4 py-3">
              <span>Feature</span>
              <span className="text-center">Free</span>
              <span className="text-center text-amber-600">Plus ✦</span>
            </div>
            {comparisonData.map((row, i) => (
              <div key={row.feature} className={cn(
                "grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] text-sm px-4 py-3 border-t border-border/50",
                i % 2 === 0 ? "bg-background" : "bg-muted/20"
              )}>
                <span className="font-medium text-xs sm:text-sm">{row.feature}</span>
                <span className="text-center">
                  {row.free === true ? (
                    <Check className="w-4 h-4 text-primary mx-auto" />
                  ) : row.free === false ? (
                    <X className="w-4 h-4 text-destructive/50 mx-auto" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{row.free}</span>
                  )}
                </span>
                <span className="text-center">
                  {row.premium === true ? (
                    <Check className="w-4 h-4 text-amber-500 mx-auto" />
                  ) : (
                    <span className="text-xs font-bold text-amber-600">{row.premium}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-14 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={cn("w-5 h-5", s <= 5 ? "text-amber-400 fill-amber-400" : "text-muted")} />
            ))}
            <span className="font-bold text-sm ml-1">4.8/5</span>
          </div>
          <p className="text-sm text-muted-foreground mb-8">Trusted by 2,000+ learners</p>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-5 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">"{t.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card border-y border-border/40 px-6 py-14 md:py-16">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-extrabold font-display text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-left hover:bg-muted/30 transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3 text-sm text-muted-foreground">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-14 md:py-20 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display mb-3">Start Your Journey Today</h2>
          <p className="text-muted-foreground text-sm mb-6">7-day free trial. Cancel anytime. Your financial future starts now.</p>
          <Link to="/auth">
            <Button size="lg" className="font-bold rounded-xl px-10 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white shadow-lg">
              Start Free Trial <Crown className="w-4 h-4 ml-2" />
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
