import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";

const quizBank = [
  { q: "What is compound interest?", options: ["Interest on original only", "Interest on interest + principal", "A bank fee", "A tax deduction"], answer: 1 },
  { q: "What's the credit score range?", options: ["0–500", "100–850", "300–850", "500–1000"], answer: 2 },
  { q: "What is the 50/30/20 rule?", options: ["Save 50%, spend 30%, invest 20%", "Needs 50%, wants 30%, savings 20%", "Taxes 50%, rent 30%, food 20%", "Invest all"], answer: 1 },
  { q: "What is an ETF?", options: ["Electronic Transfer", "Exchange-Traded Fund", "Extra Tax Filing", "Emergency Trust"], answer: 1 },
  { q: "Gross income is:", options: ["After-tax pay", "Before-tax pay", "Investment returns", "Net pay"], answer: 1 },
  { q: "A W-2 form shows:", options: ["Credit score", "Annual earnings", "Investment returns", "Loan balances"], answer: 1 },
  { q: "Debit cards pull money from:", options: ["A loan", "Your bank account", "Credit score", "Future earnings"], answer: 1 },
  { q: "'Pay yourself first' means:", options: ["Buy a gift", "Save before spending", "Take an advance", "Pay bills first"], answer: 1 },
];

interface Props {
  lessonTitle: string;
  onComplete: () => void;
  onCancel: () => void;
}

const CourseQuiz = ({ lessonTitle, onComplete, onCancel }: Props) => {
  // Pick 3 random questions
  const [questions] = useState(() => [...quizBank].sort(() => Math.random() - 0.5).slice(0, 3));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[current].answer) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= questions.length) setFinished(true);
      else { setCurrent(c => c + 1); setSelected(null); }
    }, 1000);
  };

  if (finished) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <Trophy className="w-12 h-12 text-gold mx-auto mb-3" />
        <h3 className="text-xl font-bold font-display mb-1">Quiz Complete!</h3>
        <p className="text-muted-foreground mb-2">{lessonTitle}</p>
        <p className="text-lg font-bold mb-4">
          <span className="text-primary">{score}/{questions.length}</span> correct
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={onComplete}>Complete Lesson</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  const question = questions[current];
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sm text-primary">Quiz: {lessonTitle}</h3>
        <span className="text-xs text-muted-foreground">Q{current + 1}/{questions.length}</span>
      </div>
      <p className="font-semibold mb-4">{question.q}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={selected !== null}
            className={cn(
              "w-full text-left rounded-lg p-3 text-sm transition-all border",
              selected === null ? "glass hover:border-primary/40" : "",
              selected === i && i === question.answer ? "border-primary bg-primary/10" : "",
              selected === i && i !== question.answer ? "border-destructive bg-destructive/10" : "",
              selected !== null && i === question.answer && selected !== i ? "border-primary/30" : ""
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel Quiz</Button>
      </div>
    </div>
  );
};

export default CourseQuiz;
