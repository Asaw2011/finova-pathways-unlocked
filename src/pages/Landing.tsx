import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Heart, BookOpen, Zap, Shield, Star,
  Crown, TrendingUp, Users, CheckCircle, ChevronDown,
  BarChart3, Wallet, PiggyBank, GraduationCap, Gamepad2, Brain, Target,
  Sparkles, Play, Lock, MessageCircle, Trophy, Flame, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Scroll reveal hook ── */
const useReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll(".reveal, .reveal-scale, .reveal-left, .reveal-right").forEach((t) => t.classList.add("is-visible"));
            if (e.target.classList.contains("reveal") || e.target.classList.contains("reveal-scale") || e.target.classList.contains("reveal-left") || e.target.classList.contains("reveal-right")) {
              e.target.classList.add("is-visible");
            }
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    el.querySelectorAll("[data-reveal]").forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);
  return ref;
};

const S = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useReveal();
  return <div ref={ref} className={className}>{children}</div>;
};

/*
 * All images from Unsplash — free to use under the Unsplash License:
 * https://unsplash.com/license
 */
const img = {
  hero: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1400&h=800&fit=crop&q=80",
  lessons: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop&q=80",
  games: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&q=80",
  coach: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&q=80",
  trading: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop&q=80",
  rewards: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&h=600&fit=crop&q=80",
  classroom: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&h=600&fit=crop&q=80",
};

const features = [
  { headline: "Bite-sized lessons that actually stick", body: "Each lesson takes just 5–10 minutes. No jargon, no fluff — just clear explanations with real-world examples that build on what you already know.", bullets: ["43 lessons across 7 expert-designed modules", "Quick quizzes after every lesson", "Pick up right where you left off"], image: img.lessons, alt: "Student writing notes while studying financial concepts" },
  { headline: "Learn through games, not lectures", body: "Build a monthly budget, dodge subscription traps, grow a virtual credit score — our simulations put you in real financial situations with zero real-world risk.", bullets: ["8 interactive financial simulations", "Realistic scenarios based on actual life events", "Compete with friends for top scores"], image: img.games, alt: "Friends playing an interactive learning game together" },
  { headline: "Your personal money coach", body: "Stuck on a concept? Ask your AI-powered coach anything about personal finance. It adapts to your learning level and gives answers you can actually understand.", bullets: ["Ask any money question, anytime", "Personalized recommendations for your level", "No judgement — just helpful guidance"], image: img.coach, alt: "Person using a financial planning app for guidance" },
  { headline: "Practice investing risk-free", body: "Our paper trading simulator uses live market data so you can buy and sell real stocks with fake money. Build confidence before you invest a single dollar.", bullets: ["Live stock prices, zero real risk", "Track your virtual portfolio over time", "Learn to read charts and spot trends"], image: img.trading, alt: "Phone showing stock market chart and financial data" },
  { headline: "Earn rewards that matter", body: "Stay motivated with gems, streaks, badges, and shareable certificates. Show colleges and employers you've mastered real financial skills.", bullets: ["Daily streaks and weekly challenges", "Certificates recognized by educators", "Leaderboard to compete with peers"], image: img.rewards, alt: "Graduate celebrating an achievement milestone" },
];

