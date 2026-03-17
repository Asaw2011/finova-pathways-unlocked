import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Instagram } from "lucide-react";
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
    body: "Quick, interactive lessons that teach real financial skills — not boring textbook stuff.",
    image: featureLessons,
    alt: "Person reading a money book",
  },
  {
    headline: "play money games",
    body: "Build budgets, dodge subscription traps, and grow your credit score — all through games.",
    image: featureGames,
    alt: "Person playing financial games",
  },
  {
    headline: "get smart advice",
    body: "Your personal AI money coach answers questions and guides your learning journey.",
    image: featureCoach,
    alt: "AI money coach robot",
  },
  {
    headline: "practice investing",
    body: "Trade real stocks with virtual money. Zero risk, real experience.",
    image: featureTrading,
    alt: "Teen with stock chart",
  },
  {
    headline: "stay motivated",
    body: "Earn gems, badges, and certificates. Compete with friends on the leaderboard.",
    image: featureRewards,
    alt: "Teen celebrating with trophies",
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
            <a href="https://instagram.com/financial.freedom.initiative" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-2 hidden sm:block">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://bcinvestments.wixsite.com/financial-freedom--2" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-2 hidden sm:block">
              <ExternalLink className="w-4 h-4" />
            </a>
            <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="font-semibold">Log in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="font-semibold">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — centered */}
      <section className="flex items-center justify-center px-6 py-16 md:py-24">
        <div className="max-w-2xl w-full text-center">
          <img src={heroIllustration} alt="People learning about money" className="w-40 md:w-52 h-auto mx-auto mb-8" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-tight mb-4">
            The free, fun way to <span className="gradient-text">master money</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Financial literacy for everyone. Gamified.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
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
      </section>

      {/* Feature sections — alternating layout like Duolingo */}
      {featureSections.map(({ headline, body, image, alt }, i) => (
        <section
          key={headline}
          className={`px-6 py-16 md:py-24 ${i % 2 === 0 ? "bg-background" : "bg-card"}`}
        >
          <div
            className={`max-w-5xl mx-auto flex flex-col items-center gap-8 md:gap-16 ${
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-display lowercase gradient-text mb-4">
                {headline}
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto md:mx-0">
                {body}
              </p>
            </div>
            <div className="flex-shrink-0">
              <img src={image} alt={alt} className="w-48 md:w-56 lg:w-64 h-auto" />
            </div>
          </div>
        </section>
      ))}

      {/* Plus banner */}
      <section className="px-6 py-16 md:py-20 bg-card">
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
      <section className="px-6 py-16 md:py-20">
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
