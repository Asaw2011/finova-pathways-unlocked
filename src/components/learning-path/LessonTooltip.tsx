import { useState, useRef, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LessonTooltipProps {
  lessonTitle: string;
  status: "completed" | "current" | "locked";
  children: React.ReactNode;
}

const LessonTooltip = ({ lessonTitle, status, children }: LessonTooltipProps) => {
  const [visible, setVisible] = useState(false);
  const [above, setAbove] = useState(true);
  const triggerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setAbove(rect.top > 80);
    }
  }, []);

  // Dismiss on outside tap (mobile)
  useEffect(() => {
    if (!isMobile || !visible) return;
    const handler = (e: TouchEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("touchstart", handler);
    return () => document.removeEventListener("touchstart", handler);
  }, [isMobile, visible]);

  const handleMouseEnter = () => {
    if (!isMobile) {
      updatePosition();
      setVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) setVisible(false);
  };

  const handleTap = () => {
    if (isMobile) {
      updatePosition();
      setVisible(v => !v);
    }
  };

  const prefix = status === "completed" ? "✓ " : status === "current" ? "• " : "🔒 ";

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex flex-col items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={(e) => { e.preventDefault(); handleTap(); }}
    >
      {children}

      {/* Tooltip */}
      <div
        className={`absolute z-50 pointer-events-none transition-opacity ${above ? "bottom-full mb-2" : "top-full mt-2"}`}
        style={{
          opacity: visible ? 1 : 0,
          transitionDuration: visible ? "150ms" : "100ms",
        }}
      >
        <div
          className="relative px-3 py-2 rounded-lg text-center whitespace-nowrap"
          style={{ backgroundColor: "#1a1a2e" }}
        >
          <span className="text-white font-bold" style={{ fontSize: 13 }}>
            {prefix}{lessonTitle}
          </span>
          {status === "locked" && (
            <span className="block text-[11px] mt-0.5" style={{ color: "#9ca3af" }}>
              Complete prior lesson to unlock
            </span>
          )}

          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              ...(above
                ? { bottom: -6, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #1a1a2e" }
                : { top: -6, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "6px solid #1a1a2e" }),
              width: 0,
              height: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonTooltip;
