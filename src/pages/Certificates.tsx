import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Award, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Certificates = () => {
  const { user } = useAuth();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["certificates-full", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("certificates")
        .select("*, courses(title, category)")
        .eq("user_id", user!.id)
        .order("issued_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const handleShare = (cert: any) => {
    const text = `I just earned a FinOva Certificate in ${cert.courses?.title}! 🎓 #FinOva #FinancialLiteracy`;
    if (navigator.share) {
      navigator.share({ title: "FinOva Certificate", text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold font-display">Certificates</h1>
        <p className="text-muted-foreground mt-1">Your earned credentials and achievements</p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass rounded-xl p-6 animate-pulse h-48" />
          ))}
        </div>
      ) : certificates && certificates.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="glass rounded-xl p-6 relative overflow-hidden">
              {/* Decorative gradient */}
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full"
                style={{ background: "var(--gradient-gold)" }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-6 h-6 text-gold" />
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-gold/10 gradient-gold">
                    Certificate
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg mb-1">
                  {cert.courses?.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-1">
                  {cert.courses?.category}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Issued: {new Date(cert.issued_at).toLocaleDateString()} • ID: {cert.certificate_number}
                </p>
                {cert.score !== null && (
                  <p className="text-sm mb-4">
                    Score: <span className="font-bold text-primary">{cert.score}%</span>
                  </p>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleShare(cert)}>
                    <Share2 className="w-3 h-3 mr-1" /> Share
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center">
          <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display font-semibold mb-1">No certificates yet</h3>
          <p className="text-sm text-muted-foreground">
            Complete courses to earn personalized certificates
          </p>
        </div>
      )}
    </div>
  );
};

export default Certificates;
