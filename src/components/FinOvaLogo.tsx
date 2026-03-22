import { cn } from "@/lib/utils";

/**
 * FinOva brand wordmark.
 * The "O" renders as a nova-star accent in warm orange/gold.
 */
const FinOvaLogo = ({ className = "", size = "text-lg" }: { className?: string; size?: string }) => (
  <span className={cn("font-black font-display tracking-tight inline-flex items-baseline", size, className)}>
    <span className="text-foreground">Fin</span>
    <span
      className="relative mx-[1px]"
      style={{
        background: "linear-gradient(135deg, hsl(38 90% 50%), hsl(25 85% 55%), hsl(15 80% 50%))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        filter: "drop-shadow(0 0 6px hsl(38 90% 50% / 0.4))",
      }}
    >
      O
    </span>
    <span className="text-foreground">va</span>
  </span>
);

export default FinOvaLogo;
