import { cn } from "@/lib/utils";

const FinOvaLogo = ({ className = "", size = "text-lg" }: { className?: string; size?: string }) => (
  <span className={cn("font-bold font-display gradient-text", size, className)}>FinOva</span>
);

export default FinOvaLogo;
