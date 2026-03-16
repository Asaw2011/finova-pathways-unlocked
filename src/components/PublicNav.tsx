import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/about", label: "About" },
  { to: "/courses-preview", label: "Courses" },
  { to: "/school-program", label: "Schools" },
  { to: "/resources", label: "Resources" },
  { to: "/quant-vault", label: "Quant Vault" },
  { to: "/financial-freedom-initiative", label: "FFI" },
  { to: "/contact", label: "Contact" },
];

const FinOvaLogo = () => (
  <span className="text-lg font-bold font-display flex items-center">
    <span className="gradient-text">Fin</span>
    <span className="relative inline-flex items-center justify-center mx-[-1px]">
      <span className="gradient-text">O</span>
      {/* Nova glow effect */}
      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="w-5 h-5 rounded-full opacity-60 blur-[6px] animate-pulse"
          style={{ background: "linear-gradient(135deg, hsl(36 100% 55%), hsl(28 100% 50%), hsl(45 100% 60%))" }}
        />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-70" fill="none">
          {/* 4-point starburst */}
          <path d="M12 2 L13 10 L22 12 L13 14 L12 22 L11 14 L2 12 L11 10 Z" fill="url(#novaGrad)" />
          <defs>
            <linearGradient id="novaGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(45 100% 60%)" />
              <stop offset="50%" stopColor="hsl(36 100% 55%)" />
              <stop offset="100%" stopColor="hsl(28 100% 50%)" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    </span>
    <span className="gradient-text">va</span>
  </span>
);

const PublicNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <Link to="/" className="flex items-center gap-2">
          <FinOvaLogo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                location.pathname === to ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
          <div className="w-px h-5 bg-border mx-1" />
          <Link
            to="/paper-trading"
            className={cn(
              "px-3 py-2 text-sm font-semibold rounded-lg transition-colors",
              location.pathname === "/paper-trading"
                ? "text-primary bg-primary/10"
                : "text-accent-foreground bg-accent/60 hover:bg-accent"
            )}
          >
            Paper Trading
          </Link>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>
          <Link to="/auth"><Button size="sm">Start Free</Button></Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background px-6 py-4 space-y-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 flex gap-2">
            <Link to="/auth" className="flex-1"><Button variant="outline" className="w-full" size="sm">Sign In</Button></Link>
            <Link to="/auth" className="flex-1"><Button className="w-full" size="sm">Start Free</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNav;
