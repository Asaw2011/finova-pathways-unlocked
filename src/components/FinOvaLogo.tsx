import { cn } from "@/lib/utils";

const FinOvaLogo = ({ className = "", size = "text-lg" }: { className?: string; size?: string }) => (
  <span className={cn("font-bold font-display relative inline-flex items-baseline", size, className)}>
    <span className="gradient-text">Fin</span>
    <span
      className="relative"
      style={{
        background: "linear-gradient(135deg, hsl(38 90% 55%), hsl(25 85% 50%))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        filter: "drop-shadow(0 0 6px hsl(38 90% 50% / 0.6)) drop-shadow(0 0 12px hsl(25 85% 50% / 0.4))",
      }}
    >
      O
    </span>
    <span className="gradient-text">va</span>
  </span>
);

export default FinOvaLogo;
