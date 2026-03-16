import { Link } from "react-router-dom";
import { TrendingUp, Instagram, ExternalLink } from "lucide-react";

const PublicFooter = () => {
  return (
    <footer className="border-t border-border bg-card/30 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
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
              <Link to="/quant-vault" className="block hover:text-foreground transition-colors">Quant Vault</Link>
              <Link to="/games" className="block hover:text-foreground transition-colors">Games</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Company</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/about" className="block hover:text-foreground transition-colors">About Us</Link>
              <Link to="/school-program" className="block hover:text-foreground transition-colors">School Program</Link>
              <Link to="/financial-freedom-initiative" className="block hover:text-foreground transition-colors">FFI</Link>
              <Link to="/contact" className="block hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Legal</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Disclaimers</Link>
              <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/disclaimers" className="block hover:text-foreground transition-colors">Terms of Use</Link>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://instagram.com/financial.freedom.initiative" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://bcinvestments.wixsite.com/financial-freedom--2" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FinOva. All rights reserved. FinOva provides educational content only. See <Link to="/disclaimers" className="text-primary hover:underline">disclaimers</Link> for details.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
