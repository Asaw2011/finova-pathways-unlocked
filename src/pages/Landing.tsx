import { Link } from "react-router-dom";
import {
  ArrowRight, Heart, BookOpen, Zap, Shield, Star, Crown,
  TrendingUp, Users, Award, CheckCircle,
  BarChart3, Wallet, PiggyBank, GraduationCap, Gamepad2, Brain, Target, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroIllustration from "@/assets/hero-illustration.png";
import featureLessons from "@/assets/feature-lessons.png";
import featureGames from "@/assets/feature-games.png";
import featureCoach from "@/assets/feature-coach.png";
import featureTrading from "@/assets/feature-trading.png";
import featureRewards from "@/assets/feature-rewards.png";

const featureSections = [
  {
    headline: "learn by doing",
    body: "Quick, interactive lessons that teach real financial skills — not boring textbook stuff. Each lesson takes 5–10 minutes and builds on what you already know.",
    bullets: ["43 bite-sized lessons across 7 modules", "Quizzes after every lesson to lock in knowledge", "Earn XP and gems as you progress"],
    image: featureLessons,
    alt: "Person reading a money book",
  },
  {
    headline: "play money games",
    body: "Build budgets, dodge subscription traps, and grow your credit score — all through games that mirror real-life financial decisions.",
    bullets: ["8 interactive simulations", "Practice without real-world consequences", "Compete with friends for high scores"],
    image: featureGames,
    alt: "Person playing financial games",
  },
  {
    headline: "get smart advice",
    body: "Your personal AI money coach answers questions and guides your learning journey with tailored recommendations.",
    bullets: ["Ask anything about personal finance", "Get personalized study plans", "Available 24/7 whenever you need help"],
    image: featureCoach,
    alt: "AI money coach robot",
  },
  {
    headline: "practice investing",
    body: "Trade real stocks with virtual money. Zero risk, real experience. Build the confidence to invest before you put actual dollars on the line.",
    bullets: ["Paper trading with live market data", "Track your virtual portfolio performance", "Learn technical analysis fundamentals"],
    image: featureTrading,
    alt: "Person with stock chart",
  },
  {
    headline: "stay motivated",
    body: "Earn gems, badges, and certificates. Compete with friends on the leaderboard and track your streak to stay consistent.",
    bullets: ["Daily challenges and quests", "Certificates you can share with colleges", "Leaderboard rankings among peers"],
    image: featureRewards,
    alt: "Person celebrating with trophies",
  },
];

const testimonials = [
  {
    quote: "FinOva completely changed how I think about money. I went from spending every dollar I earned to actually having a savings plan. This app should be required in every school.",
    name: "Aaliyah R.",
    role: "High School Senior",
    avatar: "AR",
  },
  {
    quote: "The paper trading feature is incredible. I've been practicing for 3 months and my virtual portfolio is up 14%. I feel way more prepared to invest real money now. Best finance app I've ever used.",
    name: "Marcus T.",
    role: "College Sophomore",
    avatar: "MT",
  },
  {
    quote: "I brought FinOva into my classroom and engagement went through the roof. Students actually ASK to do their financial literacy assignments now. I've never seen anything like it in 12 years of teaching.",
    name: "Ms. Patel",
    role: "High School Economics Teacher",
    avatar: "MP",
  },
  {
    quote: "My parents never taught me about credit scores or taxes. FinOva filled that gap without making me feel dumb for not knowing. I've already recommended it to all my friends.",
    name: "Jake W.",
    role: "High School Junior",
    avatar: "JW",
  },
  {
    quote: "I tried so many apps and YouTube channels to learn about investing but nothing stuck. FinOva's games and quizzes made everything click. I'm obsessed — I log in every single day to keep my streak going.",
    name: "Sofia L.",
    role: "College Freshman",
    avatar: "SL",
  },
  {
    quote: "As a first-generation college student, nobody in my family knew how to help me with FAFSA or student loans. The Student Finance module literally saved me thousands of dollars. I can't recommend this enough.",
    name: "Daniel O.",
    role: "High School Senior",
    avatar: "DO",
  },
  {
    quote: "I showed FinOva to my school principal and we're now rolling it out to every 10th grader next semester. The curriculum is solid, the games keep kids engaged, and the certificates give them something to show for it.",
    name: "Mr. Richardson",
    role: "Financial Literacy Teacher",
    avatar: "MR",
  },
  {
    quote: "I used to think budgeting was boring and investing was only for rich people. FinOva proved me wrong on both. I've already started a Roth IRA at 17 because of what I learned here. Life-changing app.",
    name: "Jasmine K.",
    role: "High School Junior",
    avatar: "JK",
  },
  {
    quote: "What sets FinOva apart is how fun it makes learning. The credit score game alone taught me more than an entire semester of personal finance class. Five stars isn't enough — this deserves ten.",
    name: "Chris M.",
    role: "College Junior",
    avatar: "CM",
  },
  {
    quote: "My daughter uses FinOva every day and actually talks to me about compound interest at dinner now. As a parent, I couldn't be happier. This is the financial education I wish I had growing up.",
    name: "Mrs. Thompson",
    role: "Parent",
    avatar: "MT",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col texture-dots">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <span className="text-lg font-bold font-display">
            <span className="gradient-text">FinOva</span>
          </span>
          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" size="sm" className="font-semibold">Log in</Button></Link>
            <Link to="/auth"><Button size="sm" className="font-semibold">Get Started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex items-center justify-center px-6 py-16 md:py-24 texture-noise">
        <div className="max-w-2xl w-full text-center">
          <div className="relative inline-block mb-8">
            <img src={heroIllustration} alt="People learning about money" className="w-40 md:w-52 h-auto mx-auto" style={{ filter: "saturate(0.82) contrast(1.08)" }} />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-foreground/5 rounded-full blur-md" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-tight mb-4">
            The free, fun way to <span className="gradient-text">master money</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-2 max-w-md mx-auto font-medium">
            Financial literacy for everyone. Gamified.
          </p>
          <p className="text-sm text-muted-foreground/70 mb-8 max-w-lg mx-auto">
            Join students across the country learning to budget, invest, build credit, and make smarter financial decisions — one lesson at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <Link to="/auth" className="flex-1">
              <Button size="lg" className="w-full font-bold glow-primary rounded-xl">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/auth" className="flex-1">
              <Button size="lg" variant="outline" className="w-full font-bold rounded-xl">I have an account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-10 bg-card border-y border-border/40 texture-grid">
        <div className="max-w-4xl mx-auto flex justify-center gap-10 md:gap-16 text-center flex-wrap">
          <div>
            <p className="text-3xl font-extrabold font-display text-primary">7</p>
            <p className="text-sm text-muted-foreground font-medium">Learning Modules</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-display text-primary">43</p>
            <p className="text-sm text-muted-foreground font-medium">Lessons</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-display text-primary">8</p>
            <p className="text-sm text-muted-foreground font-medium">Interactive Games</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold font-display text-primary">100%</p>
            <p className="text-sm text-muted-foreground font-medium">Free Core Access</p>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="px-6 py-16 md:py-20 bg-background texture-dots">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold font-display mb-3">
              Real skills. Real confidence. Real results.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our curriculum covers every money skill schools don't teach — designed by financial professionals and educators.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: Wallet, label: "Budgeting", desc: "Track income vs. expenses" },
              { icon: PiggyBank, label: "Saving", desc: "Emergency funds & goals" },
              { icon: TrendingUp, label: "Investing", desc: "Stocks, ETFs, compound growth" },
              { icon: BarChart3, label: "Credit", desc: "Scores, cards, and building credit" },
              { icon: Target, label: "Debt", desc: "Payoff strategies that work" },
              { icon: Brain, label: "Taxes", desc: "Filing, deductions, W-2s" },
              { icon: GraduationCap, label: "Student Finance", desc: "Loans, FAFSA, scholarships" },
              { icon: Sparkles, label: "Wealth Building", desc: "Long-term financial freedom" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-card rounded-xl border border-border/60 p-4 text-center hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-bold font-display text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature sections */}
      {featureSections.map(({ headline, body, bullets, image, alt }, i) => (
        <section key={headline} className={`px-6 py-16 md:py-24 ${i % 2 === 0 ? "bg-background texture-dots" : "bg-card texture-grid"}`}>
          <div className={`max-w-5xl mx-auto flex flex-col items-center gap-8 md:gap-16 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-display lowercase gradient-text mb-4">{headline}</h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto md:mx-0 mb-4">{body}</p>
              <ul className="space-y-2 max-w-md mx-auto md:mx-0">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0">
              <div className="relative">
                <img src={image} alt={alt} className="w-48 md:w-56 lg:w-64 h-auto" style={{ filter: "saturate(0.82) contrast(1.08)" }} />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-foreground/5 rounded-full blur-md" />
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* How It Works */}
      <section className="px-6 py-16 md:py-20 bg-background texture-noise">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display mb-2">How FinOva Works</h2>
          <p className="text-muted-foreground mb-10">Three simple steps to financial confidence.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Create your free account", desc: "Sign up in seconds. No credit card required. Start learning immediately." },
              { step: "2", title: "Follow your learning path", desc: "Work through 7 modules covering every money skill you need — at your own pace." },
              { step: "3", title: "Earn rewards as you go", desc: "Collect gems, badges, and certificates you can share with colleges and employers." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-extrabold text-lg flex items-center justify-center mx-auto mb-3">
                  {step}
                </div>
                <h3 className="font-bold font-display mb-1 text-base">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/auth">
              <Button size="lg" className="font-bold glow-primary rounded-xl">
                Start Your Journey <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16 md:py-20 bg-card texture-grid">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">REVIEWS</p>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display mb-2">
              Rated 5 stars by students, parents, and teachers
            </h2>
            <p className="text-muted-foreground">Don't take our word for it — hear from the people using it.</p>

            {/* Rating summary */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-extrabold font-display text-lg">5.0</span>
              <span className="text-sm text-muted-foreground">from {testimonials.length} reviews</span>
            </div>
          </div>

          {/* First row — 3 featured reviews */}
          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            {testimonials.slice(0, 3).map(({ quote, name, role, avatar }) => (
              <div key={name} className="bg-background rounded-2xl border border-border/60 p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Remaining reviews in 2-column grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {testimonials.slice(3).map(({ quote, name, role, avatar }) => (
              <div key={name} className="bg-background rounded-2xl border border-border/60 p-5">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Plus banner */}
      <section className="px-6 py-16 md:py-20 bg-card texture-grid">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-white mb-4">PLUS</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display mb-2">
              Upgrade to <span className="gradient-gold">FinOva Plus</span>
            </h2>
            <p className="text-muted-foreground mb-2">Everything you need to master money — no limits.</p>
            <p className="text-4xl md:text-5xl font-extrabold font-display gradient-gold mt-4">
              $10<span className="text-lg font-semibold text-muted-foreground">/month</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto mb-8">
            {[
              { icon: Heart, label: "Unlimited hearts", desc: "Never stop learning" },
              { icon: BookOpen, label: "All premium courses", desc: "6 core + AI-generated" },
              { icon: Zap, label: "1,000 gems/month", desc: "Bonus monthly gems" },
              { icon: Shield, label: "3 streak freezes/mo", desc: "Protect your progress" },
              { icon: Star, label: "Exclusive badges", desc: "Stand out on leaderboards" },
              { icon: Crown, label: "Special Review", desc: "Learn from your mistakes" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 md:p-4 rounded-xl bg-background border border-border/60">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold font-display text-xs md:text-sm leading-tight">{label}</p>
                  <p className="text-muted-foreground text-[10px] md:text-xs leading-tight mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/plus">
              <Button size="lg" className="font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 shadow-lg">
                Get FinOva Plus — $10/mo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Cancel anytime · No commitment</p>
          </div>
        </div>
      </section>

      {/* FFI Partnership */}
      <section className="px-6 py-14 md:py-16 bg-background">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Built In Partnership With</p>
          <h3 className="text-xl font-extrabold font-display mb-2">Financial Freedom Initiative</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
            A student-led financial literacy organization reaching high schoolers nationwide with workshops, mentorship, and real-world financial education.
          </p>
          <Link to="/financial-freedom-initiative">
            <Button variant="outline" size="sm" className="rounded-xl font-bold">
              Learn about FFI →
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 md:py-20 bg-card texture-grid">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is FinOva really free?",
                a: "Yes! All 7 learning modules, 43 lessons, and 8 games are completely free. FinOva Plus is optional and adds extra perks like unlimited hearts and bonus gems.",
              },
              {
                q: "Who is FinOva for?",
                a: "Anyone who wants to learn personal finance — but especially high school and college students. Our content is designed to be approachable whether you're 15 or 50.",
              },
              {
                q: "Can I use FinOva in my classroom?",
                a: "Absolutely. FinOva gives teachers a turnkey curriculum with progress tracking, quizzes, and certificates that students can earn.",
              },
              {
                q: "Is the paper trading feature safe?",
                a: "100%. Paper trading uses virtual money with real market data. You can't lose real money — it's purely for practice and learning.",
              },
              {
                q: "What's the Financial Freedom Initiative?",
                a: "FFI is the student-led nonprofit behind FinOva. They run workshops, mentorship programs, and financial literacy events at high schools across the country.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-background rounded-xl border border-border/60 p-5">
                <h3 className="font-bold font-display text-sm mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-16 md:py-20 bg-background texture-noise">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display mb-3">Ready to take control of your money?</h2>
          <p className="text-muted-foreground mb-8">
            It takes less than 30 seconds to sign up. Start your first lesson today.
          </p>
          <Link to="/auth">
            <Button size="lg" className="font-bold glow-primary rounded-xl px-8">
              Get Started — it's free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div>
              <p className="font-bold font-display gradient-text mb-2">FinOva</p>
              <p className="text-sm text-muted-foreground">
                The gamified financial literacy platform built for the next generation.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3 text-sm">Platform</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/courses-preview" className="block hover:text-foreground transition-colors">Courses</Link>
                <Link to="/resources" className="block hover:text-foreground transition-colors">Resources</Link>
                <Link to="/plus" className="block hover:text-foreground transition-colors">FinOva Plus</Link>
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3 text-sm">Company</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/about" className="block hover:text-foreground transition-colors">About</Link>
                <Link to="/financial-freedom-initiative" className="block hover:text-foreground transition-colors">FFI</Link>
                <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Disclaimers</Link>
                <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Terms of Use</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} FinOva. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
