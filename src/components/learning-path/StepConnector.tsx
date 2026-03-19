import { motion } from "framer-motion";

interface StepConnectorProps {
  /** Type of connection between lessons */
  type: "completed" | "active" | "locked" | "far-locked";
  /** Step number to show in badge */
  stepNumber: number;
  /** Animation delay */
  delay?: number;
}

const StepConnector = ({ type, stepNumber, delay = 0 }: StepConnectorProps) => {
  const isGreen = type === "completed";
  const isActive = type === "active";
  const isDashed = type === "locked" || type === "far-locked";

  const greenColor = "#58CC02";
  const grayColor = type === "far-locked" ? "#F0F0F0" : "#E5E5E5";
  const lineColor = isGreen ? greenColor : grayColor;
  const badgeBorder = isGreen || isActive ? greenColor : "#d1d5db";
  const badgeText = isGreen ? greenColor : "#9ca3af";

  return (
    <div className="flex flex-col items-center relative" style={{ height: 60 }}>
      {/* Top half of line */}
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

      {/* Center badge with step number */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full bg-white"
        style={{
          width: 20,
          height: 20,
          border: `1.5px solid ${badgeBorder}`,
        }}
      >
        {isGreen && type === "completed" ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4.5 7.5L8 3" stroke={greenColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="font-bold" style={{ fontSize: 10, color: badgeText, lineHeight: 1 }}>
            {stepNumber}
          </span>
        )}
      </div>

      {/* Bottom half of line */}
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
};

export default StepConnector;
