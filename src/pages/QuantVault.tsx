import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Lock, BarChart3, FileText, Play, Users, AlertTriangle, ChevronRight, Sparkles, Shield } from "lucide-react";

const vaultFeatures = [
  { icon: BarChart3, title: "Full Quant Strategy Deep-Dive", desc: "Multi-module course covering time-series analysis, factor investing, ETF selection, and the complete quantitative investment methodology." },
  { icon: FileText, title: "Downloadable Models & Datasets", desc: "Python notebooks, CSV datasets, historical backtest results, and strategy templates you can study and modify." },
  { icon: Play, title: "Live Q&A Webinars", desc: "Monthly live sessions with strategy updates, market analysis, and direct Q&A with the strategy creator." },
  { icon: Users, title: "Private Community", desc: "Exclusive Quant Vault community for discussing strategies, sharing insights, and networking with fellow learners." },
  { icon: Shield, title: "Simulated Trading Sandbox", desc: "Test the strategy in a risk-free simulated environment with historical and real-time market data — no real money required." },
  { icon: Sparkles, title: "Strategy Updates", desc: "Ongoing strategy refinements, new backtesting approaches, and updated models delivered directly to Vault members." },
];

const QuantVault = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-bold mb-6">
              <Lock className="w-4 h-4" /> ELITE ACCESS
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              The <span className="gradient-gold">Quant Vault</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Exclusive access to a quantitative investment strategy — deep-dive courses, downloadable models, backtesting fundamentals, live Q&A, and a private community.
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {vaultFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-xl p-6 hover:border-gold/20 transition-all">
                <Icon className="w-6 h-6 text-gold mb-3" />
                <h3 className="font-display font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="glass rounded-xl p-8 border border-gold/20 text-center mb-12">
            <h2 className="text-2xl font-bold font-display mb-2">Unlock the Vault</h2>
            <p className="text-muted-foreground mb-6">Everything in Premium + exclusive Quant Strategy access</p>
            <div className="flex justify-center gap-8 mb-6">
              <div>
                <p className="text-3xl font-bold font-display gradient-gold">$29</p>
                <p className="text-sm text-muted-foreground">/month</p>
              </div>
              <div className="border-l border-border" />
              <div>
                <p className="text-3xl font-bold font-display gradient-gold">$199</p>
                <p className="text-sm text-muted-foreground">one-time lifetime</p>
              </div>
            </div>
            <Link to="/auth">
              <Button size="lg" className="px-10">
                Get Quant Vault Access <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">Includes everything in Premium ($9.99/mo value)</p>
          </div>

          {/* Disclaimer */}
          <div className="glass rounded-xl p-6 border-l-4 border-warning">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">Important Disclaimer</p>
                <p><strong>Monucate provides educational content only.</strong> The quantitative strategies and investment materials presented are for learning and illustration. They do not constitute investment advice.</p>
                <p>Users assume all risk. <strong>Past performance does not guarantee future results.</strong> Consult a licensed financial professional before making any investment decisions.</p>
                <p>By purchasing Quant Vault access, you acknowledge that you have read and agree to our <Link to="/disclaimers" className="text-primary hover:underline">full Risk Disclosure and Terms of Use</Link>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default QuantVault;
