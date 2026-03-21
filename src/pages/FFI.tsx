import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { GraduationCap, Calendar, Users, Heart } from "lucide-react";
import FFIVideos from "@/components/ffi/FFIVideos";
import FFIGames from "@/components/ffi/FFIGames";
import FFICourses from "@/components/ffi/FFICourses";
import FFILearningPath from "@/components/ffi/FFILearningPath";
import { Link } from "react-router-dom";

const FFI = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" /> Financial Freedom Initiative
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Empowering Teens Through <span className="gradient-text">Financial Education</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              FFI delivers free workshops, interactive tools, and mentorship to help young people build real financial skills and achieve independence.
            </p>
            <Link to="/auth">
              <Button size="lg">Get Started with FinOva</Button>
            </Link>
          </div>

          {/* Learning Path */}
          <FFILearningPath />

          {/* Videos */}
          <FFIVideos />

          {/* Games */}
          <FFIGames />

          {/* Courses */}
          <FFICourses />

          {/* What FFI Offers */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold font-display mb-6">What FFI <span className="gradient-text">Offers</span></h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Calendar, title: "Live Workshops", desc: "Interactive sessions on budgeting, investing, credit, and entrepreneurship — in-person and virtual." },
                { icon: Users, title: "Community Outreach", desc: "Free programs for schools, youth organizations, and underserved communities." },
                { icon: Heart, title: "Mentorship", desc: "Connect with financial professionals who guide you on your path to independence." },
                { icon: GraduationCap, title: "Student Resources", desc: "Courses, games, and tools designed specifically for high school and college students." },
                { icon: Calendar, title: "Events & Challenges", desc: "Participate in financial literacy challenges, competitions, and community events." },
                { icon: Users, title: "Peer Learning", desc: "Learn alongside other students who are on the same journey to financial independence." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="glass rounded-xl p-6 hover:border-primary/30 transition-all">
                  <Icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-display font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="glass rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold font-display mb-2">Join the Movement</h3>
            <p className="text-muted-foreground mb-6">Start your financial literacy journey today with FinOva — built in partnership with FFI.</p>
            <Link to="/auth">
              <Button>Start Learning Free</Button>
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default FFI;
