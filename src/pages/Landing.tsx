import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Heart, BookOpen, Zap, Shield, Star,
  Crown, TrendingUp, Users, CheckCircle, ChevronDown,
  BarChart3, Wallet, PiggyBank, GraduationCap, Gamepad2, Brain, Target,
  Sparkles, Play, Lock, MessageCircle, Trophy, Flame, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const useReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const cls = ".reveal, .reveal-scale, .reveal-left, .reveal-right, .reveal-flip, .reveal-zoom, .reveal-rotate-left, .reveal-rotate-right, .reveal-bounce, .reveal-blur, .shine-on-scroll";
            e.target.querySelectorAll(cls).forEach((t) => t.classList.add("is-visible"));
            const selfClasses = ["reveal","reveal-scale","reveal-left","reveal-right","reveal-flip","reveal-zoom","reveal-rotate-left","reveal-rotate-right","reveal-bounce","reveal-blur","shine-on-scroll"];
            if (selfClasses.some(c => e.target.classList.contains(c))) { e.target.classList.add("is-visible"); }
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

const S = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useReveal();
  return <div ref={ref} className={className} id={id}>{children}</div>;
};

const img = {
  hero: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&h=800&fit=crop&q=80",
  lessons: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=600&fit=crop&q=80",
  games: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop&q=80",
  coach: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&q=80",
  trading: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&q=80",
  rewards: "https://images.unsplash.com/photo-1627556704302-624286467c65?w=800&h=600&fit=crop&q=80",
  classroom: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=600&fit=crop&q=80",
};

const features = [
  { headline: "Bite-sized lessons that actually stick", body: "Each lesson takes just 5\u201310 minutes. No jargon, no fluff \u2014 just clear explanations with real-world examples that build on what you already know.", bullets: ["80+ lessons across 10 expert-designed modules", "4 quiz questions after every lesson to test comprehension", "Pick up right where you left off"], image: img.lessons, alt: "Student writing notes while studying financial concepts" },
  { headline: "Learn through games, not lectures", body: "Build a monthly budget, dodge subscription traps, grow a virtual credit score \u2014 our simulations put you in real financial situations with zero real-world risk.", bullets: ["8 interactive financial simulations", "Realistic scenarios based on actual life events", "Compete with friends for top scores"], image: img.games, alt: "Friends playing an interactive learning game together" },
  { headline: "Your personal money coach", body: "Stuck on a concept? Ask your AI-powered coach anything about personal finance. It adapts to your learning level and gives answers you can actually understand.", bullets: ["Ask any money question, anytime", "Personalized recommendations for your level", "No judgement \u2014 just helpful guidance"], image: img.coach, alt: "Person using a financial planning app for guidance" },
  { headline: "Practice investing risk-free", body: "Our paper trading simulator uses live market data so you can buy and sell real stocks with fake money. Build confidence before you invest a single dollar.", bullets: ["Live stock prices, zero real risk", "Track your virtual portfolio over time", "Learn to read charts and spot trends"], image: img.trading, alt: "Phone showing stock market chart and financial data" },
  { headline: "Earn rewards that matter", body: "Stay motivated with gems, streaks, badges, and shareable certificates. Show colleges and employers you\u2019ve mastered real financial skills.", bullets: ["Daily streaks and weekly challenges", "Certificates recognized by educators", "Leaderboard to compete with peers"], image: img.rewards, alt: "Graduate celebrating an achievement milestone" },
];

