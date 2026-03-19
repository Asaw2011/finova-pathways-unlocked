import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Zap, BookOpen, HelpCircle, Lightbulb, Quote, BarChart3, ChevronRight, Heart, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Link } from "react-router-dom";

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

interface LessonData {
  id: string;
  title: string;
  xp: number;
  content: string;
  takeaway: string;
  quote?: { text: string; author: string };
  example?: string;
  quiz: QuizQuestion[];
}

interface Props {
  lesson: LessonData;
  moduleName: string;
  sectionColor: string;
  isCompleted: boolean;
  onComplete: () => void;
  onBack: () => void;
  isPending: boolean;
}

const LearningPathModule = ({ lesson, moduleName, sectionColor, isCompleted, onComplete, onBack, isPending }: Props) => {
  const { hearts, maxHearts, canDoLessons, loseHeart, earnGems } = useGameEconomy();
  const STEPS = ["Concept", "Example", "Quiz 1", "Quiz 2", "Takeaway", "Complete"];
  const completedStep = STEPS.length - 1;

  const [step, setStep] = useState(isCompleted ? completedStep : 0);
  const [quiz1Answer, setQuiz1Answer] = useState<number | null>(null);
  const [quiz2Answer, setQuiz2Answer] = useState<number | null>(null);
  const [quiz1Correct, setQuiz1Correct] = useState(false);
  const [quiz2Correct, setQuiz2Correct] = useState(false);
  const [outOfHearts, setOutOfHearts] = useState(false);

  useEffect(() => {
    if (step === completedStep && !isCompleted) {
      onComplete();
      earnGems(10);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'] });
    }
  }, [step]);

  const quizStep1 = 2;
  const quizStep2 = 3;
  const takeawayStep = 4;

  const handleQuiz1 = async (idx: number) => {
    if (quiz1Answer !== null) return;
    setQuiz1Answer(idx);
    const correct = idx === lesson.quiz[0].answer;
    setQuiz1Correct(correct);
    if (correct) {
      setTimeout(() => setStep(quizStep2), 1000);
    } else {
      await loseHeart();
      if (hearts - 1 <= 0) setOutOfHearts(true);
    }
  };

  const handleQuiz2 = async (idx: number) => {
    if (quiz2Answer !== null) return;
    setQuiz2Answer(idx);
    const correct = idx === lesson.quiz[1].answer;
    setQuiz2Correct(correct);
    if (correct) {
      setTimeout(() => setStep(takeawayStep), 1000);
    } else {
      await loseHeart();
      if (hearts - 1 <= 0) setOutOfHearts(true);
    }
  };

  // Out of hearts
  if (outOfHearts || (!canDoLessons && !isCompleted && step < completedStep)) {
    return (
      <div className="max-w-lg mx-auto">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to path
        </button>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl border border-border p-8 card-shadow text-center space-y-5">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-red-100">
            <Heart className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-extrabold font-display">Out of Hearts!</h2>
          <p className="text-muted-foreground">You've run out of hearts. Get more to continue learning.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/shop">
              <Button className="rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white">
                <Heart className="w-4 h-4 mr-2 fill-white" /> Get Hearts
              </Button>
            </Link>
            <Button onClick={onBack} variant="outline" className="rounded-xl font-bold">
              Back to Path
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to path
      </button>

      {/* Hearts display */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <Heart key={i} className={cn("w-5 h-5 transition-all", i < hearts ? "text-red-500 fill-red-500" : "text-muted-foreground/30")} />
          ))}
        </div>
        <span className="text-xs font-bold" style={{ color: sectionColor }}>Step {Math.min(step + 1, STEPS.length)}/{STEPS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">{moduleName}</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: sectionColor }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Concept */}
        {step === 0 && (
          <motion.div key="concept" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" style={{ color: sectionColor }} />
              <h2 className="text-xl font-extrabold font-display">{lesson.title}</h2>
            </div>
            <div className="text-sm text-foreground/80 leading-relaxed space-y-3">
              {lesson.content.split(". ").reduce((acc: string[][], sentence, i, arr) => {
                const ci = Math.floor(i / 2);
                if (!acc[ci]) acc[ci] = [];
                acc[ci].push(sentence + (i < arr.length - 1 ? "." : ""));
                return acc;
              }, []).map((chunk, i) => <p key={i}>{chunk.join(" ")}</p>)}
            </div>
            {lesson.quote && (
              <div className="rounded-xl bg-muted/50 p-4 border-l-4" style={{ borderColor: sectionColor }}>
                <Quote className="w-4 h-4 text-muted-foreground mb-2" />
                <p className="text-sm italic text-foreground/70">"{lesson.quote.text}"</p>
                <p className="text-xs font-semibold text-muted-foreground mt-1">— {lesson.quote.author}</p>
              </div>
            )}
            <Button onClick={() => setStep(1)} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
              Continue <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Example */}
        {step === 1 && (
          <motion.div key="example" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" style={{ color: sectionColor }} />
              <h2 className="text-xl font-extrabold font-display">Real-World Example</h2>
            </div>
            {lesson.example && (
              <div className="rounded-xl p-4 border-2" style={{ borderColor: sectionColor, backgroundColor: `${sectionColor}10` }}>
                <p className="text-sm leading-relaxed">{lesson.example}</p>
              </div>
            )}
            <Button onClick={() => setStep(quizStep1)} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
              Test Your Knowledge <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Quiz 1 */}
        {step === quizStep1 && lesson.quiz[0] && (
          <motion.div key="quiz1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" style={{ color: sectionColor }} />
              <h2 className="text-xl font-extrabold font-display">Quick Check</h2>
            </div>
            <p className="text-sm font-semibold">{lesson.quiz[0].q}</p>
            <div className="space-y-2">
              {lesson.quiz[0].options.map((opt, i) => (
                <button key={i} onClick={() => handleQuiz1(i)}
                  className={cn("w-full text-left rounded-xl border-2 p-3 text-sm font-semibold transition-all",
                    quiz1Answer === null && "border-border hover:border-primary/30 bg-card",
                    quiz1Answer === i && quiz1Correct && "border-emerald-500 bg-emerald-50",
                    quiz1Answer === i && !quiz1Correct && "border-red-400 bg-red-50",
                    quiz1Answer !== null && i === lesson.quiz[0].answer && quiz1Answer !== i && "border-emerald-300"
                  )}>{opt}</button>
              ))}
            </div>
            {quiz1Answer !== null && !quiz1Correct && (
              <div className="text-center space-y-2">
                <p className="text-sm text-destructive font-bold">Incorrect — you lost a heart! Try again.</p>
                <Button onClick={() => { setQuiz1Answer(null); setQuiz1Correct(false); }} variant="outline" className="rounded-xl">
                  Retry
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Quiz 2 */}
        {step === quizStep2 && lesson.quiz[1] && (
          <motion.div key="quiz2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" style={{ color: sectionColor }} />
              <h2 className="text-xl font-extrabold font-display">One More!</h2>
            </div>
            <p className="text-sm font-semibold">{lesson.quiz[1].q}</p>
            <div className="space-y-2">
              {lesson.quiz[1].options.map((opt, i) => (
                <button key={i} onClick={() => handleQuiz2(i)}
                  className={cn("w-full text-left rounded-xl border-2 p-3 text-sm font-semibold transition-all",
                    quiz2Answer === null && "border-border hover:border-primary/30 bg-card",
                    quiz2Answer === i && quiz2Correct && "border-emerald-500 bg-emerald-50",
                    quiz2Answer === i && !quiz2Correct && "border-red-400 bg-red-50",
                    quiz2Answer !== null && i === lesson.quiz[1].answer && quiz2Answer !== i && "border-emerald-300"
                  )}>{opt}</button>
              ))}
            </div>
            {quiz2Answer !== null && !quiz2Correct && (
              <div className="text-center space-y-2">
                <p className="text-sm text-destructive font-bold">Incorrect — you lost a heart! Try again.</p>
                <Button onClick={() => { setQuiz2Answer(null); setQuiz2Correct(false); }} variant="outline" className="rounded-xl">
                  Retry
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Takeaway */}
        {step === takeawayStep && (
          <motion.div key="takeaway" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: sectionColor }} />
              <h2 className="text-xl font-extrabold font-display">Key Takeaway</h2>
            </div>
            <div className="rounded-xl p-5 text-center" style={{ backgroundColor: `${sectionColor}15` }}>
              <p className="text-base font-bold" style={{ color: sectionColor }}>{lesson.takeaway}</p>
            </div>
            <Button onClick={() => setStep(completedStep)} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
              Complete Lesson <CheckCircle2 className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Complete */}
        {step === completedStep && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border p-8 card-shadow text-center space-y-5">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: `${sectionColor}20` }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: sectionColor }} />
            </div>
            <h2 className="text-2xl font-extrabold font-display">Lesson Complete!</h2>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <Zap className="w-5 h-5 text-duo-gold" />
                <span className="font-bold text-duo-gold">+{lesson.xp} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Diamond className="w-5 h-5 text-duo-blue" />
                <span className="font-bold text-duo-blue">+10 Gems</span>
              </div>
            </div>
            <Button onClick={onBack} className="rounded-xl h-12 font-bold text-base px-8" style={{ backgroundColor: sectionColor }}>
              Back to Path
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPathModule;
