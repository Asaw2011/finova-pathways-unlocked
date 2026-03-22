import { cn } from "@/lib/utils";

const FinOvaLogo = ({ className = "", size = "text-lg" }: { className?: string; size?: string }) => (
  <span className={cn("font-bold font-display relative inline-flex items-baseline", size, className)}>
    <span className="gradient-text">Fin</span>
    <span className="relative inline-block">
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(38 90% 55% / 0.45) 0%, hsl(25 85% 50% / 0.2) 50%, transparent 75%)",
          transform: "scale(2.2)",
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <span
        className="relative z-10"
        style={{
          background: "linear-gradient(135deg, hsl(42 95% 55%), hsl(30 90% 50%))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        O
      </span>
    </span>
    <span className="gradient-text">va</span>
  </span>
);

export default FinOvaLogo;
