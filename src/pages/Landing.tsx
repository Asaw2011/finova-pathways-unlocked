import { Link } from "react-router-dom";
import { TrendingUp, BookOpen, Gamepad2, Award, Shield, Users, ChevronRight, Play, Lock, Sparkles, GraduationCap, Building2, BarChart3, Star, ArrowRight, Instagram, ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

const features = [
  { icon: BookOpen, title: "Expert-Created Courses", desc: "9+ modular courses from budgeting basics to advanced investing, each with interactive quizzes and activities." },
  { icon: Gamepad2, title: "Financial Games", desc: "Sim trading, budgeting challenges, and decision-making games that make learning addictive." },
  { icon: Award, title: "Verified Certificates", desc: "Earn personalized certificates after each course — shareable on LinkedIn and verifiable by employers." },
  { icon: Play, title: "Video Resource Hub", desc: "Endless scrolling feed of curated finance and business videos, filterable by topic." },
  { icon: Shield, title: "Safe for Teens", desc: "Age-appropriate content with parental controls, COPPA/FERPA compliant for schools." },
  { icon: Users, title: "School Licensing", desc: "Teacher dashboards, class management, progress reports, and bulk enrollment for districts." },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Get started with financial basics",
    features: ["3 foundational courses", "Limited game access", "Video resource hub", "Community access"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/month",
    desc: "Full access to master your money",
    features: ["All 9+ courses", "Unlimited games & sims", "Ad-free experience", "Personalized certificates", "Advanced modules", "Priority support"],
    cta: "Go Premium",
    highlighted: true,
    annual: "$79/year (save 34%)",
  },
  {
    name: "Quant Vault",
    price: "$29",
    period: "/month",
    desc: "Elite quantitative strategy access",
    features: ["Everything in Premium", "Quant investment strategy", "Downloadable models & datasets", "Backtesting fundamentals", "Live Q&A webinars", "Private community"],
    cta: "Unlock the Vault",
    highlighted: false,
    badge: "ELITE",
    oneTime: "or $199 one-time",
  },
];

const testimonials = [
  { name: "Sarah M.", role: "High School Junior", quote: "FinOva taught me more about money in 2 weeks than 16 years of school.", stars: 5 },
  { name: "Mr. Rodriguez", role: "Economics Teacher", quote: "The school portal makes it incredibly easy to track student progress and assign courses.", stars: 5 },
  { name: "Jordan K.", role: "College Freshman", quote: "The Quant Vault is insane. I'm actually backtesting strategies now.", stars: 5 },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6">
        <div className="absolute inset-0 opacity-5" style={{ background: "var(--gradient-primary)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl" style={{ background: "var(--gradient-primary)" }} />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Now launching — First 1,000 users get 50% off Premium
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-6">
            Master Your Money.{" "}
            <span className="gradient-text">Build Your Future.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The gamified financial literacy platform built for teens. Expert courses, interactive games, verified certificates, and a premium quantitative investment strategy vault.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 glow-primary">
                Start Learning Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/school-program">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Building2 className="w-5 h-5 mr-2" /> School Program
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • COPPA & FERPA compliant • Trusted by educators
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-card/50 py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "9+", label: "Expert Courses" },
            { value: "50+", label: "Interactive Modules" },
            { value: "100+", label: "Lessons & Activities" },
            { value: "∞", label: "Video Resources" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold font-display gradient-text">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Everything You Need to <span className="gradient-text">Win Financially</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A complete ecosystem for financial education — courses, games, videos, certifications, and exclusive strategies.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-xl p-6 hover:border-primary/30 transition-all group">
                <div className="p-2.5 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Preview */}
      <section className="py-20 px-6 bg-card/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Course <span className="gradient-text">Catalog</span></h2>
            <p className="text-muted-foreground">From budgeting basics to quantitative strategies — we've got your financial education covered.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Fundamentals of Money", cat: "Fundamentals", level: "Beginner", premium: false },
              { title: "Budgeting & Personal Finance", cat: "Personal Finance", level: "Beginner", premium: false },
              { title: "Banking, Payments & Safety", cat: "Safety", level: "Beginner", premium: false },
              { title: "Credit & Borrowing", cat: "Credit", level: "Intermediate", premium: false },
              { title: "Investing Basics", cat: "Investing", level: "Intermediate", premium: false },
              { title: "Entrepreneurship & Business", cat: "Business", level: "Intermediate", premium: false },
              { title: "Real-World Money Management", cat: "Life Skills", level: "Beginner", premium: false },
              { title: "Financial Decision Making", cat: "Psychology", level: "Intermediate", premium: false },
              { title: "Quant Strategy & Advanced Investing", cat: "Investing", level: "Advanced", premium: true },
            ].map((course) => (
              <div key={course.title} className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">{course.cat}</span>
                  {course.premium && (
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-gold/10 gradient-gold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Elite
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-sm mb-1">{course.title}</h3>
                <p className="text-xs text-muted-foreground">{course.level}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/auth">
              <Button>Explore All Courses <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Simple, <span className="gradient-text">Transparent Pricing</span></h2>
            <p className="text-muted-foreground">Start free. Upgrade when you're ready to go all in.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl p-6 relative overflow-hidden ${
                  tier.highlighted
                    ? "border-2 border-primary glow-primary bg-card"
                    : "glass"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "var(--gradient-primary)" }} />
                )}
                {tier.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded gradient-gold bg-gold/10">
                    {tier.badge}
                  </span>
                )}
                <h3 className="font-display font-bold text-lg">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-1">
                  <span className="text-3xl font-bold font-display">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
                {tier.annual && <p className="text-xs text-primary mb-2">{tier.annual}</p>}
                {tier.oneTime && <p className="text-xs text-muted-foreground mb-2">{tier.oneTime}</p>}
                <p className="text-sm text-muted-foreground mb-6">{tier.desc}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <ChevronRight className="w-3 h-3 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth">
                  <Button className="w-full" variant={tier.highlighted ? "default" : "outline"}>
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/school-program" className="text-sm text-primary hover:underline">
              Looking for school/district pricing? <ChevronRight className="w-3 h-3 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-card/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold font-display text-center mb-12">What People Are <span className="gradient-text">Saying</span></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic text-muted-foreground">"{t.quote}"</p>
                <p className="font-display font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FFI Connection */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto glass rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-bl-full" style={{ background: "var(--gradient-primary)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold font-display">Powered by the Financial Freedom Initiative</h2>
            </div>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              FinOva is proudly connected to the Financial Freedom Initiative — a mission-driven organization dedicated to financial education through workshops, community outreach, and mentorship. Access their workshops, blogs, and newsletters directly through our platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://bcinvestments.wixsite.com/financial-freedom--2" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" /> Visit FFI
                </Button>
              </a>
              <a href="https://instagram.com/financial.freedom.initiative" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Instagram className="w-4 h-4 mr-2" /> @financial.freedom.initiative
                </Button>
              </a>
              <Link to="/financial-freedom-initiative">
                <Button>
                  Learn More <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Ready to Take Control of Your <span className="gradient-text">Financial Future</span>?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of teens already building smarter money habits. Start for free today.</p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-10 py-6 glow-primary">
              Get Started — It's Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Landing;
