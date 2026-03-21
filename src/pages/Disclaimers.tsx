import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { AlertTriangle, Shield, Scale, FileText } from "lucide-react";

const Disclaimers = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold font-display">Legal & <span className="gradient-text">Disclaimers</span></h1>

          {/* Investment Disclaimer */}
          <div className="glass rounded-xl p-6 border-l-4 border-warning">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h2 className="font-display font-bold text-lg">Investment & Financial Disclaimer</h2>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p><strong>FinOva provides educational content only.</strong> The investment materials, courses, and any financial information presented on this platform are for educational and illustrative purposes only. They do not constitute investment advice, financial advice, trading advice, or any other sort of advice.</p>
              <p>You should not make any investment decisions based on any information presented on FinOva without conducting your own research and due diligence and consulting with a licensed financial advisor or professional.</p>
              <p><strong>Past performance is not indicative of future results.</strong> Any simulated returns or historical performance shown on this platform are hypothetical and should not be considered as guarantees of future performance.</p>
              <p><strong>Risk of loss:</strong> Investing and trading involve risk of loss. You may lose some or all of your invested capital. Never invest money you cannot afford to lose.</p>
              <p>FinOva, its founders, employees, partners, and the Financial Freedom Initiative assume no responsibility or liability for any losses, damages, or costs arising from use of information presented on this platform.</p>
            </div>
          </div>

          {/* Terms of Use */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-lg">Terms of Use</h2>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>By accessing and using FinOva, you agree to be bound by these terms. FinOva is an educational platform — all content, including courses, games, videos, and strategies, is intended for learning purposes.</p>
              <p>Users must be at least 13 years old. Users under 18 should have parental or guardian consent. School accounts are managed by authorized educators.</p>
              <p>You may not redistribute, resell, or share premium content (including the Quant Vault materials) without written permission from FinOva.</p>
              <p>FinOva reserves the right to modify, suspend, or discontinue any aspect of the service at any time.</p>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-lg">Privacy Policy</h2>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>FinOva is committed to protecting your privacy. We collect only the information necessary to provide our educational services — including email, name, and learning progress data.</p>
              <p>We do not sell personal information to third parties. Data is stored securely and encrypted in transit.</p>
              <p><strong>COPPA Compliance:</strong> For users under 13, we require verifiable parental consent before collecting any personal information, in compliance with the Children's Online Privacy Protection Act.</p>
              <p><strong>FERPA Compliance:</strong> School program data is handled in accordance with the Family Educational Rights and Privacy Act. Student education records are accessible only to authorized school personnel.</p>
              <p><strong>GDPR & CCPA:</strong> Users may request access to, correction of, or deletion of their personal data at any time by contacting us.</p>
            </div>
          </div>

          {/* Risk Disclosure */}
          <div className="glass rounded-xl p-6 border-l-4 border-destructive">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-destructive" />
              <h2 className="font-display font-bold text-lg">Risk Disclosure — Quant Vault</h2>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>The Quant Vault section provides educational access to a quantitative investment strategy, including backtesting data, factor analysis, and algorithmic trading concepts.</p>
              <p><strong>This is not a managed account, fund, or advisory service.</strong> FinOva does not manage money, execute trades, or provide personalized investment recommendations.</p>
              <p>Any code, notebooks, models, or datasets provided are for educational exploration only. If used in live trading, users assume 100% of the risk and liability.</p>
              <p>Users purchasing Quant Vault access must acknowledge this risk disclosure before gaining access to premium strategy content.</p>
              <p><em>If you are an accredited investor seeking algorithmic trading services, please consult with a registered investment advisor and securities attorney regarding applicable regulations.</em></p>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default Disclaimers;
