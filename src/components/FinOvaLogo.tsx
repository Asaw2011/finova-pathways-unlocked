import { cn } from "@/lib/utils";

const FinOvaLogo = ({ className = "", size = "text-lg" }: { className?: string; size?: string }) => (
  <span className={cn("font-bold font-display gradient-text relative", size, className)}>
    Fin
    <span className="relative inline-block">
      <span className="relative z-10">O</span>
      {/* Nova glow behind the O */}
      <span
        className="absolute inset-0 z-0 blur-[3px] opacity-70"
        style={{
          background: "radial-gradient(circle, hsl(38 90% 55% / 0.8), hsl(25 85% 55% / 0.4), transparent 70%)",
        }}
        aria-hidden="true"
      />
    </span>
    va
  </span>
);

export default FinOvaLogo;
