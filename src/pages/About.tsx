import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Users, Target, BookOpen, Heart, GraduationCap } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
            About <span className="gradient-text">FinOva</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
            We believe everyone deserves the financial knowledge to build wealth, avoid debt traps, and make confident money decisions.
          </p>

          {/* Mission */}
          <div className="glass rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" /> Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              FinOva exists to close the financial literacy gap. Traditional education doesn't teach people how to budget, invest, or build credit. We're changing that with engaging, gamified courses built by financial experts and educators. Our platform is designed to be accessible, fun, and practical — equipping everyone with real-world money skills.
            </p>
          </div>

          {/* Values */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {[
              { icon: BookOpen, title: "Education First", desc: "Every piece of content is expert-reviewed and designed for real understanding, not just memorization." },
              { icon: Heart, title: "Accessible to All", desc: "Core courses are free. Nobody gets left behind." },
              { icon: Users, title: "Community Driven", desc: "Connected to the Financial Freedom Initiative, we're part of a movement — not just a platform." },
              { icon: GraduationCap, title: "Outcome Focused", desc: "Certificates, portfolio simulations, and real-world capstones ensure students can apply what they learn." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass rounded-xl p-6">
                <Icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-display font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <div className="glass rounded-xl p-8">
            <h2 className="text-2xl font-bold font-display mb-4">Our Team</h2>
            <p className="text-muted-foreground">
              FinOva is built by a team of financial professionals, educators, and technologists passionate about financial empowerment. We partner with the Financial Freedom Initiative to bring workshops, mentorship, and community outreach to learners nationwide.
            </p>
          </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default About;
