import { cn } from "@/lib/utils";

const FinOvaLogo = ({ className = "", size = "text-lg" }: { className?: string; size?: string }) => (
  <span
    className={cn("font-bold font-display gradient-text", size, className)}
    style={{
      textShadow: "0 0 8px hsl(38 90% 55% / 0.5), 0 0 16px hsl(38 90% 55% / 0.25)",
    }}
  >
    FinOva
  </span>
);

export default FinOvaLogo;
