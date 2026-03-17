import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroIllustration from "@/assets/hero-illustration.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Tiny top bar */}
      <header className="w-full border-b border-border/40 bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <span className="text-xl font-bold font-display">
            <span className="gradient-text">FinOva</span>
          </span>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/financial.freedom.initiative"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://bcinvestments.wixsite.com/financial-freedom--2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <div className="w-px h-6 bg-border mx-1" />
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-base font-semibold">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — large & centered */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 md:py-20">
        <div className="max-w-2xl w-full text-center">
          <img
            src={heroIllustration}
            alt="Teens learning about money"
            className="w-72 md:w-96 h-auto mx-auto mb-10"
          />
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-display leading-tight mb-6">
            The free, fun way to{" "}
            <span className="gradient-text">master money</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-lg mx-auto">
            Learn real financial skills through bite-sized lessons, games, and quizzes. Built for teens.
          </p>
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <Link to="/auth">
              <Button size="lg" className="w-full text-lg py-7 font-bold glow-primary rounded-2xl">
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full text-lg py-7 font-bold rounded-2xl">
                I already have an account
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-border/40 py-5 px-6 text-center text-sm text-muted-foreground">
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
