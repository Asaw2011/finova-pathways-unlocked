import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroIllustration from "@/assets/hero-illustration.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Tiny top bar */}
      <header className="w-full border-b border-border/40 bg-background/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-14">
          <span className="text-lg font-bold font-display">
            <span className="gradient-text">FinOva</span>
          </span>
          <div className="flex items-center gap-2">
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
              <Button variant="ghost" size="sm" className="text-sm font-semibold">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — Duolingo-style centered */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg text-center">
          <img
            src={heroIllustration}
            alt="Teens learning about money"
            className="w-64 h-auto mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold font-display leading-tight mb-4">
            The free, fun way to{" "}
            <span className="gradient-text">master money</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Learn real financial skills through bite-sized lessons, games, and quizzes. Built for teens.
          </p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link to="/auth">
              <Button size="lg" className="w-full text-base py-6 font-bold glow-primary">
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full text-base py-6 font-bold">
                I already have an account
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-border/40 py-4 px-6 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} FinOva · 
          <Link to="/about" className="hover:text-foreground ml-1">About</Link> · 
          <Link to="/school-program" className="hover:text-foreground ml-1">Schools</Link> · 
          <Link to="/disclaimers" className="hover:text-foreground ml-1">Terms</Link> · 
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
