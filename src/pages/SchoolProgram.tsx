import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2, Users, BarChart3, BookOpen, Shield, GraduationCap, CheckCircle2, FileText, Scale, Lock } from "lucide-react";

const schoolFeatures = [
  { icon: Users, title: "Rostering & Class Management", desc: "Import student rosters via CSV or SIS connectors (Clever, ClassLink). Create classes, assign courses, and manage enrollment in bulk." },
  { icon: BarChart3, title: "Teacher Dashboard & Reports", desc: "Real-time progress tracking, printable reports, gradebook sync, and student engagement analytics per class and per student." },
  { icon: BookOpen, title: "Full Course Library", desc: "Access to all 9+ courses with teacher guides, printable worksheets, and classroom-ready activities for each module." },
  { icon: Shield, title: "FERPA & COPPA Compliant", desc: "Student data privacy is our top priority. Full compliance with federal education privacy regulations and age-appropriate protections." },
  { icon: GraduationCap, title: "PD & Teacher Training", desc: "Professional development modules and live workshops to help educators integrate financial literacy into their curriculum." },
  { icon: Building2, title: "Custom Branding", desc: "White-label options with custom domain, school logo, district branding, and analytics tailored to your institution." },
];

const schoolPricing = [
  { name: "Classroom", seats: "Up to 35 students", price: "$299", period: "/year", features: ["1 teacher account", "Full course access", "Progress reports", "Certificates"], highlighted: false },
  { name: "School", seats: "Up to 500 students", price: "$1,499", period: "/year", features: ["Unlimited teachers", "Full course + games", "Rostering (CSV/SIS)", "Custom branding", "Priority support"], highlighted: true },
  { name: "District", seats: "Unlimited students", price: "Custom", period: "", features: ["Everything in School", "SSO (SAML)", "PO/invoicing", "PD workshops", "Dedicated success manager", "API access"], highlighted: false },
];

const complianceItems = [
  {
    icon: Shield,
    title: "FERPA Compliance",
    items: [
      "No student PII shared with third parties without written consent",
      "Designated school officials retain control of all education records",
      "Annual notification templates provided for parental consent (PPRA)",
      "Data access and deletion requests processed within 45 days",
      "Audit logs available for all student data access",
    ],
  },
  {
    icon: Lock,
    title: "COPPA Compliance",
    items: [
      "Verifiable parental consent required for users under 13",
      "No behavioral advertising or third-party tracking of minors",
      "Minimal data collection — only what's needed for education",
      "Parents can review, modify, or delete their child's data",
      "Age-gating and content filtering built into every experience",
    ],
  },
  {
    icon: FileText,
    title: "Data Processing Agreement",
    items: [
      "SDPC Student Data Privacy Agreement available on request",
      "SOC 2 Type II infrastructure (via cloud provider)",
      "AES-256 encryption at rest, TLS 1.3 in transit",
      "GDPR-ready data processing for international schools",
      "Breach notification within 72 hours per regulatory standards",
    ],
  },
  {
    icon: Scale,
    title: "Procurement Ready",
    items: [
      "W-9 and vendor registration docs provided on request",
      "PO/invoicing and NET-30/NET-60 payment terms available",
      "Pilot programs (60 days free) for evaluation",
      "Registered as an approved education technology vendor",
      "References and case studies available upon request",
    ],
  },
];

const subscriptionDetails = [
  {
    tier: "Individual Premium",
    price: "$9.99/mo or $79/yr",
    audience: "Individual students (ages 13+)",
    includes: ["All 9+ courses & modules", "Unlimited games & simulations", "Personalized certificates", "Ad-free experience", "Advanced investing modules"],
  },
  {
    tier: "Quant Vault (Elite)",
    price: "$29/mo or $199 lifetime",
    audience: "Advanced learners & young investors",
    includes: ["Everything in Premium", "Quantitative investment strategy access", "Downloadable models & datasets", "Backtesting tools", "Live Q&A webinars", "Private community"],
  },
  {
    tier: "School Classroom",
    price: "$299/yr (up to 35 seats)",
    audience: "Individual teachers",
    includes: ["1 teacher dashboard", "Full course library", "Student progress reports", "Printable worksheets", "Certificates of completion"],
  },
  {
    tier: "School-Wide",
    price: "$1,499/yr (up to 500 seats)",
    audience: "Schools & departments",
    includes: ["Unlimited teacher accounts", "SIS/CSV rostering", "Custom school branding", "Full game & sim access", "Priority support"],
  },
  {
    tier: "District Enterprise",
    price: "Custom pricing",
    audience: "School districts & networks",
    includes: ["Unlimited seats", "SSO (SAML/OAuth)", "PO/invoicing & NET-30", "Professional development", "Dedicated success manager", "API integrations"],
  },
];

const SchoolProgram = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" /> For Schools & Districts
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Bring Financial Literacy to <span className="gradient-text">Your School</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Campus licenses with teacher dashboards, classroom reporting, rostering, and FERPA-compliant student data management.
            </p>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {schoolFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-xl p-6">
                <Icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-display font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">School <span className="gradient-text">Pricing</span></h2>
            <p className="text-muted-foreground">Affordable, transparent pricing. No hidden fees. PO/invoicing available.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {schoolPricing.map((tier) => (
              <div key={tier.name} className={`rounded-xl p-6 ${tier.highlighted ? "border-2 border-primary glow-primary bg-card" : "glass"}`}>
                {tier.highlighted && <div className="text-xs text-primary font-bold mb-2">MOST POPULAR</div>}
                <h3 className="font-display font-bold text-lg">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{tier.seats}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold font-display">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/contact">
                  <Button className="w-full" variant={tier.highlighted ? "default" : "outline"}>
                    {tier.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Full Subscription Model */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-display mb-4">Complete <span className="gradient-text">Subscription Model</span></h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Our full tier breakdown for individuals, schools, and districts.</p>
            </div>
            <div className="space-y-4">
              {subscriptionDetails.map((sub) => (
                <div key={sub.tier} className="glass rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-display font-bold text-lg">{sub.tier}</h3>
                      <p className="text-xs text-muted-foreground">{sub.audience}</p>
                    </div>
                    <span className="text-lg font-bold font-display text-primary">{sub.price}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {sub.includes.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance & Regulations */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-display mb-4">Compliance & <span className="gradient-text">Regulations</span></h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything your procurement team needs to know. We meet or exceed all federal and state requirements for student data privacy.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {complianceItems.map(({ icon: Icon, title, items }) => (
                <div key={title} className="glass rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-bold">{title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="glass rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold font-display mb-2">Ready to bring FinOva to your school?</h3>
            <p className="text-muted-foreground mb-6">Book a demo, request a pilot program, or download our compliance documentation.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/contact"><Button>Request a Demo</Button></Link>
              <Link to="/contact"><Button variant="outline">Download Info Sheet</Button></Link>
              <Link to="/disclaimers"><Button variant="outline">View Legal & Compliance</Button></Link>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default SchoolProgram;
