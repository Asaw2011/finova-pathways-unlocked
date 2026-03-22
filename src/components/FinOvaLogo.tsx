import { cn } from "@/lib/utils";

const FinOvaLogo = ({ className = "", size = "text-lg" }: { className?: string; size?: string }) => (
  <span className={cn("font-bold font-display relative", size, className)}>
    {/* Base gradient text */}
    <span className="gradient-text">FinOva</span>
    {/* Amber glow positioned over the O only */}
    <span
      className="absolute pointer-events-none"
      style={{
        left: "45%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "0.8em",
        height: "0.8em",
        background: "radial-gradient(circle, hsl(38 90% 55% / 0.4) 0%, hsl(38 90% 55% / 0.12) 40%, transparent 70%)",
        borderRadius: "50%",
        zIndex: 1,
      }}
      aria-hidden="true"
    />
  </span>
);

export default FinOvaLogo;
