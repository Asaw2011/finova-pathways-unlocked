import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, BookOpen, Lightbulb, Brain, Trophy } from "lucide-react";

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
  onComplete: (passed: boolean, score: number) => void;
  onCancel: () => void;
}

type Phase = "intro" | "example" | "practice" | "quiz" | "result";

const phaseLabels: Record<string, { label: string; icon: typeof BookOpen }> = {
  intro: { label: "Concept", icon: BookOpen },
  example: { label: "Example", icon: Lightbulb },
  practice: { label: "Practice", icon: Brain },
  quiz: { label: "Quiz", icon: Trophy },
};

const LessonExperience = ({ content, lessonTitle, onComplete, onCancel }: Props) => {
  const [phase, setPhase] = useState<Phase>("intro");
  const [exampleAnswer, setExampleAnswer] = useState<number | null>(null);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState<number | null>(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const phases: Phase[] = ["intro", "example", "practice", "quiz"];
  const currentPhaseIdx = phases.indexOf(phase === "result" ? "quiz" : phase);

  const handleExampleAnswer = (i: number) => {
    if (exampleAnswer !== null) return;
    setExampleAnswer(i);
  };

  const handlePracticeAnswer = (i: number) => {
    if (practiceAnswer !== null) return;
    setPracticeAnswer(i);
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
    setQuizAnswer(i);
    const isCorrect = i === content.quiz[quizIdx].correct;
    if (isCorrect) setQuizScore(s => s + 1);
    setTimeout(() => {
      if (quizIdx + 1 >= content.quiz.length) {
        setQuizFinished(true);
        setPhase("result");
      } else {
        setQuizIdx(q => q + 1);
        setQuizAnswer(null);
      }
    }, 1200);
  };

  const passed = quizScore >= Math.ceil(content.quiz.length * 0.7);

  const restart = () => {
    setPhase("intro");
    setExampleAnswer(null);
    setPracticeIdx(0);
    setPracticeAnswer(null);
    setQuizIdx(0);
    setQuizAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
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

      <div className="glass rounded-xl p-5">
        <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wide">{lessonTitle}</p>

        {/* INTRO */}
        {phase === "intro" && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">{content.intro}</p>
            <Button onClick={() => setPhase("example")} className="w-full">
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* EXAMPLE */}
        {phase === "example" && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed italic text-muted-foreground">{content.example.scenario}</p>
            <p className="text-sm font-semibold">{content.example.question}</p>
            <div className="space-y-2">
              {content.example.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleAnswer(i)}
                  disabled={exampleAnswer !== null}
                  className={cn(
                    "w-full text-left rounded-lg p-3 text-sm transition-all border",
                    exampleAnswer === null ? "bg-card hover:border-primary/40 border-border" : "",
                    exampleAnswer === i && i === content.example.correct ? "border-primary bg-primary/10" : "",
                    exampleAnswer === i && i !== content.example.correct ? "border-destructive bg-destructive/10" : "",
                    exampleAnswer !== null && i === content.example.correct && exampleAnswer !== i ? "border-primary/30" : ""
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            {exampleAnswer !== null && (
              <div className="p-3 rounded-lg bg-muted text-sm">
                {exampleAnswer === content.example.correct
                  ? <p className="text-primary font-medium">✓ Correct!</p>
                  : <p className="text-destructive font-medium">✗ Not quite.</p>
                }
                <p className="mt-1 text-muted-foreground">{content.example.explanation}</p>
              </div>
            )}
            {exampleAnswer !== null && (
              <Button onClick={() => setPhase("practice")} className="w-full">
                Continue to Practice <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* PRACTICE */}
        {phase === "practice" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground font-bold">Practice {practiceIdx + 1}/{content.practice.length}</p>
            </div>
            <p className="text-sm font-semibold">{content.practice[practiceIdx].question}</p>
            <div className="space-y-2">
              {content.practice[practiceIdx].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handlePracticeAnswer(i)}
                  disabled={practiceAnswer !== null}
                  className={cn(
                    "w-full text-left rounded-lg p-3 text-sm transition-all border",
                    practiceAnswer === null ? "bg-card hover:border-primary/40 border-border" : "",
                    practiceAnswer === i && i === content.practice[practiceIdx].correct ? "border-primary bg-primary/10" : "",
                    practiceAnswer === i && i !== content.practice[practiceIdx].correct ? "border-destructive bg-destructive/10" : "",
                    practiceAnswer !== null && i === content.practice[practiceIdx].correct && practiceAnswer !== i ? "border-primary/30" : ""
                  )}
                >
                  {opt}
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
                  {content.practice[practiceIdx].explanation && (
                    <p className="mt-1 text-muted-foreground">{content.practice[practiceIdx].explanation}</p>
                  )}
                </div>
                <Button onClick={nextPractice} className="w-full">
                  {practiceIdx + 1 >= content.practice.length ? "Start Quiz" : "Next Question"} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        )}

        {/* QUIZ */}
        {phase === "quiz" && !quizFinished && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-primary">End-of-Lesson Quiz</p>
              <p className="text-xs text-muted-foreground">Q{quizIdx + 1}/{content.quiz.length}</p>
            </div>
            <p className="text-sm font-semibold">{content.quiz[quizIdx].question}</p>
            <div className="space-y-2">
              {content.quiz[quizIdx].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuizAnswer(i)}
                  disabled={quizAnswer !== null}
                  className={cn(
                    "w-full text-left rounded-lg p-3 text-sm transition-all border",
                    quizAnswer === null ? "bg-card hover:border-primary/40 border-border" : "",
                    quizAnswer === i && i === content.quiz[quizIdx].correct ? "border-primary bg-primary/10" : "",
                    quizAnswer === i && i !== content.quiz[quizIdx].correct ? "border-destructive bg-destructive/10" : "",
                    quizAnswer !== null && i === content.quiz[quizIdx].correct && quizAnswer !== i ? "border-primary/30" : ""
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && (
          <div className="text-center space-y-4">
            {passed ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-lg font-bold font-display">Lesson Complete! 🎉</h3>
                <p className="text-muted-foreground text-sm">You scored {quizScore}/{content.quiz.length}</p>
                <Button onClick={() => onComplete(true, quizScore)} className="w-full">
                  Continue to Next Lesson <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 text-destructive mx-auto" />
                <h3 className="text-lg font-bold font-display">Not quite — review and try again</h3>
                <p className="text-muted-foreground text-sm">You scored {quizScore}/{content.quiz.length}. You need {Math.ceil(content.quiz.length * 0.7)} to pass.</p>
                <Button onClick={restart} variant="outline" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-1" /> Review Lesson
                </Button>
              </>
            )}
          </div>
        )}
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
