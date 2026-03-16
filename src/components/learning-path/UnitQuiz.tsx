import { useState } from "react";
import { ArrowLeft, Award, CheckCircle2, XCircle, Trophy, Zap, Heart, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

interface Props {
  unitTitle: string;
  questions: QuizQuestion[];
  sectionColor: string;
  isCompleted: boolean;
  onComplete: () => void;
  onBack: () => void;
}

const UnitQuiz = ({ unitTitle, questions, sectionColor, isCompleted, onComplete, onBack }: Props) => {
  const { hearts, maxHearts, canDoLessons, loseHeart, earnGems } = useGameEconomy();
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [finished, setFinished] = useState(isCompleted);
  const [outOfHearts, setOutOfHearts] = useState(false);

  const handleAnswer = async (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[currentQ].answer;
    if (correct) {
      setScore(s => s + 1);
    } else {
      await loseHeart();
      // Track the mistake
      if (user) {
        try {
          await supabase.from("user_mistakes").insert({
            user_id: user.id,
            question_text: questions[currentQ].q,
            correct_answer: questions[currentQ].options[questions[currentQ].answer],
            user_answer: questions[currentQ].options[idx],
            topic: unitTitle,
          });
        } catch (_) {}
      }
      // Check if out of hearts after losing
      if (hearts - 1 <= 0) {
        setOutOfHearts(true);
        return;
      }
    }
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        const finalScore = score + (correct ? 1 : 0);
        if (finalScore >= 4) {
          setFinished(true);
          if (!isCompleted) {
            onComplete();
            earnGems(10);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'] });
          }
        } else {
          setFinished(true);
        }
      } else {
        setCurrentQ(c => c + 1);
        setSelected(null);
      }
    }, 1200);
  };

  const retry = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setAnswers(Array(questions.length).fill(null));
    setFinished(false);
    setOutOfHearts(false);
  };

  // Out of hearts screen
  if (outOfHearts || (!canDoLessons && !isCompleted && !finished)) {
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

  const passed = score >= 4 || isCompleted;

  if (finished) {
    return (
      <div className="max-w-lg mx-auto">
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to path
        </button>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl border border-border p-8 card-shadow text-center space-y-5">
          {passed ? (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}>
                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-emerald-500">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-extrabold font-display">Unit Complete!</h2>
              <p className="text-muted-foreground">You passed the <strong>{unitTitle}</strong> quiz!</p>
              <div className="flex justify-center gap-3">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Award className="w-5 h-5" /> Certificate Earned!
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-lg bg-cyan-50 text-cyan-600 border border-cyan-200">
                  <Diamond className="w-5 h-5 fill-cyan-500" /> +10 Gems
                </motion.div>
              </div>
              <div className="pt-2">
                <p className="text-sm font-bold text-muted-foreground mb-1">{score}/{questions.length} correct</p>
                <Button onClick={onBack} variant="outline" className="rounded-xl font-bold">
                  Back to Learning Path
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-red-100">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-extrabold font-display">Not Quite!</h2>
              <p className="text-muted-foreground">You scored <strong>{score}/{questions.length}</strong>. You need at least 4/5 to earn the certificate.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={retry} className="rounded-xl font-bold" style={{ backgroundColor: sectionColor }}>
                  Try Again
                </Button>
                <Button onClick={onBack} variant="outline" className="rounded-xl font-bold">
                  Back to Path
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQ];

  return (
    <div className="max-w-lg mx-auto">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to path
      </button>

      {/* Hearts display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <Heart key={i} className={cn("w-6 h-6 transition-all", i < hearts ? "text-red-500 fill-red-500" : "text-muted-foreground/30")} />
          ))}
        </div>
        <span className="text-xs font-bold" style={{ color: sectionColor }}>Question {currentQ + 1}/{questions.length}</span>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">{unitTitle} — Unit Quiz</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ backgroundColor: sectionColor }}
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" style={{ color: sectionColor }} />
            <h2 className="text-lg font-extrabold font-display">Question {currentQ + 1}</h2>
          </div>
          <p className="text-sm font-semibold">{question.q}</p>
          <div className="space-y-2">
            {question.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
                className={cn(
                  "w-full text-left rounded-xl p-4 text-sm font-semibold transition-all border-2",
                  selected === null ? "border-border hover:border-primary/40 bg-card" : "",
                  selected === i && i === question.answer ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "",
                  selected === i && i !== question.answer ? "border-red-400 bg-red-50 text-red-700" : "",
                  selected !== null && i === question.answer && selected !== i ? "border-emerald-300 bg-emerald-50/50" : ""
                )}>
                <span className="flex items-center gap-3">
                  <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    selected === i && i === question.answer ? "bg-emerald-500 text-white" :
                    selected === i && i !== question.answer ? "bg-red-400 text-white" :
                    "bg-muted text-muted-foreground"
                  )}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default UnitQuiz;