const reviews = [
  { q: "FinOva completely changed how I think about money. I went from spending every dollar to actually having a savings plan. This app should be required in every school.", n: "Aaliyah R.", r: "High School Senior", a: "AR" },
  { q: "The paper trading feature is incredible. My virtual portfolio is up 14% in 3 months. I feel way more prepared to invest real money now.", n: "Marcus T.", r: "College Sophomore", a: "MT" },
  { q: "Students actually ASK to do their financial literacy assignments now. I've never seen anything like it in 12 years of teaching.", n: "Ms. Patel", r: "Economics Teacher", a: "MP" },
  { q: "Nobody in my family knew how to help with FAFSA. The Student Finance module literally saved me thousands of dollars.", n: "Daniel O.", r: "High School Senior", a: "DO" },
  { q: "I'm obsessed — I log in every single day to keep my streak going. FinOva's games made everything click.", n: "Sofia L.", r: "College Freshman", a: "SL" },
  { q: "I've already started a Roth IRA at 17 because of what I learned here. Life-changing app.", n: "Jasmine K.", r: "High School Junior", a: "JK" },
  { q: "We're rolling it out to every 10th grader next semester. The curriculum is solid and the certificates give students something to show.", n: "Mr. Richardson", r: "Financial Literacy Teacher", a: "MR" },
  { q: "The credit score game taught me more than an entire semester of personal finance class. Five stars isn't enough.", n: "Chris M.", r: "College Junior", a: "CM" },
  { q: "My daughter talks to me about compound interest at dinner now. This is the financial education I wish I had growing up.", n: "Mrs. Thompson", r: "Parent", a: "MT2" },
  { q: "My parents never taught me about credit. FinOva filled that gap without making me feel dumb. I've recommended it to all my friends.", n: "Jake W.", r: "High School Junior", a: "JW" },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-6 text-left group">
        <span className="font-semibold text-foreground pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-6" : "max-h-0"}`}>
        <div className="pr-10">
          <p className="text-muted-foreground leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  /* Parallax on hero */
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link to="/" className="text-lg font-bold font-display gradient-text">FinOva</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#reviews" className="hover:text-foreground transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/auth"><Button size="sm" className="btn-cinema">Start Free</Button></Link>
          </div>
        </div>
      </header>

      {/* ══════════════════ HERO — FULL SCREEN CINEMATIC ══════════════════ */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="parallax-container absolute inset-0">
          <img src={img.hero} alt="" className="parallax-bg w-full h-full object-cover" style={{ transform: `translateY(${scrollY * 0.3}px)`, filter: "saturate(0.8) contrast(1.05)" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-0">
          <div className="max-w-2xl">
            <div className="cinema-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4" /> 100% free — no credit card needed
            </div>

            <h1 className="cinema-in cinema-delay-1 text-5xl md:text-7xl font-black font-display leading-[1.05] tracking-tight mb-6">
              Master your money.{" "}
              <span className="shimmer-text">Shape your future.</span>
            </h1>

            <p className="cinema-in cinema-delay-2 text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed mb-3">
              The gamified platform that teaches you budgeting, investing, credit, and taxes — through lessons, games, and real stock simulations.
            </p>

            <p className="cinema-in cinema-delay-2 text-sm text-muted-foreground/70 mb-8">
              Built by students. Trusted by educators. Used nationwide.
            </p>

            <div className="cinema-in cinema-delay-3 flex flex-wrap gap-4 mb-12">
              <Link to="/auth">
                <Button size="lg" className="btn-cinema text-base px-8 py-6 rounded-2xl font-bold">
                  Start Learning Free <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-2xl font-bold border-2">
                  <Play className="w-5 h-5 mr-2" /> Watch Demo
                </Button>
              </a>
            </div>

            {/* Mini stats */}
            <div className="cinema-in cinema-delay-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, val: "43", label: "Lessons" },
                { icon: Gamepad2, val: "8", label: "Games" },
                { icon: TrendingUp, val: "Live", label: "Paper Trading" },
                { icon: MessageCircle, val: "24/7", label: "AI Coach" },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-foreground">{val}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <a href="#stats" className="flex flex-col items-center text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </a>
        </div>
      </section>

      {/* ══════════════════ STATS STRIP ══════════════════ */}
      <S className="reveal">
        <section id="stats" className="py-16 border-y border-border bg-card/50 texture-dots">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center stagger">
            {[
              { value: "7", label: "Learning Modules", sub: "Expert-designed curriculum" },
              { value: "43", label: "Interactive Lessons", sub: "5–10 mins each" },
              { value: "8", label: "Financial Games", sub: "Real-world simulations" },
              { value: "100%", label: "Free Core Access", sub: "No credit card required" },
            ].map(({ value, label, sub }) => (
              <div key={label} className="reveal-scale">
                <p className="text-4xl md:text-5xl font-black font-display gradient-text mb-1">{value}</p>
                <p className="font-bold text-sm text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
        </section>
      </S>

      {/* ══════════════════ CURRICULUM GRID ══════════════════ */}
      <S className="reveal">
        <section className="py-24 px-6 texture-grid">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 reveal">
              <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">WHAT YOU'LL LEARN</p>
              <h2 className="text-3xl md:text-5xl font-black font-display mb-4">
                Every money skill you need.{" "}
                <span className="gradient-text">In one place.</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Our 7-module curriculum covers everything schools skip — from daily budgeting to long-term wealth building. Designed by financial professionals and educators.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
              {[
                { icon: Wallet, label: "Budgeting", desc: "Income, expenses, the 50/30/20 rule, and building a monthly plan that works" },
                { icon: PiggyBank, label: "Saving", desc: "Emergency funds, high-yield accounts, savings goals, and automating your finances" },
                { icon: TrendingUp, label: "Investing", desc: "Stocks, ETFs, index funds, compound growth, dollar-cost averaging, and portfolio basics" },
                { icon: BarChart3, label: "Credit", desc: "Credit scores, how cards work, building credit early, and avoiding debt traps" },
                { icon: Target, label: "Debt", desc: "Student loans, interest rates, avalanche vs. snowball methods, and payoff strategies" },
                { icon: Brain, label: "Taxes", desc: "W-2s, 1099s, filing basics, standard deductions, tax brackets, and getting refunds" },
                { icon: GraduationCap, label: "Student Finance", desc: "FAFSA, scholarships, grants, student loan terms, and work-study options" },
                { icon: Sparkles, label: "Wealth Building", desc: "Roth IRAs, 401(k)s, compound interest over decades, and achieving financial freedom" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="card-3d reveal-scale">
                  <div className="card-3d-inner rounded-2xl border border-border bg-card p-6 h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold font-display text-foreground mb-2">{label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </S>

      {/* ══════════════════ FEATURES — ALTERNATING FULL-BLEED ══════════════════ */}
      <div id="features">
        {features.map(({ headline, body, bullets, image, alt }, i) => (
          <S key={headline} className="reveal">
            <section className={`py-24 px-6 ${i % 2 === 0 ? "bg-background" : "bg-card/30 texture-dots"}`}>
              <div className={`max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center ${i % 2 === 1 ? "md:[direction:rtl] md:[&>*]:![direction:ltr]" : ""}`}>
                <div className={i % 2 === 0 ? "reveal-left" : "reveal-right"}>
                  <p className="text-primary font-bold text-xs tracking-widest uppercase mb-4">FEATURE {i + 1} OF {features.length}</p>
                  <h2 className="text-3xl md:text-4xl font-black font-display mb-4 text-foreground">{headline}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{body}</p>
                  <ul className="space-y-3 mb-8">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-3.5 h-3.5 text-primary" />
                        </span>
                        <span className="text-foreground">{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button variant="outline" className="rounded-xl font-bold">
                      Try it free <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                <div className={i % 2 === 1 ? "reveal-left" : "reveal-right"}>
                  <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
                    <img src={image} alt={alt} className="w-full h-auto" style={{ filter: "saturate(0.82) contrast(1.08)" }} loading="lazy" />
                  </div>
                </div>
              </div>
            </section>
          </S>
        ))}
      </div>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <S className="reveal">
        <section id="how-it-works" className="py-24 px-6 bg-card/50 texture-grid">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 reveal">
              <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">GET STARTED</p>
              <h2 className="text-3xl md:text-5xl font-black font-display mb-4 text-foreground">Three steps. Sixty seconds.</h2>
              <p className="text-muted-foreground">No downloads. No credit card. No catch.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 stagger">
              {[
                { step: "01", icon: Users, title: "Create your account", desc: "Sign up with email or Google. It takes about 10 seconds and you're in." },
                { step: "02", icon: Flame, title: "Take your first lesson", desc: "Jump into Module 1 or let our quick assessment find your starting point." },
                { step: "03", icon: Trophy, title: "Earn as you learn", desc: "Collect gems, badges, certificates, and climb the leaderboard as you level up." },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="reveal-scale text-center">
                  <p className="text-5xl font-black font-display gradient-text mb-4">{step}</p>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold font-display text-lg mb-2 text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12 reveal">
              <Link to="/auth">
                <Button size="lg" className="btn-cinema rounded-2xl font-bold px-10 py-6 text-base">
                  Start Learning Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </S>

      {/* ══════════════════ REVIEWS ══════════════════ */}
      <S className="reveal">
        <section id="reviews" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 reveal">
              <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">REVIEWS</p>
              <h2 className="text-3xl md:text-5xl font-black font-display mb-4">
                Loved by students, parents,{" "}
                <span className="gradient-text">and educators.</span>
              </h2>
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-duo-gold text-duo-gold" />)}
                </div>
                <span className="font-bold text-foreground">5.0</span>
                <span className="text-muted-foreground text-sm">from {reviews.length} reviews</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
              {reviews.map(({ q, n, r, a }) => (
                <div key={a} className="card-3d reveal-scale">
                  <div className="card-3d-inner rounded-2xl border border-border bg-card p-6 h-full flex flex-col">
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-duo-gold text-duo-gold" />)}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed flex-1 mb-4">"{q}"</p>
                    <div className="flex items-center gap-3 pt-3 border-t border-border">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{a.slice(0, 2)}</div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{n}</p>
                        <p className="text-xs text-muted-foreground">{r}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </S>

      {/* ══════════════════ PRICING ══════════════════ */}
      <S className="reveal">
        <section id="pricing" className="py-24 px-6 bg-card/30 texture-dots">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 reveal">
              <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">PRICING</p>
              <h2 className="text-3xl md:text-5xl font-black font-display mb-4 text-foreground">Free forever. Plus if you want more.</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Every core feature is free. FinOva Plus unlocks premium perks for power learners.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="reveal-left rounded-2xl border border-border bg-card p-8">
                <h3 className="text-xl font-bold font-display text-foreground">Free</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">Everything you need to get started</p>
                <p className="text-4xl font-black font-display text-foreground mb-6">$0 <span className="text-base font-normal text-muted-foreground">forever</span></p>
                <Link to="/auth">
                  <Button variant="outline" className="w-full rounded-xl font-bold mb-6">Get Started Free</Button>
                </Link>
                <ul className="space-y-3">
                  {["All 7 learning modules", "43 interactive lessons", "8 financial games", "Paper trading simulator", "AI money coach (limited)", "Earn gems & badges", "5 hearts per day", "Basic certificates"].map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="reveal-right rounded-2xl border-2 border-primary bg-card p-8 relative gradient-border glow-pulse">
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">MOST POPULAR</div>
                <h3 className="text-xl font-bold font-display">
                  <span className="gradient-text">FinOva Plus</span>
                </h3>
                <p className="text-muted-foreground text-sm mt-1 mb-4">For serious learners who want it all</p>
                <p className="text-4xl font-black font-display text-foreground mb-1">$10 <span className="text-base font-normal text-muted-foreground">/month</span></p>
                <p className="text-xs text-muted-foreground mb-6">Cancel anytime · No commitment</p>
                <Link to="/auth">
                  <Button size="lg" className="w-full btn-cinema rounded-xl font-bold mb-6">
                    Upgrade to Plus <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Everything in Free, plus:</p>
                <ul className="space-y-3">
                  {[
                    { i: Heart, t: "Unlimited hearts" }, { i: BookOpen, t: "All premium courses" },
                    { i: Zap, t: "1,000 bonus gems/month" }, { i: Shield, t: "3 streak freezes/month" },
                    { i: Star, t: "Exclusive badges & certs" }, { i: Crown, t: "Mistakes review mode" },
                    { i: Lock, t: "Unlimited AI coach" }, { i: Award, t: "Priority support" },
                  ].map(({ i: Icon, t }) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-foreground">
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </S>

      {/* ══════════════════ FFI ══════════════════ */}
      <S className="reveal">
        <section className="py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto reveal">
            <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">OUR PARTNER</p>
            <h2 className="text-3xl md:text-4xl font-black font-display mb-4 text-foreground">Financial Freedom Initiative</h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
              FFI is a student-led nonprofit bringing financial literacy to high schoolers nationwide through workshops, mentorship, and real-world education programs. FinOva is the digital extension of their mission.
            </p>
            <Link to="/financial-freedom-initiative">
              <Button variant="outline" className="rounded-xl font-bold">Learn about FFI <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </div>
        </section>
      </S>

      {/* ══════════════════ FAQ ══════════════════ */}
      <S className="reveal">
        <section className="py-24 px-6 bg-card/30 texture-grid">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 reveal">
              <p className="text-primary font-bold text-sm tracking-widest uppercase mb-3">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-black font-display text-foreground">Questions? Answers.</h2>
            </div>
            <div className="reveal">
              <FaqItem q="Is FinOva really free?" a="Yes! All 7 learning modules, 43 lessons, and 8 games are completely free. FinOva Plus is optional and adds extra perks like unlimited hearts and bonus gems." />
              <FaqItem q="Who is FinOva for?" a="Anyone who wants to learn personal finance — but especially high school and college students. Our content is designed to be approachable whether you're 15 or 50." />
              <FaqItem q="Can I use FinOva in my classroom?" a="Absolutely. Our curriculum is designed to work in classroom settings with progress tracking, quizzes, and certificates." />
              <FaqItem q="Is the paper trading feature safe?" a="100%. Paper trading uses virtual money with real market data. You can't lose real money — it's purely for practice and learning." />
              <FaqItem q="What's the Financial Freedom Initiative?" a="FFI is the student-led nonprofit behind FinOva. They run workshops, mentorship programs, and financial literacy events at high schools across the country." />
              <FaqItem q="How is FinOva different from other finance apps?" a="We combine gamified lessons, interactive simulations, paper trading, and an AI coach in one platform — designed specifically for young learners, not generic adults." />
            </div>
          </div>
        </section>
      </S>

      {/* ══════════════════ FINAL CTA — CINEMATIC ══════════════════ */}
      <S className="reveal">
        <section className="relative py-32 px-6 overflow-hidden">
          <div className="absolute inset-0">
            <img src={img.classroom} alt="" className="w-full h-full object-cover" style={{ filter: "saturate(0.7) contrast(1.1)" }} />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/85 to-foreground/80" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center reveal-scale">
            <h2 className="text-3xl md:text-5xl font-black font-display text-primary-foreground mb-6">
              Your future self will{" "}<span className="gradient-gold">thank you.</span>
            </h2>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Every financial skill you learn today saves you thousands tomorrow. Start your first lesson now — it takes 60 seconds.
            </p>
            <Link to="/auth">
              <Button size="lg" className="btn-cinema text-base px-10 py-7 rounded-2xl font-bold">
                Get Started — It's Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-primary-foreground/40 text-xs mt-6">No credit card · No spam · Cancel anytime</p>
          </div>
        </section>
      </S>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="border-t border-border bg-card/30 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <span className="text-lg font-bold font-display gradient-text">FinOva</span>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                The gamified financial literacy platform built for the next generation.
              </p>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm mb-4 text-foreground">Platform</h4>
              <div className="space-y-2.5 text-sm text-muted-foreground">
                <Link to="/courses-preview" className="block hover:text-foreground transition-colors">Courses</Link>
                <Link to="/resources" className="block hover:text-foreground transition-colors">Resources</Link>
                <Link to="/plus" className="block hover:text-foreground transition-colors">FinOva Plus</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-sm mb-4 text-foreground">Company</h4>
              <div className="space-y-2.5 text-sm text-muted-foreground">
                <Link to="/about" className="block hover:text-foreground transition-colors">About Us</Link>
                <Link to="/financial-freedom-initiative" className="block hover:text-foreground transition-colors">FFI Partnership</Link>
                <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Disclaimers</Link>
                <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Terms of Use</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} FinOva. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
