import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Trophy, Timer, RotateCcw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import OutOfHeartsModal from "@/components/OutOfHeartsModal";

const defaultQuizBank = [
  { q: "What is compound interest?", options: ["Interest on original only", "Interest on interest + principal", "A bank fee", "A tax deduction"], answer: 1, explanation: "Compound interest earns interest on both the original principal AND previously earned interest, creating exponential growth over time." },
  { q: "What's the credit score range?", options: ["0–500", "100–850", "300–850", "500–1000"], answer: 2, explanation: "FICO credit scores range from 300 to 850. A score above 740 is generally considered excellent." },
  { q: "What is the 50/30/20 rule?", options: ["Save 50%, spend 30%, invest 20%", "Needs 50%, wants 30%, savings 20%", "Taxes 50%, rent 30%, food 20%", "Invest all"], answer: 1, explanation: "The 50/30/20 rule allocates 50% of after-tax income to needs, 30% to wants, and 20% to savings/debt repayment." },
  { q: "What is an ETF?", options: ["Electronic Transfer", "Exchange-Traded Fund", "Extra Tax Filing", "Emergency Trust"], answer: 1, explanation: "An ETF (Exchange-Traded Fund) is a basket of securities that trades on a stock exchange, offering diversification at low cost." },
  { q: "Gross income is:", options: ["After-tax pay", "Before-tax pay", "Investment returns", "Net pay"], answer: 1, explanation: "Gross income is your total earnings before any taxes or deductions are taken out." },
  { q: "A W-2 form shows:", options: ["Credit score", "Annual earnings & taxes withheld", "Investment returns", "Loan balances"], answer: 1, explanation: "A W-2 form is provided by your employer and shows your annual wages and the amount of taxes withheld from your paycheck." },
  { q: "Debit cards pull money from:", options: ["A loan", "Your bank account", "Credit score", "Future earnings"], answer: 1, explanation: "Debit cards withdraw money directly from your bank checking account, unlike credit cards which extend a line of credit." },
  { q: "'Pay yourself first' means:", options: ["Buy a gift", "Save before spending", "Take an advance", "Pay bills first"], answer: 1, explanation: "Pay yourself first means automatically transferring money to savings before spending on anything else — making saving effortless." },
];

interface Props {
  lessonTitle: string;
  moduleQuestions?: { q: string; options: string[]; answer: number; explanation?: string }[];
  onComplete: () => void;
  onCancel: () => void;
}

const PASS_THRESHOLD = 0.8;

const CourseQuiz = ({ lessonTitle, moduleQuestions, onComplete, onCancel }: Props) => {
  const bank = moduleQuestions && moduleQuestions.length >= 5 ? moduleQuestions : defaultQuizBank;
  const [questions] = useState(() => [...bank].sort(() => Math.random() - 0.5).slice(0, 5));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { loseHeart, canDoLessons, isPro } = useGameEconomy();
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);

  const passed = score >= Math.ceil(questions.length * PASS_THRESHOLD);

  // Timer
  useEffect(() => {
    if (finished || selected !== null) return;
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, finished, selected]);

  // Confetti on pass
  useEffect(() => {
    if (finished && passed) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [finished, passed]);

  const handleAnswer = async (i: number) => {
    if (selected !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(i);
    const correct = i >= 0 && i === questions[current].answer;
    if (correct) {
      setScore(s => s + 1);
    } else {
      const hasHearts = await loseHeart();
      if (!hasHearts && !isPro) {
        setShowOutOfHearts(true);
        return;
      }
    }
    setTimeout(() => {
      if (current + 1 >= questions.length) setFinished(true);
      else { setCurrent(c => c + 1); setSelected(null); }
    }, 1200);
  };

  const retry = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
    setTimeLeft(15);
    setShowOutOfHearts(false);
  };

  const letterLabel = (i: number) => String.fromCharCode(65 + i);
  const starCount = score === questions.length ? 3 : passed ? 2 : 1;

  if (finished) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center space-y-5 animate-fade-in">
        {/* Stars */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map(s => (
            <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: passed && s <= starCount ? 1 : 0.4 }} transition={{ delay: s * 0.2, type: "spring" }}>
              <Trophy className={cn("w-10 h-10", passed && s <= starCount ? "text-amber-400" : "text-muted")} />
            </motion.div>
          ))}
        </div>

        <div>
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 mb-3">
            🏆 Unit Challenge
          </span>
          <p className="text-3xl font-extrabold font-display mt-2">{score}/{questions.length}</p>
          <p className={cn("text-sm font-bold mt-1", passed ? "text-emerald-600" : "text-red-500")}>
            {passed ? (score === questions.length ? "Perfect!" : "You passed!") : "Not quite — keep going"}
          </p>
        </div>

        {passed ? (
          <Button onClick={onComplete} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Continue <CheckCircle2 className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">You need {Math.ceil(questions.length * PASS_THRESHOLD)}/{questions.length} to pass this unit.</p>
            <Button onClick={retry} className="w-full">
              <RotateCcw className="w-4 h-4 mr-1" /> Try Again
            </Button>
            <Button variant="outline" onClick={onCancel} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
            </Button>
          </div>
        )}
      </div>
    );
  }

  const question = questions[current];
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
          🏆 Unit Challenge
        </span>
        <span className="text-xs font-medium text-muted-foreground">{lessonTitle}</span>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn(
          "h-full rounded-full transition-all duration-1000 ease-linear",
          timeLeft > 10 ? "bg-emerald-500" : timeLeft > 5 ? "bg-amber-500" : "bg-red-500"
        )} style={{ width: `${(timeLeft / 15) * 100}%` }} />
      </div>

      {/* Question dots */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div key={i} className={cn("w-2.5 h-2.5 rounded-full", i < current ? "bg-amber-500" : i === current ? "bg-amber-400/50" : "bg-muted")} />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Timer className={cn("w-3.5 h-3.5", timeLeft <= 5 ? "text-red-500" : "text-muted-foreground")} />
          <span className={cn("text-xs font-bold tabular-nums", timeLeft <= 5 ? "text-red-500" : "text-muted-foreground")}>{timeLeft}s</span>
        </div>
      </div>

      <p className="text-sm font-semibold">{question.q}</p>

      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(i)} disabled={selected !== null}
            className={cn(
              "w-full text-left rounded-xl p-3.5 text-sm transition-all border-2",
              selected === null ? "border-border bg-card hover:border-amber-400/40" : "",
              selected === i && i === question.answer ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "",
              selected === i && i !== question.answer ? "border-red-400 bg-red-50 dark:bg-red-950/20" : "",
              selected !== null && i === question.answer && selected !== i ? "border-emerald-400/50" : ""
            )}>
            <span className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">{letterLabel(i)}</span>
              {opt}
            </span>
          </button>
        ))}
      </div>

      {/* Explanation on answer */}
      {selected !== null && question.explanation && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3 bg-muted/50 border border-border">
          <p className="text-xs text-foreground/70">{question.explanation}</p>
        </motion.div>
      )}

      <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
        Cancel Quiz
      </Button>
    </div>
  );
};

export default CourseQuiz;
