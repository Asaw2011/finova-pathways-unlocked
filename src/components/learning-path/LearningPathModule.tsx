import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, CheckCircle2, Zap, BookOpen, HelpCircle, Lightbulb, Quote, ChevronRight, Heart, Diamond, Brain, Target, Sparkles, TrendingUp, AlertCircle, BarChart3, Award, ArrowUp, ArrowDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Link } from "react-router-dom";
import type { Lesson } from "@/data/course-modules";

interface QuizQuestion { q: string; options: string[]; answer: number; }
interface Props { lesson: Lesson; moduleName: string; sectionColor: string; isCompleted: boolean; onComplete: () => void; onBack: () => void; isPending: boolean; }

function reshuffleQuestion(q: QuizQuestion, seed: number): QuizQuestion {
  const indices = [0, 1, 2, 3].filter(i => i < q.options.length);
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return { q: q.q, options: indices.map(i => q.options[i]), answer: indices.indexOf(q.answer) };
}

function getQuestions(quiz: QuizQuestion[], needed: number): QuizQuestion[] {
  const result: QuizQuestion[] = [...quiz];
  let seed = 42;
  while (result.length < needed) {
    const base = quiz[result.length % quiz.length];
    seed += result.length * 7;
    result.push(reshuffleQuestion(base, seed));
  }
  return result.slice(0, needed);
}

const GOALS = [
  { emoji: "💰", text: "I want to make smarter money decisions", short: "Make smarter decisions 💰" },
  { emoji: "🎯", text: "I have a specific financial goal I'm working toward", short: "Hit my financial goal 🎯" },
  { emoji: "🧠", text: "I want to understand this better than most people my age", short: "Know more than most 🧠" },
];

type StepType =
  | { type: "goal-hook"; phase: string }
  | { type: "read"; title: string; text: string; hint?: string; phase: string; readIdx: number }
  | { type: "quote"; text: string; author: string; phase: string }
  | { type: "example"; text: string; phase: string }
  | { type: "insight"; title: string; text: string; phase: string }
  | { type: "quiz"; question: QuizQuestion; qNum: number; qTotal: number; phase: string }
  | { type: "explanation"; question: QuizQuestion; phase: string }
  | { type: "checkpoint"; title: string; phase: string; nextPhase?: string }
  | { type: "takeaway"; text: string; phase: string }
  | { type: "review-wrong"; phase: string }
  | { type: "summary"; phase: string }
  | { type: "complete"; phase: string }
  | { type: "fill-blank"; phase: string }
  | { type: "drag-sort"; phase: string }
  | { type: "real-cost"; phase: string };

const surpriseResponses = ["Great — now it's locked in! 🔒", "Then you're ahead of most people your age! 🚀"];

