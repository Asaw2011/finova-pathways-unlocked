import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, BookOpen, Lightbulb, Brain, Trophy, Sparkles, Star, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionData {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface LessonContent {
  intro: string;
  example: {
    scenario: string;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
  practice: QuestionData[];
  quiz: QuestionData[];
}

interface Props {
  content: LessonContent;
  lessonTitle: string;
  lessonId?: string;
  userId?: string;
  onComplete: (passed: boolean, score: number) => void;
  onCancel: () => void;
}

type Phase = "goal" | "intro" | "example" | "practice" | "quiz" | "result";

const GOALS = [
  { emoji: "💰", text: "Make smarter money decisions", short: "Smarter decisions 💰" },
  { emoji: "🎯", text: "Hit a specific financial goal", short: "Hit my goal 🎯" },
  { emoji: "🧠", text: "Understand this better than most", short: "Know more 🧠" },
];

const phaseLabels: Record<string, { label: string; icon: typeof BookOpen }> = {
  goal: { label: "Goal", icon: Sparkles },
  intro: { label: "Concept", icon: BookOpen },
  example: { label: "Example", icon: Lightbulb },
  practice: { label: "Practice", icon: Brain },
  quiz: { label: "Quiz", icon: Trophy },
};

const highlightFinancialTerms = (text: string) => {
  const parts = text.split(/(\$[\d,]+|[\d]+%|APY|APR|ETF|FDIC|401\(k\)|IRA|Roth)/g);
  return parts.map((part, i) => {
    if (/^\$[\d,]+$|^[\d]+%$|^APY$|^APR$|^ETF$|^FDIC$|^401\(k\)$|^IRA$|^Roth$/.test(part)) {
      return <span key={i} className="font-bold text-primary">{part}</span>;
    }
    return part;
  });
};

const LessonExperience = ({ content, lessonTitle, lessonId, userId, onComplete, onCancel }: Props) => {
  const [phase, setPhase] = useState<Phase>("goal");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  // Example states
  const [examplePrediction, setExamplePrediction] = useState<number | null>(null);
  const [exampleRevealed, setExampleRevealed] = useState(false);
  const [exampleAnswer, setExampleAnswer] = useState<number | null>(null);

  // Practice states
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState<number | null>(null);
  const [practiceStreak, setPracticeStreak] = useState(0);

  // Quiz states
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [mistakes, setMistakes] = useState<Array<{ question: string; userAnswer: string; correctAnswer: string }>>([]);

  // Timer
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stars animation
  const [starsShown, setStarsShown] = useState(0);

  const phases: Phase[] = ["goal", "intro", "example", "practice", "quiz"];
  const currentPhaseIdx = phases.indexOf(phase === "result" ? "quiz" : phase);

  // Quiz timer
  useEffect(() => {
    if (phase === "quiz" && !quizFinished && quizAnswer === null) {
      setTimeLeft(20);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleQuizAnswer(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase, quizIdx, quizAnswer, quizFinished]);

  // Star animation on result
  useEffect(() => {
    if (phase === "result") {
      const totalStars = quizScore === content.quiz.length ? 3 : quizScore >= Math.ceil(content.quiz.length * 0.7) ? 2 : 1;
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setStarsShown(count);
        if (count >= totalStars) clearInterval(interval);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const trackMistake = (question: string, userAnswer: string, correctAnswer: string) => {
    setMistakes(prev => [...prev, { question, userAnswer, correctAnswer }]);
  };

  const saveMistakes = async () => {
    if (!userId || mistakes.length === 0) return;
    try {
      const inserts = mistakes.map(m => ({
        user_id: userId,
        question_text: m.question,
        user_answer: m.userAnswer,
        correct_answer: m.correctAnswer,
        lesson_id: lessonId || null,
        topic: lessonTitle,
      }));
      await supabase.from("user_mistakes").insert(inserts);
    } catch (e) {
      console.error("Failed to save mistakes:", e);
    }
  };

  const handleExampleAnswer = (i: number) => {
    if (exampleAnswer !== null) return;
    setExampleAnswer(i);
    if (i !== content.example.correct) {
      trackMistake(content.example.question, content.example.options[i], content.example.options[content.example.correct]);
    }
  };

  const handlePracticeAnswer = (i: number) => {
    if (practiceAnswer !== null) return;
    setPracticeAnswer(i);
    if (i === content.practice[practiceIdx].correct) {
      setPracticeStreak(s => s + 1);
    } else {
      setPracticeStreak(0);
      const q = content.practice[practiceIdx];
      trackMistake(q.question, q.options[i], q.options[q.correct]);
    }
  };

  const nextPractice = () => {
    if (practiceIdx + 1 >= content.practice.length) {
      setPhase("quiz");
    } else {
      setPracticeIdx(p => p + 1);
      setPracticeAnswer(null);
    }
  };

  const handleQuizAnswer = (i: number) => {
    if (quizAnswer !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizAnswer(i);
    const q = content.quiz[quizIdx];
    const isCorrect = i >= 0 && i === q.correct;
    if (isCorrect) setQuizScore(s => s + 1);
    else {
      const userAns = i >= 0 ? q.options[i] : "Time ran out";
      trackMistake(q.question, userAns, q.options[q.correct]);
    }

    setTimeout(() => {
      if (quizIdx + 1 >= content.quiz.length) {
        setQuizFinished(true);
        setPhase("result");
        saveMistakes();
      } else {
        setQuizIdx(q => q + 1);
        setQuizAnswer(null);
      }
    }, 1200);
  };

  const passed = quizScore >= Math.ceil(content.quiz.length * 0.7);
  const totalStars = quizScore === content.quiz.length ? 3 : passed ? 2 : 1;

  const restart = () => {
    setPhase("goal");
    setSelectedGoal(null);
    setExamplePrediction(null);
    setExampleRevealed(false);
    setExampleAnswer(null);
    setPracticeIdx(0);
    setPracticeAnswer(null);
    setPracticeStreak(0);
    setQuizIdx(0);
    setQuizAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
    setMistakes([]);
    setStarsShown(0);
    setTimeLeft(20);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-2">
        {phases.map((p, i) => {
          const info = phaseLabels[p];
          const Icon = info.icon;
          const isActive = i === currentPhaseIdx;
          const isDone = i < currentPhaseIdx || phase === "result";
          return (
            <div key={p} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn(
                "w-full h-1.5 rounded-full transition-all",
                isDone ? "bg-primary" : isActive ? "bg-primary/50" : "bg-muted"
              )} />
              <div className="flex items-center gap-1">
                <Icon className={cn("w-3 h-3", isDone ? "text-primary" : isActive ? "text-primary/70" : "text-muted-foreground")} />
                <span className={cn("text-[10px] font-bold", isDone ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground")}>
                  {info.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal chip */}
      {selectedGoal && phase !== "goal" && (
        <div className="flex justify-center">
          <span className="rounded-full px-3 py-1 text-xs font-bold bg-primary/10 text-primary">
            Goal: {selectedGoal}
          </span>
        </div>
      )}

      <div className="glass rounded-xl p-5">
        <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wide">{lessonTitle}</p>

        <AnimatePresence mode="wait">
          {/* GOAL HOOK */}
          {phase === "goal" && (
            <motion.div key="goal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="text-center space-y-2">
                <Sparkles className="w-7 h-7 mx-auto text-primary" />
                <h3 className="text-lg font-bold font-display">Why does this matter to you?</h3>
                <p className="text-xs text-muted-foreground">Pick what drives you forward</p>
              </div>
              <div className="space-y-2">
                {GOALS.map((g) => (
                  <button key={g.short} onClick={() => setSelectedGoal(g.short)}
                    className={cn(
                      "w-full rounded-2xl border-2 p-4 text-left transition-all cursor-pointer",
                      selectedGoal === g.short ? "border-primary bg-primary/10 scale-[1.02]" : "border-border hover:border-primary/30"
                    )}>
                    <span className="text-xl mr-2">{g.emoji}</span>
                    <span className="text-sm font-semibold">{g.text}</span>
                  </button>
                ))}
              </div>
              {selectedGoal && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Button onClick={() => setPhase("intro")} className="w-full">
                    Let's go → <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* INTRO — upgraded with highlights and did-you-know */}
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <p className="text-sm leading-relaxed">{highlightFinancialTerms(content.intro)}</p>
              {/* Did you know callout */}
              {content.intro.split('.')[0] && (
                <div className="rounded-xl p-3 bg-primary/5 border border-primary/20">
                  <p className="text-xs font-bold text-primary mb-1">💡 Did you know?</p>
                  <p className="text-xs text-foreground/70">{content.intro.split('.')[0]}.</p>
                </div>
              )}
              <Button onClick={() => setPhase("example")} className="w-full">
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* EXAMPLE — scenario-reveal format */}
          {phase === "example" && (
            <motion.div key="example" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-xl p-4 border-2 border-amber-400/50 bg-amber-50/30 dark:bg-amber-950/20">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">📍 Real Scenario</p>
                <p className="text-sm leading-relaxed">{content.example.scenario}</p>
              </div>

              {!exampleRevealed && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">What do you think happens?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setExamplePrediction(0); setExampleRevealed(true); }}
                      className="rounded-xl border-2 border-border p-3 text-sm font-semibold hover:border-amber-400/50 transition-all">
                      Positive outcome 👍
                    </button>
                    <button onClick={() => { setExamplePrediction(1); setExampleRevealed(true); }}
                      className="rounded-xl border-2 border-border p-3 text-sm font-semibold hover:border-amber-400/50 transition-all">
                      Negative outcome 👎
                    </button>
                  </div>
                </div>
              )}

              {exampleRevealed && !exampleAnswer && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <p className="text-sm font-semibold">{content.example.question}</p>
                  <div className="space-y-2">
                    {content.example.options.map((opt, i) => (
                      <button key={i} onClick={() => handleExampleAnswer(i)} disabled={exampleAnswer !== null}
                        className="w-full text-left rounded-lg p-3 text-sm transition-all border bg-card hover:border-primary/40 border-border">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {exampleAnswer !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted text-sm">
                    {exampleAnswer === content.example.correct
                      ? <p className="text-primary font-medium">✓ Correct!</p>
                      : <p className="text-destructive font-medium">✗ Not quite.</p>
                    }
                    <p className="mt-1 text-muted-foreground">{content.example.explanation}</p>
                  </div>
                  <Button onClick={() => setPhase("practice")} className="w-full">
                    Continue to Practice <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* PRACTICE — with letter labels and streak */}
          {phase === "practice" && (
            <motion.div key={`practice-${practiceIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-bold">Practice {practiceIdx + 1}/{content.practice.length}</p>
                {practiceStreak >= 2 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                    🔥 {practiceStreak} Streak!
                  </motion.span>
                )}
              </div>
              <p className="text-sm font-semibold">{content.practice[practiceIdx].question}</p>
              <div className="space-y-2">
                {content.practice[practiceIdx].options.map((opt, i) => (
                  <button key={i} onClick={() => handlePracticeAnswer(i)} disabled={practiceAnswer !== null}
                    className={cn(
                      "w-full text-left rounded-lg p-3 text-sm transition-all border",
                      practiceAnswer === null ? "bg-card hover:border-primary/40 border-border" : "",
                      practiceAnswer === i && i === content.practice[practiceIdx].correct ? "border-primary bg-primary/10" : "",
                      practiceAnswer === i && i !== content.practice[practiceIdx].correct ? "border-destructive bg-destructive/10" : "",
                      practiceAnswer !== null && i === content.practice[practiceIdx].correct && practiceAnswer !== i ? "border-primary/50 bg-primary/5" : ""
                    )}>
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </span>
                  </button>
                ))}
              </div>
              {practiceAnswer !== null && (
                <>
                  <div className="p-3 rounded-lg bg-muted text-sm">
                    {practiceAnswer === content.practice[practiceIdx].correct
                      ? <p className="text-primary font-medium">✓ Correct!</p>
                      : <p className="text-destructive font-medium">✗ Incorrect.</p>
                    }
                    <p className="mt-1 text-muted-foreground text-xs">
                      {content.practice[practiceIdx].explanation ||
                        `The correct answer is "${content.practice[practiceIdx].options[content.practice[practiceIdx].correct]}" because this directly applies the concept in ${lessonTitle}.`}
                    </p>
                  </div>
                  <Button onClick={nextPractice} className="w-full">
                    {practiceIdx + 1 >= content.practice.length ? "Start Quiz" : "Next Question"} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </>
              )}
            </motion.div>
          )}

          {/* QUIZ — with timer and letter labels */}
          {phase === "quiz" && !quizFinished && (
            <motion.div key={`quiz-${quizIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-primary">End-of-Lesson Quiz</p>
                <div className="flex items-center gap-2">
                  <Timer className={cn("w-3.5 h-3.5", timeLeft <= 5 ? "text-destructive" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-bold tabular-nums", timeLeft <= 5 ? "text-destructive" : "text-muted-foreground")}>{timeLeft}s</span>
                  <span className="text-xs text-muted-foreground">Q{quizIdx + 1}/{content.quiz.length}</span>
                </div>
              </div>
              {/* Timer bar */}
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", timeLeft <= 5 ? "bg-destructive" : "bg-primary")}
                  animate={{ width: `${(timeLeft / 20) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm font-semibold">{content.quiz[quizIdx].question}</p>
              <div className="space-y-2">
                {content.quiz[quizIdx].options.map((opt, i) => (
                  <button key={i} onClick={() => handleQuizAnswer(i)} disabled={quizAnswer !== null}
                    className={cn(
                      "w-full text-left rounded-lg p-3 text-sm transition-all border",
                      quizAnswer === null ? "bg-card hover:border-primary/40 border-border" : "",
                      quizAnswer === i && i === content.quiz[quizIdx].correct ? "border-primary bg-primary/10" : "",
                      quizAnswer === i && i !== content.quiz[quizIdx].correct ? "border-destructive bg-destructive/10" : "",
                      quizAnswer !== null && i === content.quiz[quizIdx].correct && quizAnswer !== i ? "border-primary/50 bg-primary/5" : ""
                    )}>
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULT — with stars */}
          {phase === "result" && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
              {/* Stars */}
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3].map(star => (
                  <motion.div key={star}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={starsShown >= star ? { scale: 1, rotate: 0 } : { scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                    <Star className={cn("w-10 h-10", starsShown >= star ? "text-amber-400 fill-amber-400" : "text-muted")} />
                  </motion.div>
                ))}
              </div>

              {passed ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="text-lg font-bold font-display">Lesson Complete! 🎉</h3>
                  <p className="text-muted-foreground text-sm">You scored {quizScore}/{content.quiz.length}</p>

                  {/* What you mastered */}
                  <div className="text-left rounded-xl p-3 bg-primary/5 border border-primary/20">
                    <p className="text-xs font-bold text-primary mb-2">What you mastered:</p>
                    {content.quiz.slice(0, 3).map((q, i) => (
                      <p key={i} className="text-xs text-foreground/70 mb-1">✓ {q.question.replace(/[?:]$/, '')}</p>
                    ))}
                  </div>

                  {mistakes.length > 0 && (
                    <p className="text-xs text-muted-foreground">{mistakes.length} mistake{mistakes.length > 1 ? "s" : ""} saved to your review list</p>
                  )}
                  <Button onClick={() => onComplete(true, quizScore)} className="w-full">
                    Continue to Next Lesson <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </>
              ) : (
                <>
                  <XCircle className="w-12 h-12 text-destructive mx-auto" />
                  <h3 className="text-lg font-bold font-display">Not quite — review and try again</h3>
                  <p className="text-muted-foreground text-sm">You scored {quizScore}/{content.quiz.length}. You need {Math.ceil(content.quiz.length * 0.7)} to pass.</p>
                  {mistakes.length > 0 && (
                    <p className="text-xs text-muted-foreground">{mistakes.length} mistake{mistakes.length > 1 ? "s" : ""} saved to your review list</p>
                  )}
                  <Button onClick={restart} variant="outline" className="w-full">
                    <RotateCcw className="w-4 h-4 mr-1" /> Review Lesson
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase !== "result" && (
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
          Exit Lesson
        </Button>
      )}
    </div>
  );
};

export default LessonExperience;
