import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Zap, BookOpen, HelpCircle, Lightbulb, Quote, BarChart3, ChevronRight, Play, Heart, Diamond } from "lucide-react";
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
  videoId?: string;
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
  const hasVideo = !!lesson.videoId;
  const STEPS = hasVideo
    ? ["Video", "Concept", "Example", "Quiz 1", "Quiz 2", "Takeaway", "Complete"]
    : ["Concept", "Example", "Quiz 1", "Quiz 2", "Takeaway", "Complete"];
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

  const quizStep1 = hasVideo ? 3 : 2;
  const quizStep2 = hasVideo ? 4 : 3;
  const takeawayStep = hasVideo ? 5 : 4;

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
        {/* Video Step */}
        {hasVideo && step === 0 && (
          <motion.div key="video" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5" style={{ color: sectionColor }} />
              <h2 className="text-xl font-extrabold font-display">{lesson.title}</h2>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-muted">
              <iframe src={`https://www.youtube.com/embed/${lesson.videoId}?rel=0`} title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen className="w-full h-full" />
            </div>
            <p className="text-sm text-muted-foreground">Watch the video above, then continue to the lesson.</p>
            <Button onClick={() => setStep(1)} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
              Continue <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Concept */}
        {step === (hasVideo ? 1 : 0) && (
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
            <Button onClick={() => setStep(hasVideo ? 2 : 1)} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
              Continue <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Example */}
        {step === (hasVideo ? 2 : 1) && (
          <motion.div key="example" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: sectionColor }} />
              <h2 className="text-xl font-extrabold font-display">Real-World Example</h2>
            </div>
            <div className="rounded-xl p-5 border-2" style={{ borderColor: sectionColor, backgroundColor: `${sectionColor}10` }}>
              <p className="text-sm font-medium leading-relaxed">{lesson.example || lesson.content}</p>
            </div>
            <Button onClick={() => setStep(quizStep1)} className="w-full rounded-xl h-12 font-bold text-base" style={{ backgroundColor: sectionColor }}>
              Ready for Quiz <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Quiz 1 */}
        {step === quizStep1 && (
          <motion.div key="quiz1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" style={{ color: sectionColor }} />
              <h2 className="text-lg font-extrabold font-display">Quiz — Question 1</h2>
            </div>
            <p className="text-sm font-semibold">{lesson.quiz[0].q}</p>
            <div className="space-y-2">
              {lesson.quiz[0].options.map((opt, i) => (
                <button key={i} onClick={() => handleQuiz1(i)} disabled={quiz1Answer !== null}
                  className={cn(
                    "w-full text-left rounded-xl p-4 text-sm font-semibold transition-all border-2",
                    quiz1Answer === null ? "border-border hover:border-primary/40 bg-card" : "",
                    quiz1Answer === i && i === lesson.quiz[0].answer ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "",
                    quiz1Answer === i && i !== lesson.quiz[0].answer ? "border-red-400 bg-red-50 text-red-700" : "",
                    quiz1Answer !== null && i === lesson.quiz[0].answer && quiz1Answer !== i ? "border-emerald-300 bg-emerald-50/50" : ""
                  )}>
                  <span className="flex items-center gap-3">
                    <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      quiz1Answer === i && i === lesson.quiz[0].answer ? "bg-emerald-500 text-white" :
                      quiz1Answer === i && i !== lesson.quiz[0].answer ? "bg-red-400 text-white" :
                      "bg-muted text-muted-foreground"
                    )}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
            {quiz1Answer !== null && !quiz1Correct && (
              <Button onClick={() => setQuiz1Answer(null)} variant="outline" className="w-full rounded-xl">Try Again</Button>
            )}
          </motion.div>
        )}

        {/* Quiz 2 */}
        {step === quizStep2 && (
          <motion.div key="quiz2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" style={{ color: sectionColor }} />
              <h2 className="text-lg font-extrabold font-display">Quiz — Question 2</h2>
            </div>
            <p className="text-sm font-semibold">{lesson.quiz[1].q}</p>
            <div className="space-y-2">
              {lesson.quiz[1].options.map((opt, i) => (
                <button key={i} onClick={() => handleQuiz2(i)} disabled={quiz2Answer !== null}
                  className={cn(
                    "w-full text-left rounded-xl p-4 text-sm font-semibold transition-all border-2",
                    quiz2Answer === null ? "border-border hover:border-primary/40 bg-card" : "",
                    quiz2Answer === i && i === lesson.quiz[1].answer ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "",
                    quiz2Answer === i && i !== lesson.quiz[1].answer ? "border-red-400 bg-red-50 text-red-700" : "",
                    quiz2Answer !== null && i === lesson.quiz[1].answer && quiz2Answer !== i ? "border-emerald-300 bg-emerald-50/50" : ""
                  )}>
                  <span className="flex items-center gap-3">
                    <span className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      quiz2Answer === i && i === lesson.quiz[1].answer ? "bg-emerald-500 text-white" :
                      quiz2Answer === i && i !== lesson.quiz[1].answer ? "bg-red-400 text-white" :
                      "bg-muted text-muted-foreground"
                    )}>{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
            {quiz2Answer !== null && !quiz2Correct && (
              <Button onClick={() => setQuiz2Answer(null)} variant="outline" className="w-full rounded-xl">Try Again</Button>
            )}
          </motion.div>
        )}

        {/* Takeaway */}
        {step === takeawayStep && (
          <motion.div key="takeaway" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border p-6 card-shadow space-y-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" style={{ color: sectionColor }} />
              <h2 className="text-xl font-extrabold font-display">Key Takeaway</h2>
            </div>
            <div className="rounded-xl p-6 text-center" style={{ backgroundColor: `${sectionColor}15`, border: `2px solid ${sectionColor}40` }}>
              <Lightbulb className="w-10 h-10 mx-auto mb-3" style={{ color: sectionColor }} />
              <p className="text-lg font-bold font-display">{lesson.takeaway}</p>
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
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}>
              <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: sectionColor }}>
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-extrabold font-display">Lesson Complete!</h2>
            <div className="flex justify-center gap-3">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-lg"
                style={{ backgroundColor: `${sectionColor}15`, color: sectionColor }}>
                <Zap className="w-5 h-5" /> +{lesson.xp} XP
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-lg bg-cyan-50 text-cyan-600 border border-cyan-200">
                <Diamond className="w-5 h-5 fill-cyan-500" /> +10 Gems
              </motion.div>
            </div>
            <div>
              <Button onClick={onBack} variant="outline" className="rounded-xl font-bold">Back to Learning Path</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPathModule;