const LearningPathModule = ({ lesson, moduleName, sectionColor, isCompleted, onComplete, onBack }: Props) => {
  const { hearts, maxHearts, canDoLessons, loseHeart, earnGems } = useGameEconomy();

  const { steps } = useMemo(() => {
    const sentences = (lesson.content.match(/[^.!?]+[.!?]+/g) || [lesson.content]).map(s => s.trim()).filter(Boolean);
    const allQ = getQuestions(lesson.quiz, 15);
    const s: StepType[] = [];
    let readCounter = 0;

    // GOAL HOOK
    s.push({ type: "goal-hook", phase: "Learn" });

    // LEARN PHASE
    for (let i = 0; i < Math.min(4, sentences.length); i++) {
      s.push({ type: "read", phase: "Learn", title: i === 0 ? lesson.title : "Keep Reading", text: sentences[i], readIdx: readCounter++ });
    }
    if (lesson.quote) s.push({ type: "quote", text: lesson.quote.text, author: lesson.quote.author, phase: "Learn" });
    else s.push({ type: "insight", title: "Key Point", text: lesson.takeaway, phase: "Learn" });

    s.push({ type: "quiz", question: allQ[0], qNum: 1, qTotal: 2, phase: "Learn" });
    s.push({ type: "explanation", question: allQ[0], phase: "Learn" });
    s.push({ type: "quiz", question: allQ[1], qNum: 2, qTotal: 2, phase: "Learn" });
    s.push({ type: "explanation", question: allQ[1], phase: "Learn" });
    s.push({ type: "checkpoint", title: "Learn Phase Complete", phase: "Learn", nextPhase: "Apply — real-world scenarios to test your instincts" });

    // APPLY PHASE
    s.push({ type: "insight", title: "Apply to Real Life", text: "Now let's connect theory to practice with a real scenario.", phase: "Apply" });
    s.push({ type: "example", text: lesson.example || `Here's how "${lesson.title}" works in practice: ${lesson.takeaway}`, phase: "Apply" });
    if (lesson.fillBlank) s.push({ type: "fill-blank", phase: "Apply" });
    else s.push({ type: "quiz", question: allQ[2], qNum: 1, qTotal: 3, phase: "Apply" });

    s.push({ type: "quiz", question: allQ[2], qNum: 1, qTotal: 3, phase: "Apply" });
    s.push({ type: "explanation", question: allQ[2], phase: "Apply" });
    s.push({ type: "quiz", question: allQ[3], qNum: 2, qTotal: 3, phase: "Apply" });
    s.push({ type: "explanation", question: allQ[3], phase: "Apply" });
    s.push({ type: "quiz", question: allQ[4], qNum: 3, qTotal: 3, phase: "Apply" });
    s.push({ type: "explanation", question: allQ[4], phase: "Apply" });
    s.push({ type: "checkpoint", title: "Apply Phase Complete", phase: "Apply", nextPhase: "Practice — build confidence through repetition" });

    // PRACTICE PHASE
    if (lesson.sortItems) s.push({ type: "drag-sort", phase: "Practice" });
    else s.push({ type: "insight", title: "Quick Insight", text: lesson.takeaway, phase: "Practice" });

    for (let i = 0; i < 6; i++) {
      s.push({ type: "quiz", question: allQ[5 + i], qNum: i + 1, qTotal: 6, phase: "Practice" });
      s.push({ type: "explanation", question: allQ[5 + i], phase: "Practice" });
    }
    s.push({ type: "checkpoint", title: "Practice Phase Complete", phase: "Practice", nextPhase: "Master — final challenge, no hints" });

    // MASTER PHASE
    if (lesson.realCost) s.push({ type: "real-cost", phase: "Master" });
    else s.push({ type: "takeaway", text: lesson.takeaway, phase: "Master" });

    s.push({ type: "takeaway", text: lesson.takeaway, phase: "Master" });
    for (let i = 0; i < 4; i++) {
      s.push({ type: "quiz", question: allQ[11 + i], qNum: i + 1, qTotal: 4, phase: "Master" });
    }
    s.push({ type: "insight", title: "Lesson Mastered", text: `You've completed all four phases for "${lesson.title}".`, phase: "Master" });
    s.push({ type: "checkpoint", title: "Master Phase Complete", phase: "Master" });

    // RESULTS
    s.push({ type: "review-wrong", phase: "Results" });
    s.push({ type: "summary", phase: "Results" });
    s.push({ type: "complete", phase: "Results" });

    return { steps: s };
  }, [lesson]);

  const totalSteps = steps.length;
  const [step, setStep] = useState(isCompleted ? totalSteps - 1 : 0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<{ q: QuizQuestion; yourAnswer: number }[]>([]);
  const [phaseScores, setPhaseScores] = useState<Record<string, number[]>>({});
  const [outOfHearts, setOutOfHearts] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  // Interactive read states
  const [readInteracted, setReadInteracted] = useState(false);
  const [readResponse, setReadResponse] = useState<string | null>(null);
  const [termRevealed, setTermRevealed] = useState(false);

  // Fill-blank states
  const [fillSelected, setFillSelected] = useState<number | null>(null);
  const [fillChecked, setFillChecked] = useState(false);

  // Sort states
  const [sortOrder, setSortOrder] = useState<number[]>([]);
  const [sortChecked, setSortChecked] = useState(false);
  const [sortCorrect, setSortCorrect] = useState(false);

  // Example prediction
  const [examplePrediction, setExamplePrediction] = useState<number | null>(null);
  const [exampleRevealed, setExampleRevealed] = useState(false);

  const cur = steps[step];
  const pct = ((step + 1) / totalSteps) * 100;
  const pc: Record<string, string> = { Learn: "#3b82f6", Apply: "#f59e0b", Practice: "#8b5cf6", Master: "#ef4444", Results: "#22c55e" };

  useEffect(() => {
    if (step === totalSteps - 1 && !isCompleted && cur?.type === "complete") {
      onComplete();
      earnGems(15);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'] });
    }
  }, [step]);

  // Initialize sort order when reaching sort step
  useEffect(() => {
    if (cur?.type === "drag-sort" && lesson.sortItems && sortOrder.length === 0) {
      const shuffled = [...Array(lesson.sortItems.items.length).keys()];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setSortOrder(shuffled);
    }
  }, [cur?.type]);

  const resetStepState = () => {
    setAnswer(null);
    setIsCorrect(null);
    setReadInteracted(false);
    setReadResponse(null);
    setTermRevealed(false);
    setFillSelected(null);
    setFillChecked(false);
    setExamplePrediction(null);
    setExampleRevealed(false);
  };

  const doAnswer = async (idx: number) => {
    if (answer !== null || cur?.type !== "quiz") return;
    setAnswer(idx);
    const correct = idx === cur.question.answer;
    setIsCorrect(correct);
    setTotalAnswered(t => t + 1);
    setPhaseScores(prev => ({ ...prev, [cur.phase]: [(prev[cur.phase]?.[0] || 0) + (correct ? 1 : 0), (prev[cur.phase]?.[1] || 0) + 1] }));
    if (correct) {
      setScore(s => s + 1);
      setTimeout(() => { resetStepState(); setStep(s => s + 1); }, 1200);
    } else {
      setWrongAnswers(prev => [...prev, { q: cur.question, yourAnswer: idx }]);
      await loseHeart();
      if (hearts - 1 <= 0) setOutOfHearts(true);
    }
  };

  const retry = () => { setAnswer(null); setIsCorrect(null); };
  const next = () => { resetStepState(); setStep(s => Math.min(s + 1, totalSteps - 1)); };

  if (outOfHearts || (!canDoLessons && !isCompleted && step < totalSteps - 1)) {
    return (
      <div className="max-w-lg mx-auto px-4">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl border border-border p-8 card-shadow text-center space-y-5">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-red-100 dark:bg-red-950/30">
            <Heart className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-extrabold font-display">Out of Hearts!</h2>
          <p className="text-muted-foreground">You need hearts to continue learning.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/shop"><Button className="rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground"><Heart className="w-4 h-4 mr-2 fill-current" /> Get Hearts</Button></Link>
            <Button onClick={onBack} variant="outline" className="rounded-xl font-bold">Back</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const anim = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };

  // Sort helpers
  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sortOrder.length) return;
    const newOrder = [...sortOrder];
    [newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]];
    setSortOrder(newOrder);
  };

  const checkSort = () => {
    if (!lesson.sortItems) return;
    const correct = sortOrder.every((itemIdx, pos) => lesson.sortItems!.correctOrder[pos] === itemIdx);
    setSortCorrect(correct);
    setSortChecked(true);
  };

  // Get a financial term from text for type 2 read interaction
  const getKeyTerm = (text: string): string | null => {
    const match = text.match(/\b(money|budget|savings|interest|credit|debt|income|expense|investment|compound|APR|APY|ETF|FDIC|401\(k\)|IRA|net worth)\b/i);
    return match ? match[0] : null;
  };

  const getTermDefinition = (term: string): string => {
    const defs: Record<string, string> = {
      money: "A medium of exchange used to trade value between people.",
      budget: "A plan for how you'll spend and save your money.",
      savings: "Money set aside for future use instead of spending now.",
      interest: "The cost of borrowing money, or the reward for saving it.",
      credit: "Borrowed money you promise to pay back, plus interest.",
      debt: "Money you owe to someone else.",
      income: "Money you earn from work, investments, or other sources.",
      expense: "Money you spend on goods and services.",
      investment: "Putting money into something that can grow in value over time.",
      compound: "When your returns earn their own returns over time.",
    };
    return defs[term.toLowerCase()] || `A key financial concept related to ${term}.`;
  };

  // Goal chip
  const GoalChip = () => {
    if (!selectedGoal || step === 0) return null;
    return (
      <div className="flex justify-center mb-2">
        <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: sectionColor }}>
          Goal: {selectedGoal}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to path
      </button>

      {/* Hearts + Phase */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <Heart key={i} className={cn("w-5 h-5 transition-all", i < hearts ? "text-destructive fill-destructive" : "text-muted-foreground/30")} />
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span style={{ color: pc[cur?.phase || "Learn"] }}>{cur?.phase}</span>
          <span className="text-muted-foreground">{step + 1}/{totalSteps}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: sectionColor }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      <GoalChip />

      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="font-semibold text-muted-foreground truncate mr-2">{moduleName} · {lesson.title}</span>
        <span className="font-bold text-foreground">{score}/{totalAnswered}</span>
      </div>

      <AnimatePresence mode="wait">
        {/* GOAL HOOK */}
        {cur?.type === "goal-hook" && (
          <motion.div key="goal-hook" {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="text-center space-y-2">
              <Sparkles className="w-8 h-8 mx-auto" style={{ color: sectionColor }} />
              <h2 className="text-xl font-extrabold font-display">Why does "{lesson.title}" matter to you?</h2>
              <p className="text-sm text-muted-foreground">Pick what drives you — this keeps you motivated throughout the lesson.</p>
            </div>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button key={g.short} onClick={() => setSelectedGoal(g.short)}
                  className={cn(
                    "w-full rounded-2xl border-2 p-4 text-left transition-all cursor-pointer",
                    selectedGoal === g.short
                      ? "bg-opacity-10 scale-[1.02]"
                      : "border-border hover:border-primary/30"
                  )}
                  style={selectedGoal === g.short ? { borderColor: sectionColor, backgroundColor: `${sectionColor}15` } : {}}>
                  <span className="text-2xl mr-3">{g.emoji}</span>
                  <span className="text-sm font-semibold">{g.text}</span>
                </button>
              ))}
            </div>
            {selectedGoal && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
                  Let's go → <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* READ with interactive micro-elements */}
        {cur?.type === "read" && (
          <motion.div key={`read-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: pc[cur.phase] }} />
              <h2 className="text-xl font-extrabold font-display">{cur.title}</h2>
            </div>

            {/* Text with optional term highlighting (type 2) */}
            {cur.readIdx % 3 === 2 && getKeyTerm(cur.text) ? (
              <div className="space-y-2">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {cur.text.split(new RegExp(`(${getKeyTerm(cur.text)})`, 'i')).map((part, i) => {
                    const term = getKeyTerm(cur.text);
                    if (term && part.toLowerCase() === term.toLowerCase()) {
                      return (
                        <span key={i}>
                          <button onClick={() => setTermRevealed(true)}
                            className="font-bold underline decoration-2 cursor-pointer transition-colors"
                            style={{ color: sectionColor, textDecorationColor: sectionColor }}>
                            {part}
                          </button>
                          {termRevealed && (
                            <span className="block mt-2 rounded-lg p-2 text-xs font-medium" style={{ backgroundColor: `${sectionColor}15`, color: sectionColor }}>
                              💡 {getTermDefinition(term)}
                            </span>
                          )}
                        </span>
                      );
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </p>
                {termRevealed && (
                  <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
                    Got it → <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground/80 leading-relaxed">{cur.text}</p>

                {/* Type 0: Surprise check */}
                {cur.readIdx % 3 === 0 && !readInteracted && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Does this surprise you?</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setReadInteracted(true); setReadResponse(surpriseResponses[0]); }}
                        className="rounded-xl border-2 border-border p-3 text-sm font-semibold hover:border-primary/30 transition-all">
                        Yes, I didn't know this 😮
                      </button>
                      <button onClick={() => { setReadInteracted(true); setReadResponse(surpriseResponses[1]); }}
                        className="rounded-xl border-2 border-border p-3 text-sm font-semibold hover:border-primary/30 transition-all">
                        I already knew this 👍
                      </button>
                    </div>
                  </div>
                )}

                {/* Type 1: Estimation */}
                {cur.readIdx % 3 === 1 && !readInteracted && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: sectionColor }}>Quick guess before moving on:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setReadInteracted(true); setReadResponse("Interesting guess! Let's keep learning to find out. 🔍"); }}
                        className="rounded-xl border-2 border-border p-3 text-sm font-semibold hover:border-primary/30 transition-all">
                        More common than I think
                      </button>
                      <button onClick={() => { setReadInteracted(true); setReadResponse("Good instinct! The next section will reveal more. 💡"); }}
                        className="rounded-xl border-2 border-border p-3 text-sm font-semibold hover:border-primary/30 transition-all">
                        Less common than I think
                      </button>
                    </div>
                  </div>
                )}

                {readInteracted && readResponse && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3 text-sm font-medium" style={{ backgroundColor: `${sectionColor}15`, color: sectionColor }}>
                    {readResponse}
                  </motion.div>
                )}

                {(readInteracted || (cur.readIdx % 3 === 2 && !getKeyTerm(cur.text))) && (
                  <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
                    Continue <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                )}

                {/* Fallback for type 2 without a key term */}
                {cur.readIdx % 3 === 2 && !getKeyTerm(cur.text) && !readInteracted && (
                  <Button onClick={() => { setReadInteracted(true); }} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
                    Continue <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* QUOTE */}
        {cur?.type === "quote" && (
          <motion.div key={`quote-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><Quote className="w-5 h-5" style={{ color: pc[cur.phase] }} /><h2 className="text-xl font-extrabold font-display">Words of Wisdom</h2></div>
            <div className="rounded-xl bg-muted/50 p-5 border-l-4" style={{ borderColor: pc[cur.phase] }}>
              <p className="text-base italic text-foreground/80">"{cur.text}"</p>
              <p className="text-sm font-semibold text-muted-foreground mt-2">— {cur.author}</p>
            </div>
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>Continue <ChevronRight className="w-5 h-5 ml-1" /></Button>
          </motion.div>
        )}

        {/* EXAMPLE with prediction */}
        {cur?.type === "example" && (
          <motion.div key={`example-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <h2 className="text-xl font-extrabold font-display">Real Scenario</h2>
            </div>
            <div className="rounded-xl p-4 border-2 border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20">
              <p className="text-sm leading-relaxed">{cur.text}</p>
            </div>

            {!exampleRevealed && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">What do you think happens?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setExamplePrediction(0); setExampleRevealed(true); }}
                    className="rounded-xl border-2 border-border p-3 text-sm font-semibold hover:border-amber-400/50 transition-all">
                    This helps them 👍
                  </button>
                  <button onClick={() => { setExamplePrediction(1); setExampleRevealed(true); }}
                    className="rounded-xl border-2 border-border p-3 text-sm font-semibold hover:border-amber-400/50 transition-all">
                    This costs them 👎
                  </button>
                </div>
              </div>
            )}

            {exampleRevealed && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="rounded-xl p-3 bg-muted/50 text-sm">
                  <p className="font-medium">The key lesson here connects back to: <span className="font-bold" style={{ color: sectionColor }}>{lesson.takeaway}</span></p>
                </div>
                <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
                  I understand → <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* INSIGHT */}
        {cur?.type === "insight" && (
          <motion.div key={`insight-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><Brain className="w-5 h-5" style={{ color: pc[cur.phase] }} /><h2 className="text-xl font-extrabold font-display">{cur.title}</h2></div>
            <div className="rounded-xl p-4" style={{ backgroundColor: `${pc[cur.phase]}10` }}>
              <p className="text-sm leading-relaxed font-medium">{cur.text}</p>
            </div>
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
              {cur.phase === "Master" ? "Begin Challenge" : cur.phase === "Practice" ? "Start Practice" : "Continue"} <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* QUIZ */}
        {cur?.type === "quiz" && (
          <motion.div key={`quiz-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><HelpCircle className="w-5 h-5" style={{ color: pc[cur.phase] }} /><h2 className="text-lg font-extrabold font-display">{cur.phase === "Master" ? "Challenge" : "Question"} {cur.qNum}/{cur.qTotal}</h2></div>
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${pc[cur.phase]}20`, color: pc[cur.phase] }}>{cur.phase}</span>
            </div>
            <p className="text-sm font-semibold">{cur.question.q}</p>
            <div className="space-y-2">
              {cur.question.options.map((opt, i) => (
                <button key={i} onClick={() => doAnswer(i)} disabled={answer !== null}
                  className={cn("w-full text-left rounded-xl border-2 p-3.5 text-sm font-semibold transition-all",
                    answer === null && "border-border hover:border-primary/30 hover:bg-muted/30 cursor-pointer",
                    answer === i && isCorrect && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                    answer === i && isCorrect === false && "border-red-400 bg-red-50 dark:bg-red-950/30",
                    answer !== null && i === cur.question.answer && answer !== i && "border-emerald-300 bg-emerald-50/50",
                    answer !== null && answer !== i && i !== cur.question.answer && "opacity-40"
                  )}>
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
            {answer !== null && isCorrect && (
              <div className="text-center"><p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Correct!</p></div>
            )}
            {answer !== null && isCorrect === false && (
              <div className="text-center space-y-2">
                <p className="text-sm text-destructive font-bold flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4" /> Incorrect — lost a heart</p>
                <p className="text-xs text-muted-foreground">Correct: {cur.question.options[cur.question.answer]}</p>
                <Button onClick={retry} variant="outline" className="rounded-xl">Try Again</Button>
              </div>
            )}
          </motion.div>
        )}

        {/* EXPLANATION — dynamic, not boilerplate */}
        {cur?.type === "explanation" && (
          <motion.div key={`explain-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><Lightbulb className="w-5 h-5" style={{ color: pc[cur.phase] }} /><h2 className="text-xl font-extrabold font-display">Let's break that down 🔍</h2></div>
            <div className="rounded-xl p-4 bg-muted/30 space-y-3">
              <p className="text-sm font-semibold">{cur.question.q}</p>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground">Correct Answer:</p>
                  <p className="text-sm font-semibold text-emerald-600">{cur.question.options[cur.question.answer]}</p>
                </div>
              </div>
              <p className="text-xs text-foreground/70">
                "{cur.question.options[cur.question.answer]}" is right because it reflects how {lesson.title.toLowerCase()} actually works in practice.
              </p>
              {/* Common mistake */}
              {(() => {
                const wrongIdx = cur.question.options.findIndex((_, i) => i !== cur.question.answer);
                const wrongOpt = cur.question.options[wrongIdx];
                return (
                  <div className="rounded-lg p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      ⚠️ Common mistake: Many people pick "{wrongOpt}" because it sounds reasonable, but it doesn't align with the core concept.
                    </p>
                  </div>
                );
              })()}
              <div className="rounded-lg p-2" style={{ backgroundColor: `${sectionColor}10` }}>
                <p className="text-xs font-medium" style={{ color: sectionColor }}>
                  💡 Remember: {lesson.takeaway}
                </p>
              </div>
            </div>
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>Next <ChevronRight className="w-5 h-5 ml-1" /></Button>
          </motion.div>
        )}

        {/* FILL-BLANK */}
        {cur?.type === "fill-blank" && lesson.fillBlank && (
          <motion.div key={`fill-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" style={{ color: pc[cur.phase] }} />
              <h2 className="text-xl font-extrabold font-display">Fill in the Blank</h2>
            </div>
            <p className="text-sm leading-relaxed">
              {lesson.fillBlank.sentence.split("[___]").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    fillChecked && fillSelected !== null ? (
                      <span className={cn("inline-block px-2 py-0.5 rounded font-bold text-sm mx-1",
                        fillSelected === lesson.fillBlank!.answer ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                      )}>
                        {lesson.fillBlank!.options[fillSelected]}
                      </span>
                    ) : (
                      <span className="inline-block w-20 border-b-2 border-foreground mx-1 align-bottom" />
                    )
                  )}
                </span>
              ))}
            </p>
            {!fillChecked && (
              <div className="flex flex-wrap gap-2">
                {lesson.fillBlank.options.map((opt, i) => (
                  <button key={i} onClick={() => setFillSelected(i)}
                    className={cn("rounded-full px-4 py-2 border-2 font-bold text-sm cursor-pointer transition-all",
                      fillSelected === i ? "scale-105" : "border-border hover:border-primary/30"
                    )}
                    style={fillSelected === i ? { borderColor: sectionColor, backgroundColor: `${sectionColor}15` } : {}}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {fillSelected !== null && !fillChecked && (
              <Button onClick={() => setFillChecked(true)} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
                Check Answer
              </Button>
            )}
            {fillChecked && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <p className={cn("text-sm font-bold", fillSelected === lesson.fillBlank!.answer ? "text-emerald-600" : "text-red-500")}>
                  {fillSelected === lesson.fillBlank!.answer ? "✓ Correct!" : `✗ Not quite — the answer is "${lesson.fillBlank!.options[lesson.fillBlank!.answer]}"`}
                </p>
                <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
                  Continue <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* DRAG-SORT */}
        {cur?.type === "drag-sort" && lesson.sortItems && (
          <motion.div key={`sort-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: pc[cur.phase] }} />
              <h2 className="text-xl font-extrabold font-display">Put these in order</h2>
            </div>
            <p className="text-sm text-muted-foreground">Arrange from first to last:</p>
            <div className="space-y-2">
              {sortOrder.map((itemIdx, pos) => (
                <div key={itemIdx} className={cn("rounded-xl border-2 p-3 flex items-center justify-between transition-all",
                  sortChecked && lesson.sortItems!.correctOrder[pos] === itemIdx ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20" : sortChecked ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" : "border-border"
                )}>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${pc[cur.phase]}20`, color: pc[cur.phase] }}>{pos + 1}</span>
                    <span className="text-sm font-semibold">{lesson.sortItems!.items[itemIdx]}</span>
                  </div>
                  {!sortChecked && (
                    <div className="flex gap-1">
                      <button onClick={() => moveItem(pos, -1)} disabled={pos === 0} className="p-1 rounded hover:bg-muted disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => moveItem(pos, 1)} disabled={pos === sortOrder.length - 1} className="p-1 rounded hover:bg-muted disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!sortChecked && (
              <Button onClick={checkSort} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
                Check Order
              </Button>
            )}
            {sortChecked && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <p className={cn("text-sm font-bold", sortCorrect ? "text-emerald-600" : "text-red-500")}>
                  {sortCorrect ? "✓ Perfect order!" : "✗ Not quite — but you'll get it next time!"}
                </p>
                <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
                  Continue <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* REAL-COST */}
        {cur?.type === "real-cost" && lesson.realCost && (
          <motion.div key={`realcost-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: pc[cur.phase] }} />
              <h2 className="text-xl font-extrabold font-display">What This Costs in Real Life</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">If you apply this ✅</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-300">{lesson.realCost.apply}</p>
              </div>
              <div className="rounded-xl p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 space-y-2">
                <p className="text-sm font-bold text-red-700 dark:text-red-400">If you ignore this ❌</p>
                <p className="text-xs text-red-600 dark:text-red-300">{lesson.realCost.ignore}</p>
              </div>
            </div>
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
              This motivates me → <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* CHECKPOINT — improved */}
        {cur?.type === "checkpoint" && (
          <motion.div key={`checkpoint-${step}`} {...anim} className="bg-card rounded-2xl border border-border overflow-hidden card-shadow">
            <div className="h-2" style={{ backgroundColor: pc[cur.phase] }} />
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${pc[cur.phase]}20` }}>
                <Award className="w-8 h-8" style={{ color: pc[cur.phase] }} />
              </div>
              <h2 className="text-2xl font-extrabold font-display">{cur.title}</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-black" style={{ color: pc[cur.phase] }}>{phaseScores[cur.phase]?.[0] || 0}/{phaseScores[cur.phase]?.[1] || 0}</span>
                <span className="text-sm text-muted-foreground">correct</span>
              </div>
              {(() => {
                const c = phaseScores[cur.phase]?.[0] || 0;
                const t = phaseScores[cur.phase]?.[1] || 1;
                const ratio = c / t;
                if (ratio === 1) return <p className="text-sm font-bold">🔥 Perfect! You're unstoppable.</p>;
                if (ratio >= 0.8) return <p className="text-sm font-bold">⚡ Strong work — you're getting it.</p>;
                if (ratio >= 0.6) return <p className="text-sm font-bold">💪 Good effort. The next phase will reinforce this.</p>;
                return <p className="text-sm font-bold">🧠 Stay focused — understanding builds in layers.</p>;
              })()}
              {cur.nextPhase && (
                <div className="rounded-lg p-3 bg-muted/50 text-xs text-muted-foreground">
                  <span className="font-bold">What's next:</span> {cur.nextPhase}
                </div>
              )}
              <Button onClick={next} className="rounded-xl h-12 font-bold text-base px-8" style={{ backgroundColor: sectionColor }}>
                {cur.phase === "Master" ? "See Results" : "Next Phase"} <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* TAKEAWAY */}
        {cur?.type === "takeaway" && (
          <motion.div key={`takeaway-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><Zap className="w-5 h-5" style={{ color: sectionColor }} /><h2 className="text-xl font-extrabold font-display">Key Takeaway</h2></div>
            <div className="rounded-xl p-5 text-center" style={{ backgroundColor: `${sectionColor}15` }}>
              <Target className="w-6 h-6 mx-auto mb-2" style={{ color: sectionColor }} />
              <p className="text-base font-bold" style={{ color: sectionColor }}>{cur.text}</p>
            </div>
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>Continue <ChevronRight className="w-5 h-5 ml-1" /></Button>
          </motion.div>
        )}

        {/* REVIEW WRONG */}
        {cur?.type === "review-wrong" && (
          <motion.div key={`review-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-destructive" /><h2 className="text-xl font-extrabold font-display">Review Your Mistakes</h2></div>
            {wrongAnswers.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-emerald-600">No mistakes! You got every question right.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {wrongAnswers.map((w, i) => (
                  <div key={i} className="rounded-xl border border-border p-3 space-y-1">
                    <p className="text-sm font-semibold">{w.q.q}</p>
                    <p className="text-xs text-destructive">Your answer: {w.q.options[w.yourAnswer]}</p>
                    <p className="text-xs text-emerald-600">Correct: {w.q.options[w.q.answer]}</p>
                  </div>
                ))}
              </div>
            )}
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>Continue <ChevronRight className="w-5 h-5 ml-1" /></Button>
          </motion.div>
        )}

        {/* SUMMARY */}
        {cur?.type === "summary" && (
          <motion.div key={`summary-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-8 card-shadow text-center space-y-5">
            <div className="flex items-center gap-2 justify-center"><BarChart3 className="w-5 h-5" style={{ color: sectionColor }} /><h2 className="text-xl font-extrabold font-display">Final Results</h2></div>
            <div>
              <p className="text-4xl font-black" style={{ color: sectionColor }}>{score}/{totalAnswered}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {totalAnswered > 0 && score === totalAnswered ? "Perfect score!" : totalAnswered > 0 && score >= totalAnswered * 0.8 ? "Excellent!" : totalAnswered > 0 && score >= totalAnswered * 0.6 ? "Good job!" : "Keep practicing!"}
              </p>
            </div>
            <div className="space-y-2">
              {Object.entries(phaseScores).map(([phase, [c, t]]) => (
                <div key={phase} className="flex items-center justify-between text-sm px-4">
                  <span className="font-semibold" style={{ color: pc[phase] }}>{phase}</span>
                  <span className="font-bold">{c}/{t}</span>
                </div>
              ))}
            </div>
            <Button onClick={next} className="rounded-xl h-12 font-bold text-base px-8" style={{ backgroundColor: sectionColor }}>Complete Lesson <ChevronRight className="w-5 h-5 ml-1" /></Button>
          </motion.div>
        )}

        {/* COMPLETE */}
        {cur?.type === "complete" && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border p-8 card-shadow text-center space-y-5">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${sectionColor}20` }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: sectionColor }} />
            </div>
            <h2 className="text-2xl font-extrabold font-display">Lesson Complete!</h2>
            <p className="text-muted-foreground">{lesson.title}</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-1"><Zap className="w-5 h-5 text-amber-500" /><span className="font-bold text-amber-500">+{lesson.xp} XP</span></div>
              <div className="flex items-center gap-1"><Diamond className="w-5 h-5 text-blue-500" /><span className="font-bold text-blue-500">+15 Gems</span></div>
              <div className="flex items-center gap-1"><Target className="w-5 h-5 text-emerald-500" /><span className="font-bold text-emerald-500">{score}/{totalAnswered}</span></div>
            </div>
            <Button onClick={onBack} className="rounded-xl h-12 font-bold text-base px-8" style={{ backgroundColor: sectionColor }}>Back to Path</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPathModule;
