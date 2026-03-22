import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, CheckCircle2, Zap, BookOpen, HelpCircle, Lightbulb, Quote, ChevronRight, Heart, Diamond, Brain, Target, Sparkles, TrendingUp, AlertCircle, BarChart3, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Link } from "react-router-dom";

interface QuizQuestion { q: string; options: string[]; answer: number; }
interface LessonData { id: string; title: string; xp: number; content: string; takeaway: string; quote?: { text: string; author: string }; example?: string; quiz: QuizQuestion[]; }
interface Props { lesson: LessonData; moduleName: string; sectionColor: string; isCompleted: boolean; onComplete: () => void; onBack: () => void; isPending: boolean; }

function reshuffleQuestion(q: QuizQuestion, seed: number): QuizQuestion {
  const indices = [0, 1, 2, 3].filter(i => i < q.options.length);
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const newOptions = indices.map(i => q.options[i]);
  const newAnswer = indices.indexOf(q.answer);
  return { q: q.q, options: newOptions, answer: newAnswer };
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

const TOTAL_STEPS = 50;

type StepType =
  | { type: "read"; title: string; text: string; hint?: string; phase: string }
  | { type: "quote"; text: string; author: string; phase: string }
  | { type: "example"; text: string; phase: string }
  | { type: "insight"; title: string; text: string; phase: string }
  | { type: "quiz"; question: QuizQuestion; qNum: number; qTotal: number; phase: string }
  | { type: "explanation"; question: QuizQuestion; phase: string }
  | { type: "checkpoint"; title: string; phase: string }
  | { type: "takeaway"; text: string; phase: string }
  | { type: "review-wrong"; phase: string }
  | { type: "summary"; phase: string }
  | { type: "complete"; phase: string };

const LearningPathModule = ({ lesson, moduleName, sectionColor, isCompleted, onComplete, onBack }: Props) => {
  const { hearts, maxHearts, canDoLessons, loseHeart, earnGems } = useGameEconomy();

  const { steps } = useMemo(() => {
    const sentences = (lesson.content.match(/[^.!?]+[.!?]+/g) || [lesson.content]).map(s => s.trim()).filter(Boolean);
    const allQ = getQuestions(lesson.quiz, 15);
    const s: StepType[] = [];

    // PHASE 1: LEARN (12 steps)
    for (let i = 0; i < Math.min(6, sentences.length); i++) {
      s.push({
        type: "read", phase: "Learn",
        title: i === 0 ? lesson.title : "Keep Reading",
        text: sentences[i],
        hint: i === 0 ? "Read carefully — every detail matters for the quiz ahead." : i === 2 ? "Halfway through the reading. Stay focused!" : undefined,
      });
    }

    if (lesson.quote) {
      s.push({ type: "quote", text: lesson.quote.text, author: lesson.quote.author, phase: "Learn" });
    } else {
      s.push({ type: "insight", title: "Key Point", text: lesson.takeaway, phase: "Learn" });
    }

    s.push({ type: "insight", title: "Comprehension Check", text: `Let's see if you understood the key concepts from "${lesson.title}". Answer based on what you just read.`, phase: "Learn" });
    s.push({ type: "quiz", question: allQ[0], qNum: 1, qTotal: 2, phase: "Learn" });
    s.push({ type: "explanation", question: allQ[0], phase: "Learn" });
    s.push({ type: "quiz", question: allQ[1], qNum: 2, qTotal: 2, phase: "Learn" });
    s.push({ type: "checkpoint", title: "Learn Phase Complete", phase: "Learn" });

    // PHASE 2: APPLY (12 steps)
    s.push({ type: "insight", title: "Apply to Real Life", text: "Now let's connect the theory to practice. You'll see a real scenario with actual numbers, then prove you can apply the concept.", phase: "Apply" });
    s.push({ type: "example", text: lesson.example || `Here's how "${lesson.title}" works in practice: ${lesson.takeaway}`, phase: "Apply" });

    for (let i = 6; i < Math.min(9, sentences.length); i++) {
      s.push({ type: "read", title: "Going Deeper", text: sentences[i], phase: "Apply" });
    }
    while (s.length < 17) {
      s.push({ type: "read", title: "Understanding the Details", text: lesson.takeaway + " This is a fundamental concept that affects how you handle money every day.", phase: "Apply" });
    }

    s.push({ type: "insight", title: "Scenario Questions", text: "These questions test whether you can apply what you learned to real financial situations. Think through each one carefully.", phase: "Apply" });
    s.push({ type: "quiz", question: allQ[2], qNum: 1, qTotal: 3, phase: "Apply" });
    s.push({ type: "explanation", question: allQ[2], phase: "Apply" });
    s.push({ type: "quiz", question: allQ[3], qNum: 2, qTotal: 3, phase: "Apply" });
    s.push({ type: "explanation", question: allQ[3], phase: "Apply" });
    s.push({ type: "quiz", question: allQ[4], qNum: 3, qTotal: 3, phase: "Apply" });
    s.push({ type: "checkpoint", title: "Apply Phase Complete", phase: "Apply" });

    // PHASE 3: PRACTICE (14 steps)
    s.push({ type: "insight", title: "Practice Round", text: "Answer 6 questions to build confidence. After each answer, you'll see the correct reasoning. Speed and accuracy both matter!", phase: "Practice" });

    for (let i = 0; i < 6; i++) {
      s.push({ type: "quiz", question: allQ[5 + i], qNum: i + 1, qTotal: 6, phase: "Practice" });
      s.push({ type: "explanation", question: allQ[5 + i], phase: "Practice" });
    }

    s.push({ type: "checkpoint", title: "Practice Phase Complete", phase: "Practice" });

    // PHASE 4: MASTER (8 steps)
    s.push({ type: "takeaway", text: lesson.takeaway, phase: "Master" });
    s.push({ type: "insight", title: "Mastery Challenge", text: "Final round — 4 challenge questions with no hints. Prove you've truly mastered this concept. Your score here determines your final grade.", phase: "Master" });

    for (let i = 0; i < 4; i++) {
      s.push({ type: "quiz", question: allQ[11 + i], qNum: i + 1, qTotal: 4, phase: "Master" });
    }

    s.push({ type: "insight", title: "Lesson Mastered", text: `You've completed all four phases for "${lesson.title}". Let's review your performance.`, phase: "Master" });
    s.push({ type: "checkpoint", title: "Master Phase Complete", phase: "Master" });

    // PHASE 5: RESULTS (4 steps)
    s.push({ type: "review-wrong", phase: "Results" });
    s.push({ type: "takeaway", text: lesson.takeaway, phase: "Results" });
    s.push({ type: "summary", phase: "Results" });
    s.push({ type: "complete", phase: "Results" });

    while (s.length < TOTAL_STEPS) {
      s.splice(s.length - 2, 0, { type: "insight", title: "Remember", text: sentences[s.length % sentences.length] || lesson.takeaway, phase: "Results" });
    }
    if (s.length > TOTAL_STEPS) s.length = TOTAL_STEPS;

    return { steps: s };
  }, [lesson]);

  const [step, setStep] = useState(isCompleted ? TOTAL_STEPS - 1 : 0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<{ q: QuizQuestion; yourAnswer: number }[]>([]);
  const [phaseScores, setPhaseScores] = useState<Record<string, number[]>>({});
  const [outOfHearts, setOutOfHearts] = useState(false);

  const cur = steps[step];
  const pct = ((step + 1) / TOTAL_STEPS) * 100;

  useEffect(() => {
    if (step === TOTAL_STEPS - 1 && !isCompleted && cur?.type === "complete") {
      onComplete();
      earnGems(15);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'] });
    }
  }, [step]);

  const doAnswer = async (idx: number) => {
    if (answer !== null || cur?.type !== "quiz") return;
    setAnswer(idx);
    const correct = idx === cur.question.answer;
    setIsCorrect(correct);
    setTotalAnswered(t => t + 1);
    const phase = cur.phase;
    setPhaseScores(prev => ({ ...prev, [phase]: [(prev[phase]?.[0] || 0) + (correct ? 1 : 0), (prev[phase]?.[1] || 0) + 1] }));

    if (correct) {
      setScore(s => s + 1);
      setTimeout(() => { setAnswer(null); setIsCorrect(null); setStep(s => s + 1); }, 1200);
    } else {
      setWrongAnswers(prev => [...prev, { q: cur.question, yourAnswer: idx }]);
      await loseHeart();
      if (hearts - 1 <= 0) setOutOfHearts(true);
    }
  };

  const retry = () => { setAnswer(null); setIsCorrect(null); };
  const next = () => { setAnswer(null); setIsCorrect(null); setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)); };

  if (outOfHearts || (!canDoLessons && !isCompleted && step < TOTAL_STEPS - 1)) {
    return (
      <div className="max-w-lg mx-auto">
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
            <Link to="/shop">
              <Button className="rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                <Heart className="w-4 h-4 mr-2 fill-current" /> Get Hearts
              </Button>
            </Link>
            <Button onClick={onBack} variant="outline" className="rounded-xl font-bold">Back</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const anim = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };
  const pc: Record<string, string> = { Learn: "#3b82f6", Apply: "#f59e0b", Practice: "#8b5cf6", Master: "#ef4444", Results: "#22c55e" };

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to path
      </button>

      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <Heart key={i} className={cn("w-5 h-5 transition-all", i < hearts ? "text-destructive fill-destructive" : "text-muted-foreground/30")} />
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span style={{ color: pc[cur?.phase || "Learn"] }}>{cur?.phase}</span>
          <span className="text-muted-foreground">{step + 1}/{TOTAL_STEPS}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: sectionColor }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className="font-semibold text-muted-foreground">{moduleName} · {lesson.title}</span>
        <span className="font-bold text-foreground">{score}/{totalAnswered}</span>
      </div>

      <AnimatePresence mode="wait">
        {cur?.type === "read" && (
          <motion.div key={`read-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><BookOpen className="w-5 h-5" style={{ color: pc[cur.phase] }} /><h2 className="text-xl font-extrabold font-display">{cur.title}</h2></div>
            <p className="text-sm text-foreground/80 leading-relaxed">{cur.text}</p>
            {cur.hint && <p className="text-xs text-muted-foreground italic flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {cur.hint}</p>}
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>Continue <ChevronRight className="w-5 h-5 ml-1" /></Button>
          </motion.div>
        )}

        {cur?.type === "quote" && (
          <motion.div key={`quote-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><Quote className="w-5 h-5" style={{ color: pc[cur.phase] }} /><h2 className="text-xl font-extrabold font-display">Words of Wisdom</h2></div>
            <div className="rounded-xl bg-muted/50 p-5 border-l-4" style={{ borderColor: pc[cur.phase] }}>
              <p className="text-base italic text-foreground/80">"{cur.text}"</p>
              <p className="text-sm font-semibold text-muted-foreground mt-2">— {cur.author}</p>
            </div>
            <p className="text-xs text-muted-foreground italic">Reflect: How does this connect to what you just read? Think about how you'd apply this to your own money.</p>
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>Continue <ChevronRight className="w-5 h-5 ml-1" /></Button>
          </motion.div>
        )}

        {cur?.type === "example" && (
          <motion.div key={`example-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><Lightbulb className="w-5 h-5" style={{ color: pc[cur.phase] }} /><h2 className="text-xl font-extrabold font-display">Real-World Scenario</h2></div>
            <div className="rounded-xl p-4 border-2" style={{ borderColor: pc[cur.phase], backgroundColor: `${pc[cur.phase]}10` }}>
              <p className="text-sm leading-relaxed">{cur.text}</p>
            </div>
            <p className="text-xs text-muted-foreground italic">Pay attention to the numbers. You'll be asked about this scenario in the next quiz.</p>
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>Got It <ChevronRight className="w-5 h-5 ml-1" /></Button>
          </motion.div>
        )}

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
              <div className="text-center">
                <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Correct!</p>
              </div>
            )}
            {answer !== null && isCorrect === false && (
              <div className="text-center space-y-2">
                <div>
                  <p className="text-sm text-destructive font-bold flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4" /> Incorrect — lost a heart</p>
                  <p className="text-xs text-muted-foreground mt-1">Correct: {cur.question.options[cur.question.answer]}</p>
                </div>
                <Button onClick={retry} variant="outline" className="rounded-xl">Try Again</Button>
              </div>
            )}
          </motion.div>
        )}

        {cur?.type === "explanation" && (
          <motion.div key={`explain-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><Lightbulb className="w-5 h-5" style={{ color: pc[cur.phase] }} /><h2 className="text-xl font-extrabold font-display">Why This Matters</h2></div>
            <div className="rounded-xl p-4 bg-muted/30 space-y-3">
              <p className="text-sm font-semibold">{cur.question.q}</p>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground">Correct Answer:</p>
                  <p className="text-sm font-semibold">{cur.question.options[cur.question.answer]}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Reasoning: The answer "{cur.question.options[cur.question.answer]}" is correct because it directly applies the financial concept taught in this lesson. Understanding this helps you make smarter decisions with your money in real life.</p>
                <p>The other options are incorrect because they either contradict fundamental financial principles, represent common misconceptions, or don't apply to this situation.</p>
              </div>
            </div>
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>Next <ChevronRight className="w-5 h-5 ml-1" /></Button>
          </motion.div>
        )}

        {cur?.type === "checkpoint" && (
          <motion.div key={`checkpoint-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-8 card-shadow text-center space-y-5">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${pc[cur.phase]}20` }}>
              <Award className="w-8 h-8" style={{ color: pc[cur.phase] }} />
            </div>
            <h2 className="text-2xl font-extrabold font-display">{cur.title}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-black" style={{ color: pc[cur.phase] }}>{phaseScores[cur.phase]?.[0] || 0}/{phaseScores[cur.phase]?.[1] || 0}</span>
              <span className="text-sm text-muted-foreground">correct answers</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {(phaseScores[cur.phase]?.[0] || 0) === (phaseScores[cur.phase]?.[1] || 0) && (phaseScores[cur.phase]?.[1] || 0) > 0
                ? "Perfect! You nailed this phase." : "Good work — keep pushing forward."}
            </p>
            <Button onClick={next} className="rounded-xl h-12 font-bold text-base px-8" style={{ backgroundColor: sectionColor }}>
              {cur.phase === "Master" ? "See Results" : "Next Phase"} <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {cur?.type === "takeaway" && (
          <motion.div key={`takeaway-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><Zap className="w-5 h-5" style={{ color: sectionColor }} /><h2 className="text-xl font-extrabold font-display">Key Takeaway</h2></div>
            <div className="rounded-xl p-5 text-center" style={{ backgroundColor: `${sectionColor}15` }}>
              <Target className="w-6 h-6 mx-auto mb-2" style={{ color: sectionColor }} />
              <p className="text-base font-bold" style={{ color: sectionColor }}>{cur.text}</p>
            </div>
            <p className="text-xs text-muted-foreground italic text-center">Write this down or save it. This is the single most important lesson from this topic.</p>
            <Button onClick={next} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>Continue <ChevronRight className="w-5 h-5 ml-1" /></Button>
          </motion.div>
        )}

        {cur?.type === "review-wrong" && (
          <motion.div key={`review-${step}`} {...anim} className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-4">
            <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-destructive" /><h2 className="text-xl font-extrabold font-display">Review Your Mistakes</h2></div>
            {wrongAnswers.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-emerald-600">No mistakes! You got every question right.</p>
              </div>
            ) : (
              <div className="space-y-3">
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

        {cur?.type === "complete" && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border p-8 card-shadow text-center space-y-5">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${sectionColor}20` }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: sectionColor }} />
            </div>
            <h2 className="text-2xl font-extrabold font-display">Lesson Complete!</h2>
            <p className="text-muted-foreground">{lesson.title}</p>
            <div className="flex items-center justify-center gap-4">
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
