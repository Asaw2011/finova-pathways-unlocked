import { useState, useEffect } from "react";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { useAuth } from "@/contexts/AuthContext";
import { X, Flame, Brain, Star, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  message: string;
  icon: React.ReactNode;
  cta: string;
  ctaLink: string;
  priority: number;
  color: string;
}

const NotificationBanner = () => {
  const { currentStreak, lastLessonDate, level, xpToNextLevel, dailyChallengeCompletedToday } = useGameEconomy();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const today = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const hasLessonToday = lastLessonDate === today;

  const daysSinceLesson = lastLessonDate
    ? Math.floor((Date.now() - new Date(lastLessonDate).getTime()) / 86400000)
    : 999;

  const notifications: Notification[] = [];

  // Streak at risk
  if (!hasLessonToday && currentStreak > 0 && hour >= 18) {
    notifications.push({
      id: "streak-risk",
      message: `🔥 Your ${currentStreak}-day streak is at risk! Quick — do a lesson!`,
      icon: <Flame className="w-4 h-4 text-orange-500" />,
      cta: "Start Lesson",
      ctaLink: "/learning-path",
      priority: 1,
      color: "border-orange-500/30 bg-orange-500/5",
    });
  }

  // Daily challenge
  if (!dailyChallengeCompletedToday) {
    notifications.push({
      id: "daily-challenge",
      message: "🧠 Today's Daily Challenge is waiting for you!",
      icon: <Brain className="w-4 h-4 text-primary" />,
      cta: "Take Challenge",
      ctaLink: "/learning-path",
      priority: 3,
      color: "border-primary/30 bg-primary/5",
    });
  }

  // Level-up approaching
  if (xpToNextLevel <= 50) {
    notifications.push({
      id: "level-up",
      message: `⭐ Just ${xpToNextLevel} XP away from Level ${level + 1}!`,
      icon: <Star className="w-4 h-4 text-amber-500" />,
      cta: "Earn XP",
      ctaLink: "/learning-path",
      priority: 2,
      color: "border-amber-500/30 bg-amber-500/5",
    });
  }

  // Haven't played in 2+ days
  if (daysSinceLesson >= 2) {
    notifications.push({
      id: "comeback",
      message: "We miss you! 👋 Your learning streak needs you.",
      icon: <Target className="w-4 h-4 text-primary" />,
      cta: "Come Back",
      ctaLink: "/learning-path",
      priority: 4,
      color: "border-primary/30 bg-primary/5",
    });
  }

  // Sort by priority, filter dismissed
  const active = notifications
    .filter(n => !dismissed.includes(n.id))
    .sort((a, b) => a.priority - b.priority)[0];

  if (!active || !user) return null;

  return (
    <div className={cn("mx-4 mt-2 mb-0 rounded-xl border px-4 py-3 flex items-center gap-3 animate-fade-in", active.color)}>
      {active.icon}
      <p className="flex-1 text-xs sm:text-sm font-semibold">{active.message}</p>
      <Link to={active.ctaLink} className="shrink-0 flex items-center gap-1 text-xs font-bold text-primary hover:underline">
        {active.cta} <ArrowRight className="w-3 h-3" />
      </Link>
      <button onClick={() => setDismissed(p => [...p, active.id])} className="shrink-0 p-1 rounded-lg hover:bg-muted transition-colors">
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default NotificationBanner;
