import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, ArrowRight, RotateCcw, BookOpen, Lightbulb,
  Brain, Trophy, Sparkles, Star, Timer, ClipboardList, Target,
  ChevronDown, ChevronUp
} from "lucide-react";
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

type Phase = "brief" | "scenario" | "apply" | "challenge" | "debrief";

const PHASE_META: Record<Phase, { label: string; icon: typeof BookOpen; color: string }> = {
  brief:     { label: "BRIEF",     icon: ClipboardList, color: "#64748b" },
  scenario:  { label: "SCENARIO",  icon: Lightbulb,     color: "#d97706" },
  apply:     { label: "APPLY",     icon: Brain,         color: "#0891b2" },
  challenge: { label: "CHALLENGE", icon: Target,        color: "#7c3aed" },
  debrief:   { label: "DEBRIEF",   icon: Trophy,        color: "#059669" },
};

const PHASES: Phase[] = ["brief", "scenario", "apply", "challenge", "debrief"];

const highlightTerms = (text: string) => {
  const parts = text.split(/(\$[\d,]+(?:\.\d+)?|[\d]+(?:\.\d+)?%|APY|APR|ETF|FDIC|401\(k\)|401k|Roth IRA|IRA|W-2|1099|FICO)/g);
  return parts.map((part, i) => {
    if (/^\$[\d,]|^\d+.*%$|^APY$|^APR$|^ETF$|^FDIC$|^401|^Roth|^IRA$|^W-2$|^1099$|^FICO$/.test(part)) {
      return <span key={i} className="font-bold text-primary">{part}</span>;
    }
    return part;
  });
};

const letterLabel = (i: number) => String.fromCharCode(65 + i);

