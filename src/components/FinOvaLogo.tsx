import { cn } from "@/lib/utils";

const FinOvaLogo = ({ className = "", size = "text-lg" }: { className?: string; size?: string }) => (
  <span className={cn("font-bold font-display gradient-text relative", size, className)}>
    Fin
    <span className="relative inline-block">
      O
      {/* Nova glow layers */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          textShadow: "0 0 8px hsl(38 90% 50% / 0.7), 0 0 20px hsl(25 85% 55% / 0.5), 0 0 40px hsl(15 80% 50% / 0.3), 0 0 60px hsl(38 90% 50% / 0.15)",
          color: "transparent",
        }}
        aria-hidden="true"
      >
        O
      </span>
    </span>
    va
  </span>
);

export default FinOvaLogo;
