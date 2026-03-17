import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Instagram, BookOpen, Gamepad2, Brain, BarChart3, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroIllustration from "@/assets/hero-illustration.png";

const features = [
  {
    icon: BookOpen,
    title: "Bite-sized lessons",
    description: "Learn real financial concepts in quick, focused lessons that fit your schedule.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Gamepad2,
    title: "Fun games",
    description: "Master money skills through interactive games like Credit Score Challenge and Subscription Trap.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Brain,
    title: "AI Money Coach",
    description: "Get personalized financial advice from an AI coach that understands your goals.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: BarChart3,
    title: "Paper Trading",
    description: "Practice investing with virtual money and real market data — zero risk.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: Trophy,
    title: "Earn rewards",
    description: "Collect gems, badges, and certificates as you level up your financial knowledge.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Target,
    title: "Daily quests",
    description: "Stay motivated with daily challenges and climb the leaderboard rankings.",
    color: "bg-cyan-100 text-cyan-600",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <span className="text-lg font-bold font-display">
            <span className="gradient-text">FinOva</span>
          </span>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/financial.freedom.initiative"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://bcinvestments.wixsite.com/financial-freedom--2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <div className="w-px h-5 bg-border mx-1" />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-semibold">
                Log in
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — compact Duolingo style */}
      <section className="flex items-center justify-center px-6 py-16 md:py-24">
        <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-tight mb-4">
              The free, fun way to{" "}
              <span className="gradient-text">master money</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md mx-auto md:mx-0">
              Learn real financial skills through bite-sized lessons, games, and quizzes. Built for teens.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto md:mx-0">
              <Link to="/auth" className="flex-1">
                <Button size="lg" className="w-full font-bold glow-primary rounded-xl">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/auth" className="flex-1">
                <Button size="lg" variant="outline" className="w-full font-bold rounded-xl">
                  I have an account
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0">
            <img
              src={heroIllustration}
              alt="Teens learning about money"
              className="w-56 md:w-72 lg:w-80 h-auto"
            />
          </div>
        </div>
      </section>

      {/* What is FinOva */}
      <section className="bg-card border-y border-border/40 px-6 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold font-display mb-4">
            Meet <span className="gradient-text">FinOva</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
            FinOva is a gamified financial literacy platform built for teenagers. We make learning about money as addictive as your favorite app — with streaks, XP, hearts, and real skills that last a lifetime.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold">
            {["100% Free", "Built for Teens", "Gamified Learning", "Real Skills"].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-center mb-4">
            Everything you need to{" "}
            <span className="gradient-text">level up</span>
          </h2>
          <p className="text-muted-foreground text-center text-lg mb-12 max-w-xl mx-auto">
            From lessons to games to real-world simulations — FinOva has it all.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="glass rounded-2xl p-6 hover:card-shadow-hover transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-card border-y border-border/40 px-6 py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold font-display mb-4">
            Ready to start your{" "}
            <span className="gradient-text">money journey</span>?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of teens building smarter financial habits — completely free.
          </p>
          <Link to="/auth">
            <Button size="lg" className="font-bold glow-primary rounded-xl px-8">
              Get Started — it's free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-5 px-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} FinOva ·{" "}
          <Link to="/about" className="hover:text-foreground">About</Link> ·{" "}
          <Link to="/school-program" className="hover:text-foreground">Schools</Link> ·{" "}
          <Link to="/disclaimers" className="hover:text-foreground">Terms</Link> ·{" "}
          Powered by the{" "}
          <a href="https://bcinvestments.wixsite.com/financial-freedom--2" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Financial Freedom Initiative
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Landing;
