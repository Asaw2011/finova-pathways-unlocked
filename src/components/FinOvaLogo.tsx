import { cn } from "@/lib/utils";

const FinOvaLogo = ({ className = "", size = "text-lg" }: { className?: string; size?: string }) => (
  <span className={cn("font-bold font-display gradient-text relative", size, className)}>
    Fin
    <span className="relative inline-block">
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(38 90% 55% / 0.35) 10%, hsl(25 85% 50% / 0.15) 40%, transparent 65%)",
          transform: "scale(1.8)",
          zIndex: 1,
          mixBlendMode: "screen",
        }}
        aria-hidden="true"
      />
      <span className="relative z-0">O</span>
    </span>
    va
  </span>
);

export default FinOvaLogo;
