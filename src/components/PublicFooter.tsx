import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import FinOvaLogo from "@/components/FinOvaLogo";

const PublicFooter = () => (
  <footer className="border-t border-border bg-card/30 py-12 px-6">
    <div className="max-w-5xl mx-auto">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-bold font-display gradient-text">FinOva</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The gamified financial literacy platform built for the next generation.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">Platform</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/courses-preview" className="block hover:text-foreground transition-colors">Courses</Link>
            <Link to="/resources" className="block hover:text-foreground transition-colors">Resources</Link>
            <Link to="/games" className="block hover:text-foreground transition-colors">Games</Link>
            <Link to="/plus" className="block hover:text-foreground transition-colors">FinOva Plus</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm">Company</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Link to="/about" className="block hover:text-foreground transition-colors">About Us</Link>
            <a href="https://www.instagram.com/financial.freedom.initiative?igsh=MW5jNGVkOWppZW1yaQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="block hover:text-foreground transition-colors">FFI</a>
            <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Disclaimers</Link>
            <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} FinOva. All rights reserved. FinOva provides educational content only. See <Link to="/disclaimers" className="text-primary hover:underline">disclaimers</Link> for details.</p>
      </div>
    </div>
  </footer>
);

export default PublicFooter;
