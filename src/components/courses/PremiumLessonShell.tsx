import { ArrowLeft, Crown } from "lucide-react";
import LessonExperience from "./LessonExperience";

interface Props {
  lessonTitle: string;
  moduleTitle: string;
  courseTitle: string;
  lessonNumber: number;
  totalLessons: number;
  content: any;
  lessonId?: string;
  userId?: string;
  onComplete: (passed: boolean, score: number) => void;
  onCancel: () => void;
}

const PremiumLessonShell = ({
  lessonTitle, moduleTitle, courseTitle, lessonNumber, totalLessons,
  content, lessonId, userId, onComplete, onCancel
}: Props) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Premium top bar */}
      <div className="bg-card border-b border-border px-4 py-3 rounded-xl flex items-center justify-between">
        <button onClick={onCancel} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to course
        </button>
        <span className="text-xs text-muted-foreground font-medium">
          {moduleTitle} · Lesson {lessonNumber} of {totalLessons}
        </span>
        <Crown className="w-4 h-4 text-amber-500" />
      </div>

      {/* Lesson title + premium pill */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-extrabold font-display">{lessonTitle}</h2>
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
          ✦ Plus Lesson
        </span>
      </div>

      {/* Actual lesson experience */}
      <LessonExperience
        content={content}
        lessonTitle={lessonTitle}
        lessonId={lessonId}
        userId={userId}
        onComplete={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
};

export default PremiumLessonShell;
