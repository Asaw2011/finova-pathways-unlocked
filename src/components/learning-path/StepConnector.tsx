import { forwardRef } from "react";
import { motion } from "framer-motion";

interface StepConnectorProps {
  type: "completed" | "active" | "locked" | "far-locked";
  stepNumber: number;
  delay?: number;
}

const StepConnector = forwardRef<HTMLDivElement, StepConnectorProps>(
  ({ type, stepNumber, delay = 0 }, ref) => {
    const isGreen = type === "completed";
    const isActive = type === "active";
    const isDashed = type === "locked" || type === "far-locked";

    const greenColor = "hsl(152, 60%, 42%)";
    const grayColor = type === "far-locked" ? "hsl(40, 12%, 96%)" : "hsl(40, 12%, 90%)";
    const lineColor = isGreen ? greenColor : grayColor;
    const badgeBorder = isGreen || isActive ? greenColor : "hsl(40, 12%, 88%)";
    const badgeText = isGreen ? greenColor : "hsl(220, 10%, 50%)";

    return (
      <div ref={ref} className="flex flex-col items-center relative" style={{ height: 60 }}>
        <div className="flex-1 flex items-stretch justify-center" style={{ width: 3 }}>
          {isDashed ? (
            <svg width="3" height="100%" className="overflow-visible">
              <line x1="1.5" y1="0" x2="1.5" y2="100%" stroke={lineColor} strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
            </svg>
          ) : isActive ? (
            <div className="w-full rounded-full overflow-hidden relative" style={{ backgroundColor: grayColor }}>
              <motion.div
                className="absolute top-0 left-0 w-full rounded-full"
                style={{ backgroundColor: greenColor }}
                initial={{ height: "0%" }}
                animate={{ height: "100%" }}
                transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          ) : (
            <div className="w-full rounded-full" style={{ backgroundColor: lineColor }} />
          )}
        </div>

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full bg-background"
          style={{ width: 20, height: 20, border: `1.5px solid ${badgeBorder}` }}
        >
          {isGreen ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4.5 7.5L8 3" stroke={greenColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span className="font-bold" style={{ fontSize: 10, color: badgeText, lineHeight: 1 }}>
              {stepNumber}
            </span>
          )}
        </div>

        <div className="flex-1 flex items-stretch justify-center" style={{ width: 3 }}>
          {isDashed ? (
            <svg width="3" height="100%" className="overflow-visible">
              <line x1="1.5" y1="0" x2="1.5" y2="100%" stroke={lineColor} strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
            </svg>
          ) : isActive ? (
            <div className="w-full rounded-full" style={{ backgroundColor: grayColor }} />
          ) : (
            <div className="w-full rounded-full" style={{ backgroundColor: lineColor }} />
          )}
        </div>
      </div>
    );
  }
);

StepConnector.displayName = "StepConnector";

export default StepConnector;