const LessonExperience = ({ content, lessonTitle, lessonId, userId, onComplete, onCancel }: Props) => {
  const [phase, setPhase] = useState<Phase>("brief");

  // Scenario states
  const [scenarioPrediction, setScenarioPrediction] = useState<number | null>(null);
  const [scenarioAnswer, setScenarioAnswer] = useState<number | null>(null);

  // Apply states
  const [applyIdx, setApplyIdx] = useState(0);
  const [applyAnswer, setApplyAnswer] = useState<number | null>(null);
  const [applyStreak, setApplyStreak] = useState(0);
  const [applyBestStreak, setApplyBestStreak] = useState(0);

  // Challenge states
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [challengeAnswer, setChallengeAnswer] = useState<number | null>(null);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeFinished, setChallengeFinished] = useState(false);
  const [mistakes, setMistakes] = useState<Array<{ question: string; userAnswer: string; correctAnswer: string }>>([]);

  // Timer
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  // Debrief
  const [starsShown, setStarsShown] = useState(0);
  const [mistakesExpanded, setMistakesExpanded] = useState(false);

  const currentPhaseIdx = PHASES.indexOf(phase);
  const readTime = Math.max(1, Math.ceil(content.intro.split(' ').length / 200));

  // Challenge timer
  useEffect(() => {
    if (phase === "challenge" && !challengeFinished && challengeAnswer === null) {
      setTimeLeft(20);
      setTimedOut(false);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimedOut(true);
            handleChallengeAnswer(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase, challengeIdx, challengeAnswer, challengeFinished]);

  // Star animation
  useEffect(() => {
    if (phase === "debrief") {
      const total = computeStars();
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setStarsShown(count);
        if (count >= total) clearInterval(interval);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const computeStars = () => {
    if (challengeScore === content.quiz.length) return 3;
    if (challengeScore >= Math.ceil(content.quiz.length * 0.7)) return 2;
    if (passed) return 1;
    return 0;
  };

  const passed = challengeScore >= Math.ceil(content.quiz.length * 0.7);

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

  const handleScenarioAnswer = (i: number) => {
    if (scenarioAnswer !== null) return;
    setScenarioAnswer(i);
    if (i !== content.example.correct) {
      trackMistake(content.example.question, content.example.options[i], content.example.options[content.example.correct]);
    }
  };

  const handleApplyAnswer = (i: number) => {
    if (applyAnswer !== null) return;
    setApplyAnswer(i);
    if (i === content.practice[applyIdx].correct) {
      const newStreak = applyStreak + 1;
      setApplyStreak(newStreak);
      if (newStreak > applyBestStreak) setApplyBestStreak(newStreak);
    } else {
      setApplyStreak(0);
      const q = content.practice[applyIdx];
      trackMistake(q.question, q.options[i], q.options[q.correct]);
    }
  };

  const nextApply = () => {
    if (applyIdx + 1 >= content.practice.length) {
      setPhase("challenge");
    } else {
      setApplyIdx(p => p + 1);
      setApplyAnswer(null);
    }
  };

  const handleChallengeAnswer = (i: number) => {
    if (challengeAnswer !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setChallengeAnswer(i);
    const q = content.quiz[challengeIdx];
    const isCorrect = i >= 0 && i === q.correct;
    if (isCorrect) setChallengeScore(s => s + 1);
    else {
      const userAns = i >= 0 ? q.options[i] : "⏱ Time ran out";
      trackMistake(q.question, userAns, q.options[q.correct]);
    }

    setTimeout(() => {
      if (challengeIdx + 1 >= content.quiz.length) {
        setChallengeFinished(true);
        setPhase("debrief");
        saveMistakes();
      } else {
        setChallengeIdx(q => q + 1);
        setChallengeAnswer(null);
        setTimedOut(false);
      }
    }, 1200);
  };

  const retryChallenge = () => {
    setChallengeIdx(0);
    setChallengeAnswer(null);
    setChallengeScore(0);
    setChallengeFinished(false);
    setMistakes([]);
    setStarsShown(0);
    setTimeLeft(20);
    setTimedOut(false);
    setPhase("challenge");
  };

  const restartFull = () => {
    setScenarioPrediction(null);
    setScenarioAnswer(null);
    setApplyIdx(0);
    setApplyAnswer(null);
    setApplyStreak(0);
    setApplyBestStreak(0);
    retryChallenge();
    setPhase("brief");
  };

  const scoreLabel = () => {
    if (challengeScore === content.quiz.length) return "Perfect!";
    if (challengeScore >= Math.ceil(content.quiz.length * 0.8)) return "Excellent!";
    if (passed) return "Good work!";
    return "Keep going!";
  };

  // Parse intro into paragraphs
  const introParagraphs = content.intro.split(/\n\n|\. (?=[A-Z])/).filter(Boolean);
  const keyInsight = content.intro.split('.')[0] + '.';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Phase Progress Stepper */}
      <div className="flex items-center gap-1">
        {PHASES.map((p, i) => {
          const meta = PHASE_META[p];
          const Icon = meta.icon;
          const isActive = i === currentPhaseIdx;
          const isDone = i < currentPhaseIdx;
          return (
            <div key={p} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn(
                "w-full h-1.5 rounded-full transition-all duration-500",
                isDone ? "bg-primary" : isActive ? "bg-primary/50" : "bg-muted"
              )} style={isDone || isActive ? { backgroundColor: isDone ? meta.color : `${meta.color}50` } : {}} />
              <div className="flex items-center gap-0.5">
                <Icon className="w-2.5 h-2.5" style={{ color: isDone || isActive ? meta.color : undefined }} />
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-wider",
                  isDone || isActive ? "text-foreground" : "text-muted-foreground"
                )}>{meta.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <AnimatePresence mode="wait">

          {/* ═══════ PHASE 1: BRIEF ═══════ */}
          {phase === "brief" && (
            <motion.div key="brief" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                  📋 Lesson Brief
                </span>
                <span className="text-[10px] text-muted-foreground">~{readTime} min read</span>
              </div>

              {/* Key Insight callout */}
              <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">💡 Key Insight</p>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{keyInsight}</p>
              </div>

              {/* Intro content with highlighted terms */}
              <div className="space-y-3">
                {introParagraphs.length > 1 ? introParagraphs.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-foreground/90">{highlightTerms(para.trim())}</p>
                )) : (
                  <p className="text-sm leading-relaxed text-foreground/90">{highlightTerms(content.intro)}</p>
                )}
              </div>

              {/* Reflection */}
              <p className="text-xs italic text-muted-foreground border-l-2 border-muted pl-3">
                As you read, think about: how does this apply to your current financial situation?
              </p>

              <Button onClick={() => setPhase("scenario")} className="w-full" style={{ backgroundColor: PHASE_META.scenario.color }}>
                Start with the Scenario → <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* ═══════ PHASE 2: SCENARIO ═══════ */}
          {phase === "scenario" && (
            <motion.div key="scenario" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-l-4 rounded-xl p-4 bg-amber-50/50 dark:bg-amber-950/20" style={{ borderColor: PHASE_META.scenario.color }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PHASE_META.scenario.color }}>📍 Real-World Scenario</p>
                <p className="text-sm leading-relaxed">{content.example.scenario}</p>
              </div>

              {/* Prediction step */}
              {scenarioPrediction === null && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Before we walk through this — what's your instinct?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {content.example.options.slice(0, 2).map((opt, i) => (
                      <button key={i} onClick={() => setScenarioPrediction(i)}
                        className="rounded-xl border-2 border-border p-3 text-sm font-medium hover:border-amber-400/60 transition-all text-left">
                        <span className="text-xs font-bold text-muted-foreground mr-1">{letterLabel(i)}</span> {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Full question after prediction */}
              {scenarioPrediction !== null && scenarioAnswer === null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <p className="text-sm font-semibold">{content.example.question}</p>
                  <div className="space-y-2">
                    {content.example.options.map((opt, i) => (
                      <button key={i} onClick={() => handleScenarioAnswer(i)}
                        className="w-full text-left rounded-xl p-3.5 text-sm transition-all border-2 border-border bg-card hover:border-amber-400/40">
                        <span className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">{letterLabel(i)}</span>
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Answer reveal */}
              {scenarioAnswer !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Show selected + correct */}
                  <div className="space-y-2">
                    {content.example.options.map((opt, i) => (
                      <div key={i} className={cn(
                        "rounded-xl p-3.5 text-sm border-2",
                        i === content.example.correct ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "",
                        scenarioAnswer === i && i !== content.example.correct ? "border-red-400 bg-red-50 dark:bg-red-950/20" : "",
                        scenarioAnswer !== i && i !== content.example.correct ? "border-border opacity-50" : ""
                      )}>
                        <span className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">{letterLabel(i)}</span>
                          {opt}
                          {i === content.example.correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />}
                          {scenarioAnswer === i && i !== content.example.correct && <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Prediction feedback */}
                  <p className="text-xs text-muted-foreground italic">
                    {scenarioPrediction === content.example.correct
                      ? "Your instinct was right! Here's the full breakdown:"
                      : "Interesting prediction — here's what actually happens:"}
                  </p>

                  <div className="rounded-xl p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">Why this is correct:</p>
                    <p className="text-sm text-emerald-900 dark:text-emerald-200">{content.example.explanation}</p>
                  </div>

                  <Button onClick={() => setPhase("apply")} className="w-full" style={{ backgroundColor: PHASE_META.apply.color }}>
                    Move to Practice → <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══════ PHASE 3: APPLY ═══════ */}
          {phase === "apply" && (
            <motion.div key={`apply-${applyIdx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: PHASE_META.apply.color }}>Apply</span>
                  <span className="text-xs text-muted-foreground">Question {applyIdx + 1} of {content.practice.length}</span>
                </div>
                {applyStreak >= 2 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                    🔥 {applyStreak} in a row!
                  </motion.span>
                )}
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5">
                {content.practice.map((_, i) => (
                  <div key={i} className={cn(
                    "h-1.5 flex-1 rounded-full transition-all",
                    i < applyIdx ? "bg-cyan-500" : i === applyIdx ? "bg-cyan-500/50" : "bg-muted"
                  )} />
                ))}
              </div>

              <p className="text-sm font-semibold">{content.practice[applyIdx].question}</p>

              <div className="space-y-2">
                {content.practice[applyIdx].options.map((opt, i) => (
                  <button key={i} onClick={() => handleApplyAnswer(i)} disabled={applyAnswer !== null}
                    className={cn(
                      "w-full text-left rounded-xl p-3.5 text-sm transition-all border-2",
                      applyAnswer === null ? "border-border bg-card hover:border-cyan-400/40" : "",
                      applyAnswer === i && i === content.practice[applyIdx].correct ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "",
                      applyAnswer === i && i !== content.practice[applyIdx].correct ? "border-red-400 bg-red-50 dark:bg-red-950/20" : "",
                      applyAnswer !== null && i === content.practice[applyIdx].correct && applyAnswer !== i ? "border-emerald-400/50 bg-emerald-50/50 dark:bg-emerald-950/10" : ""
                    )}>
                    <span className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">{letterLabel(i)}</span>
                      {opt}
                      {applyAnswer !== null && i === content.practice[applyIdx].correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />}
                      {applyAnswer === i && i !== content.practice[applyIdx].correct && <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />}
                    </span>
                  </button>
                ))}
              </div>

              {applyAnswer !== null && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className={cn(
                    "rounded-xl p-4 border text-sm",
                    applyAnswer === content.practice[applyIdx].correct
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                      : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40"
                  )}>
                    <p className="text-xs font-bold mb-1" style={{ color: applyAnswer === content.practice[applyIdx].correct ? "#059669" : "#d97706" }}>
                      {applyAnswer === content.practice[applyIdx].correct ? "✓ Correct!" : "Here's what to know:"}
                    </p>
                    <p className="text-sm text-foreground/80">
                      {content.practice[applyIdx].explanation ||
                        `The correct answer is "${content.practice[applyIdx].options[content.practice[applyIdx].correct]}" because this directly applies the concept of ${lessonTitle}.`}
                    </p>
                  </div>
                  <Button onClick={nextApply} className="w-full" style={{ backgroundColor: applyIdx + 1 >= content.practice.length ? PHASE_META.challenge.color : PHASE_META.apply.color }}>
                    {applyIdx + 1 >= content.practice.length ? "Start Challenge →" : "Next Question →"} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══════ PHASE 4: CHALLENGE ═══════ */}
          {phase === "challenge" && !challengeFinished && (
            <motion.div key={`challenge-${challengeIdx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: PHASE_META.challenge.color }}>Challenge {challengeIdx + 1} of {content.quiz.length}</span>
                <span className="text-xs font-bold text-muted-foreground">Score: {challengeScore}/{challengeIdx}</span>
              </div>

              {/* Timer bar */}
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000 ease-linear",
                    timeLeft > 10 ? "bg-emerald-500" : timeLeft > 5 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${(timeLeft / 20) * 100}%` }}
                />
              </div>

              {/* Timer text */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {content.quiz.map((_, i) => (
                    <div key={i} className={cn("w-2.5 h-2.5 rounded-full", i < challengeIdx ? "bg-violet-500" : i === challengeIdx ? "bg-violet-500/50" : "bg-muted")} />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <Timer className={cn("w-3.5 h-3.5", timeLeft <= 5 ? "text-red-500" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-bold tabular-nums", timeLeft <= 5 ? "text-red-500" : "text-muted-foreground")}>{timeLeft}s</span>
                </div>
              </div>

              {timedOut && challengeAnswer !== null ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
                  <p className="text-sm font-bold text-red-500">⏱ Time's up!</p>
                </motion.div>
              ) : (
                <>
                  <p className="text-sm font-semibold">{content.quiz[challengeIdx].question}</p>
                  <div className="space-y-2">
                    {content.quiz[challengeIdx].options.map((opt, i) => (
                      <button key={i} onClick={() => handleChallengeAnswer(i)} disabled={challengeAnswer !== null}
                        className={cn(
                          "w-full text-left rounded-xl p-3.5 text-sm transition-all border-2",
                          challengeAnswer === null ? "border-border bg-card hover:border-violet-400/40" : "",
                          challengeAnswer === i && i === content.quiz[challengeIdx].correct ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "",
                          challengeAnswer === i && i !== content.quiz[challengeIdx].correct ? "border-red-400 bg-red-50 dark:bg-red-950/20" : "",
                          challengeAnswer !== null && i === content.quiz[challengeIdx].correct && challengeAnswer !== i ? "border-emerald-400/50" : ""
                        )}>
                        <span className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">{letterLabel(i)}</span>
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Micro-feedback */}
              {challengeAnswer !== null && !timedOut && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                  {challengeAnswer === content.quiz[challengeIdx].correct
                    ? <p className="text-sm font-bold text-emerald-600">✓ Correct!</p>
                    : <p className="text-sm font-bold text-red-500">✗ Incorrect</p>}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══════ PHASE 5: DEBRIEF ═══════ */}
          {phase === "debrief" && (
            <motion.div key="debrief" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="border-t-2 -mt-6 -mx-6 px-6 pt-5 mb-2 rounded-t-2xl" style={{ borderColor: PHASE_META.debrief.color }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: PHASE_META.debrief.color }}>Lesson Debrief</p>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-3 py-3">
                {[1, 2, 3].map(star => (
                  <motion.div key={star}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={starsShown >= star ? { scale: 1, rotate: 0 } : { scale: 0.3, opacity: 0.2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                    <Star className={cn("w-12 h-12", starsShown >= star ? "text-amber-400 fill-amber-400" : "text-muted fill-muted")} />
                  </motion.div>
                ))}
              </div>

              <div className="text-center space-y-1">
                <p className="text-3xl font-extrabold font-display">{challengeScore}/{content.quiz.length}</p>
                <p className="text-sm font-bold" style={{ color: passed ? PHASE_META.debrief.color : "#ef4444" }}>{scoreLabel()}</p>
              </div>

              {/* Topics covered */}
              <div className="rounded-xl p-4 bg-muted/50 border border-border">
                <p className="text-xs font-bold text-muted-foreground mb-2">Topics in this lesson:</p>
                <ul className="space-y-1">
                  {content.practice.slice(0, 3).map((q, i) => (
                    <li key={i} className="text-xs text-foreground/70 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 mt-0.5 text-emerald-500 shrink-0" />
                      {q.question.replace(/\?$/, '')}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mistakes review */}
              {mistakes.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <button onClick={() => setMistakesExpanded(!mistakesExpanded)}
                    className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-muted/50 transition-colors">
                    <span>📝 Review your mistakes ({mistakes.length})</span>
                    {mistakesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {mistakesExpanded && (
                    <div className="border-t border-border p-3 space-y-3">
                      {mistakes.map((m, i) => (
                        <div key={i} className="text-xs space-y-1">
                          <p className="font-semibold">{m.question}</p>
                          <p className="text-red-500">Your answer: {m.userAnswer}</p>
                          <p className="text-emerald-600">Correct: {m.correctAnswer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {passed ? (
                <Button onClick={() => onComplete(true, challengeScore)} className="w-full" style={{ backgroundColor: PHASE_META.debrief.color }}>
                  Complete Lesson ✓ <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground">You need {Math.ceil(content.quiz.length * 0.7)}/{content.quiz.length} to pass.</p>
                  <Button onClick={retryChallenge} className="w-full" style={{ backgroundColor: PHASE_META.challenge.color }}>
                    Retry Challenge → <RotateCcw className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="outline" onClick={restartFull} className="w-full">
                    Review Lesson <BookOpen className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Exit button */}
      {phase !== "debrief" && (
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
          Exit Lesson
        </Button>
      )}
    </div>
  );
};

export default LessonExperience;