const reviews = [
  { q: "Monucate completely changed how I think about money. I went from spending every dollar to actually having a savings plan. This app should be required in every school.", n: "Aaliyah R.", r: "High School Senior", a: "AR" },
  { q: "The paper trading feature is incredible. My virtual portfolio is up 14% in 3 months. I feel way more prepared to invest real money now.", n: "Marcus T.", r: "College Sophomore", a: "MT" },
  { q: "Students actually ASK to do their financial literacy assignments now. I\u2019ve never seen anything like it in 12 years of teaching.", n: "Ms. Patel", r: "Economics Teacher", a: "MP" },
  { q: "Nobody in my family knew how to help with FAFSA. The Student Finance module literally saved me thousands of dollars.", n: "Daniel O.", r: "High School Senior", a: "DO" },
  { q: "I\u2019m obsessed \u2014 I log in every single day to keep my streak going. Monucate\u2019s games made everything click.", n: "Sofia L.", r: "College Freshman", a: "SL" },
  { q: "I\u2019ve already started a Roth IRA at 17 because of what I learned here. Life-changing app.", n: "Jasmine K.", r: "High School Junior", a: "JK" },
  { q: "We\u2019re rolling it out to every 10th grader next semester. The curriculum is solid and the certificates give students something to show.", n: "Mr. Richardson", r: "Financial Literacy Teacher", a: "MR" },
  { q: "The credit score game taught me more than an entire semester of personal finance class. Five stars isn\u2019t enough.", n: "Chris M.", r: "College Junior", a: "CM" },
  { q: "My daughter talks to me about compound interest at dinner now. This is the financial education I wish I had growing up.", n: "Mrs. Thompson", r: "Parent", a: "MT2" },
  { q: "My parents never taught me about credit. Monucate filled that gap without making me feel dumb. I\u2019ve recommended it to all my friends.", n: "Jake W.", r: "High School Junior", a: "JW" },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-6 text-left group">
        <span className="text-base font-semibold pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-6" : "max-h-0"}`}>
        <p className="text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </div>
  );
};

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Monu<span className="text-primary">c</span>ate</Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#reviews" className="hover:text-foreground transition-colors">Reviews</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/auth"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Start Free</Button></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 z-0">
          <img src={img.hero} alt="" className="w-full h-full object-cover" style={{ filter: "saturate(0.82) contrast(1.08)" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="cinema-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4" /> 100% free &mdash; no credit card needed
            </div>
            <h1 className="cinema-in cinema-delay-1 text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6" style={{ fontFamily: "var(--font-display)" }}>
              Master your money.{" "}<span className="gradient-text">Shape your future.</span>
            </h1>
            <p className="cinema-in cinema-delay-2 text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 max-w-xl">
              The gamified platform that teaches you budgeting, investing, credit, and taxes &mdash; through lessons, games, and real stock simulations.
            </p>
            <p className="cinema-in cinema-delay-2 text-sm text-muted-foreground font-medium mb-8">Built by students. Trusted by educators. Used nationwide.</p>
            <div className="cinema-in cinema-delay-3 flex flex-wrap gap-4 mb-12">
              <Link to="/auth"><Button size="lg" className="btn-cinema bg-primary text-primary-foreground text-base px-8 py-6 rounded-2xl font-bold">Start Learning Free <ArrowRight className="ml-2 w-5 h-5" /></Button></Link>
              <a href="#features"><Button size="lg" variant="outline" className="text-base px-8 py-6 rounded-2xl font-bold"><Play className="mr-2 w-5 h-5" /> Watch Demo</Button></a>
            </div>
            <div className="cinema-in cinema-delay-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{ icon: BookOpen, val: "80+", label: "Lessons" },{ icon: Gamepad2, val: "8", label: "Games" },{ icon: TrendingUp, val: "Live", label: "Paper Trading" },{ icon: MessageCircle, val: "24/7", label: "AI Coach" }].map(({ icon: Icon, val, label }, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50">
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  <div><p className="text-sm font-bold">{val}</p><p className="text-xs text-muted-foreground">{label}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <a href="#stats" className="animate-bounce block"><ChevronDown className="w-8 h-8 text-muted-foreground" /></a>
        </div>
      </section>

      {/* STATS */}
      <S className="py-16 bg-card border-y border-border texture-dots" id="stats">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center stagger">
          {[{ value: "10", label: "Learning Modules", sub: "Expert-designed curriculum" },{ value: "80+", label: "Interactive Lessons", sub: "5\u201310 mins each" },{ value: "8", label: "Financial Games", sub: "Real-world simulations" },{ value: "100%", label: "Free Core Access", sub: "No credit card required" }].map(({ value, label, sub }) => (
            <div key={label} className="reveal space-y-1">
              <p className="text-3xl md:text-4xl font-black gradient-text" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
      </S>

      {/* CURRICULUM */}
      <S className="py-24 px-6 texture-grid">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-bold text-primary tracking-widest uppercase mb-3">WHAT YOU&apos;LL LEARN</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ fontFamily: "var(--font-display)" }}>Every money skill you need.{" "}<span className="gradient-text">In one place.</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our 10-module curriculum covers everything schools skip &mdash; from daily budgeting to taxes, student loans, scam protection, and long-term wealth building. Designed by financial professionals and educators.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger">
            {[{ icon: Wallet, label: "Budgeting", desc: "Income, expenses, the 50/30/20 rule, and building a plan" },{ icon: PiggyBank, label: "Saving", desc: "Emergency funds, high-yield accounts, and automation" },{ icon: TrendingUp, label: "Investing", desc: "Stocks, ETFs, index funds, and compound growth" },{ icon: BarChart3, label: "Credit & Debt", desc: "Credit scores, cards, building credit, and debt traps" },{ icon: Brain, label: "Taxes", desc: "W-2s, filing, deductions, brackets, and refunds" },{ icon: Sparkles, label: "Wealth Building", desc: "Net worth, multiple income streams, and FIRE" },{ icon: GraduationCap, label: "Student Life", desc: "First job, student loans, renting, and side hustles" },{ icon: Shield, label: "Money Protection", desc: "Scams, identity theft, insurance, and fine print" },{ icon: Target, label: "Financial Freedom", desc: "4% rule, retirement accounts, and action plans" },{ icon: Crown, label: "Money Basics", desc: "What money is, needs vs wants, and time value" }].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="reveal card-3d">
                <div className="card-3d-inner p-5 rounded-2xl bg-card border border-border h-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3"><Icon className="w-5 h-5 text-primary" /></div>
                  <p className="font-bold text-sm mb-1">{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </S>

      {/* FEATURES */}
      <div id="features" className="py-24 space-y-32 px-6">
        {features.map(({ headline, body, bullets, image, alt }, i) => {
          const textAnim = ["reveal-rotate-left", "reveal-rotate-right", "reveal-flip", "reveal-rotate-left", "reveal-bounce"][i];
          const imgAnim = ["reveal-zoom", "reveal-flip", "reveal-rotate-right", "reveal-blur", "reveal-zoom"][i];
          return (
            <S key={i} className="max-w-6xl mx-auto">
              <div className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:[direction:rtl] md:*:[direction:ltr]" : ""}`}>
                <div className={textAnim}>
                  <p className="text-sm font-bold text-primary tracking-widest uppercase mb-3">FEATURE {i + 1} OF {features.length}</p>
                  <h3 className="text-2xl md:text-4xl font-black mb-4" style={{ fontFamily: "var(--font-display)" }}>{headline}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{body}</p>
                  <ul className="space-y-3 mb-8">{bullets.map((b) => (<li key={b} className="flex items-start gap-3 text-sm"><div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0"><CheckCircle className="w-3 h-3 text-primary" /></div>{b}</li>))}</ul>
                  <Link to="/auth"><Button className="btn-cinema bg-primary text-primary-foreground rounded-xl font-bold">Try it free <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
                </div>
                <div className={imgAnim}>
                  <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
                    <img src={image} alt={alt} className="w-full h-auto object-cover" loading="lazy" style={{ filter: "saturate(0.82) contrast(1.08)" }} />
                  </div>
                </div>
              </div>
            </S>
          );
        })}
      </div>

      {/* HOW IT WORKS */}
      <S className="py-24 px-6 bg-card border-y border-border texture-dots" id="how-it-works">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-bold text-primary tracking-widest uppercase mb-3">GET STARTED</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ fontFamily: "var(--font-display)" }}>Three steps. Sixty seconds.</h2>
            <p className="text-muted-foreground">No downloads. No credit card. No catch.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 stagger">
            {[{ step: "01", icon: Users, title: "Create your account", desc: "Sign up with email or Google. It takes about 10 seconds and you\u2019re in." },{ step: "02", icon: Flame, title: "Take your first lesson", desc: "Jump into Module 1 or let our quick assessment find your starting point." },{ step: "03", icon: Trophy, title: "Earn as you learn", desc: "Collect gems, badges, certificates, and climb the leaderboard as you level up." }].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="reveal text-center">
                <p className="text-5xl font-black text-primary/20 mb-2" style={{ fontFamily: "var(--font-display)" }}>{step}</p>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Icon className="w-7 h-7 text-primary" /></div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12 reveal">
            <Link to="/auth"><Button size="lg" className="btn-cinema bg-primary text-primary-foreground rounded-2xl font-bold px-8 py-6 text-base">Start Learning Now <ArrowRight className="ml-2 w-5 h-5" /></Button></Link>
          </div>
        </div>
      </S>

      {/* REVIEWS */}
      <S className="py-24 px-6" id="reviews">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-bold text-primary tracking-widest uppercase mb-3">REVIEWS</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ fontFamily: "var(--font-display)" }}>Loved by students, parents,{" "}<span className="gradient-text">and educators.</span></h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-[hsl(var(--duo-gold))] text-[hsl(var(--duo-gold))]" />)}</div>
              <span className="font-bold text-lg">5.0</span>
              <span className="text-sm text-muted-foreground">from {reviews.length} reviews</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {reviews.map(({ q, n, r, a }) => (
              <div key={a} className="reveal card-3d">
                <div className="card-3d-inner p-6 rounded-2xl bg-card border border-border h-full flex flex-col">
                  <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[hsl(var(--duo-gold))] text-[hsl(var(--duo-gold))]" />)}</div>
                  <p className="text-sm leading-relaxed flex-1 mb-4">&ldquo;{q}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{a.slice(0, 2)}</div>
                    <div>
                      <p className="text-sm font-bold">{n}</p>
                      <p className="text-xs text-muted-foreground">{r}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </S>

      {/* PRICING */}
      <S className="py-24 px-6 bg-card border-y border-border texture-grid" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-sm font-bold text-primary tracking-widest uppercase mb-3">PRICING</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ fontFamily: "var(--font-display)" }}>Free forever. Plus if you want more.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every core feature is free. Monucate Plus unlocks premium perks for power learners.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="reveal p-8 rounded-3xl bg-background border border-border">
              <h3 className="text-2xl font-black mb-1" style={{ fontFamily: "var(--font-display)" }}>Free</h3>
              <p className="text-muted-foreground text-sm mb-4">Everything you need to get started</p>
              <p className="text-4xl font-black mb-6" style={{ fontFamily: "var(--font-display)" }}>$0 <span className="text-base font-normal text-muted-foreground">forever</span></p>
              <Link to="/auth"><Button className="w-full rounded-xl font-bold mb-6" variant="outline">Get Started Free</Button></Link>
              <ul className="space-y-3">{["All 10 learning modules", "80+ interactive lessons", "8 financial games", "Paper trading simulator", "AI money coach (limited)", "Earn gems & badges", "5 hearts per day", "Basic certificates"].map((t) => (<li key={t} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-primary shrink-0" />{t}</li>))}</ul>
            </div>
            <div className="reveal gradient-border p-8 rounded-3xl bg-background">
              <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">MOST POPULAR</div>
              <h3 className="text-2xl font-black mb-1" style={{ fontFamily: "var(--font-display)" }}>Monucate <span className="gradient-text">Plus</span></h3>
              <p className="text-muted-foreground text-sm mb-4">For serious learners who want it all</p>
              <p className="text-4xl font-black mb-1" style={{ fontFamily: "var(--font-display)" }}>$10 <span className="text-base font-normal text-muted-foreground">/month</span></p>
              <p className="text-xs text-muted-foreground mb-6">Cancel anytime &middot; No commitment</p>
              <Link to="/plus"><Button className="w-full btn-cinema bg-primary text-primary-foreground rounded-xl font-bold mb-6">Upgrade to Plus <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Everything in Free, plus:</p>
              <ul className="space-y-3">{[{ i: Heart, t: "Unlimited hearts" },{ i: BookOpen, t: "All premium courses" },{ i: Zap, t: "1,000 bonus gems/month" },{ i: Shield, t: "3 streak freezes/month" },{ i: Star, t: "Exclusive badges & certs" },{ i: Crown, t: "Mistakes review mode" },{ i: Lock, t: "Unlimited AI coach" },{ i: Award, t: "Priority support" }].map(({ i: Icon, t }) => (<li key={t} className="flex items-center gap-2 text-sm"><Icon className="w-4 h-4 text-primary shrink-0" />{t}</li>))}</ul>
            </div>
          </div>
        </div>
      </S>

      {/* FFI */}
      <S className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center reveal">
          <p className="text-sm font-bold text-primary tracking-widest uppercase mb-3">OUR PARTNER</p>
          <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ fontFamily: "var(--font-display)" }}>Financial Freedom Initiative</h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">FFI is a student-led nonprofit bringing financial literacy to high schoolers nationwide through workshops, mentorship, and real-world education programs. Monucate is the digital extension of their mission.</p>
          <Link to="/financial-freedom-initiative"><Button variant="outline" className="rounded-xl font-bold">Learn about FFI <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
        </div>
      </S>

      {/* FAQ */}
      <S className="py-24 px-6 bg-card border-y border-border" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="text-sm font-bold text-primary tracking-widest uppercase mb-3">FAQ</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "var(--font-display)" }}>Questions? Answers.</h2>
          </div>
          <div className="reveal">
            <FaqItem q="Is Monucate really free?" a="Yes! All 10 learning modules, 80+ lessons, and 8 games are completely free. Monucate Plus is optional and adds extra perks like unlimited hearts and bonus gems." />
            <FaqItem q="Who is Monucate for?" a="Anyone who wants to learn personal finance — but especially high school and college students. Our content is designed to be approachable whether you're 15 or 50." />
            <FaqItem q="Can I use Monucate in my classroom?" a="Absolutely. Our platform gives teachers a complete financial literacy curriculum with progress tracking, quizzes, and certificates." />
            <FaqItem q="Is the paper trading feature safe?" a="100%. Paper trading uses virtual money with real market data. You can't lose real money — it's purely for practice and learning." />
            <FaqItem q="What's the Financial Freedom Initiative?" a="FFI is the student-led nonprofit behind Monucate. They run workshops, mentorship programs, and financial literacy events at high schools across the country." />
            <FaqItem q="How do I cancel Monucate Plus?" a="You can cancel anytime from your account settings. There are no contracts, hidden fees, or cancellation penalties." />
          </div>
        </div>
      </S>

      {/* FINAL CTA */}
      <S className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={img.classroom} alt="" className="w-full h-full object-cover" style={{ filter: "saturate(0.82) contrast(1.08)" }} />
          <div className="absolute inset-0 bg-background/90" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center reveal">
          <h2 className="text-3xl md:text-5xl font-black mb-6" style={{ fontFamily: "var(--font-display)" }}>Your future self will{" "}<span className="gradient-text">thank you.</span></h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">Every financial skill you learn today saves you thousands tomorrow. Start your first lesson now &mdash; it takes 60 seconds.</p>
          <Link to="/auth"><Button size="lg" className="btn-cinema bg-primary text-primary-foreground rounded-2xl font-bold px-10 py-6 text-lg">Get Started &mdash; It&apos;s Free <ArrowRight className="ml-2 w-5 h-5" /></Button></Link>
          <p className="text-xs text-muted-foreground mt-6">No credit card &middot; No spam &middot; Cancel anytime</p>
        </div>
      </S>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-lg font-black mb-3" style={{ fontFamily: "var(--font-display)" }}>Monu<span className="text-primary">c</span>ate</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">The gamified financial literacy platform built for the next generation.</p>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-3">Platform</h5>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/courses-preview" className="block hover:text-foreground transition-colors">Courses</Link>
                <Link to="/resources" className="block hover:text-foreground transition-colors">Resources</Link>
                <Link to="/plus" className="block hover:text-foreground transition-colors">Monucate Plus</Link>
                <Link to="/auth" className="block hover:text-foreground transition-colors">Sign Up Free</Link>
              </div>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-3">Company</h5>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/about" className="block hover:text-foreground transition-colors">About Us</Link>
                <Link to="/financial-freedom-initiative" className="block hover:text-foreground transition-colors">FFI Partnership</Link>
                <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Disclaimers</Link>
                <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Terms of Use</Link>
              </div>
            </div>
            <div>
              <h5 className="font-bold text-sm mb-3">For Students</h5>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/auth" className="block hover:text-foreground transition-colors">Get Started</Link>
                <Link to="/courses-preview" className="block hover:text-foreground transition-colors">Preview Courses</Link>
                <a href="#pricing" className="block hover:text-foreground transition-colors">See Pricing</a>
                <a href="#reviews" className="block hover:text-foreground transition-colors">Read Reviews</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Monucate. All rights reserved.</p>
            <p className="text-xs text-muted-foreground mt-1">Built in partnership with the Financial Freedom Initiative.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
