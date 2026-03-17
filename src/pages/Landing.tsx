import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Instagram, BookOpen, Gamepad2, Brain, BarChart3, Trophy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroIllustration from "@/assets/hero-illustration.png";

const features = [
  { icon: BookOpen, title: "Bite-sized lessons", color: "bg-emerald-100 text-emerald-600" },
  { icon: Gamepad2, title: "Fun money games", color: "bg-blue-100 text-blue-600" },
  { icon: Brain, title: "AI Money Coach", color: "bg-purple-100 text-purple-600" },
  { icon: BarChart3, title: "Paper Trading", color: "bg-amber-100 text-amber-600" },
  { icon: Trophy, title: "Earn rewards", color: "bg-pink-100 text-pink-600" },
  { icon: Target, title: "Daily quests", color: "bg-cyan-100 text-cyan-600" },
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
            <a href="https://instagram.com/financial.freedom.initiative" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-2">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://bcinvestments.wixsite.com/financial-freedom--2" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-2">
              <ExternalLink className="w-4 h-4" />
            </a>
            <div className="w-px h-5 bg-border mx-1" />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-semibold">Log in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="font-semibold">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex items-center justify-center px-6 py-14 md:py-20">
        <div className="max-w-5xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-14">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-tight mb-4">
              The free, fun way to <span className="gradient-text">master money</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto md:mx-0">
              Financial literacy for teens. Gamified.
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
          <img src={heroIllustration} alt="Teens learning about money" className="w-48 md:w-64 lg:w-72 h-auto" />
        </div>
      </section>

      {/* Features — icon grid, minimal text */}
      <section className="bg-card border-y border-border/40 px-6 py-14 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-center mb-10">
            Everything you need to <span className="gradient-text">level up</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
            {features.map(({ icon: Icon, title, color }) => (
              <div key={title} className="flex flex-col items-center text-center p-5 rounded-2xl hover:bg-secondary/50 transition-colors">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold font-display">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plus upsell banner */}
      <section className="px-6 py-14 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-white mb-4">PLUS</span>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display mb-3">
            Want the <span className="gradient-gold">full experience</span>?
          </h2>
          <p className="text-muted-foreground mb-6">Unlock premium courses, unlimited hearts, and exclusive features.</p>
          <Link to="/plus">
            <Button variant="outline" className="font-bold rounded-xl border-amber-400 text-amber-600 hover:bg-amber-50">
              Learn about FinOva Plus <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-card border-y border-border/40 px-6 py-14 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display mb-4">
            Ready to start?
          </h2>
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
