import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Brain, CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  domain: string;
  sub_topic: string;
}

export default function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    checkUserAndLoadQuestions();
  }, []);

  const checkUserAndLoadQuestions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUserId(session.user.id);
    await loadQuestions();
  };

  const loadQuestions = async () => {
    const domain = searchParams.get("domain");
    let query = supabase.from("questions").select("*").limit(10);
    
    if (domain && ["aptitude", "reasoning", "verbal", "technical", "general_knowledge"].includes(domain)) {
      query = query.eq("domain", domain as any);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to load questions");
    } else if (data) {
      setQuestions(data);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      toast.error("Please select an answer");
      return;
    }

    const currentQuestion = questions[currentIndex];
    const correct = selectedAnswer === currentQuestion.correct_answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Save progress
    await supabase.from("user_progress").insert({
      user_id: userId,
      question_id: currentQuestion.id,
      is_correct: correct,
    });

    setScore((prev) => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
    }));

    if (correct) {
      toast.success("Correct! +10 points");
    } else {
      toast.error("Incorrect. +2 points for trying");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer("");
      setShowFeedback(false);
    } else {
      toast.success(`Quiz complete! Score: ${score.correct}/${score.total + 1}`);
      navigate("/");
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const options = [
    { value: "A", label: currentQuestion.option_a },
    { value: "B", label: currentQuestion.option_b },
    { value: "C", label: currentQuestion.option_c },
    { value: "D", label: currentQuestion.option_d },
  ];

  return (
    <div className="min-h-screen pb-24 pt-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            <span className="font-semibold">
              {score.correct}/{score.total}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-sm text-primary font-medium mb-2">
                {currentQuestion.domain.toUpperCase()} • {currentQuestion.sub_topic}
              </p>
              <h2 className="text-xl font-semibold leading-relaxed">
                {currentQuestion.question_text}
              </h2>
            </div>

            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                    selectedAnswer === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                    showFeedback &&
                      option.value === currentQuestion.correct_answer &&
                      "border-success bg-success/10",
                    showFeedback &&
                      selectedAnswer === option.value &&
                      !isCorrect &&
                      "border-destructive bg-destructive/10"
                  )}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <span className="font-semibold mr-2">{option.value}.</span>
                    {option.label}
                  </Label>
                  {showFeedback && option.value === currentQuestion.correct_answer && (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  )}
                  {showFeedback &&
                    selectedAnswer === option.value &&
                    !isCorrect && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                </div>
              ))}
            </RadioGroup>

            {showFeedback && (
              <div
                className={cn(
                  "p-4 rounded-lg animate-slide-up",
                  isCorrect ? "bg-success/10 border-2 border-success" : "bg-destructive/10 border-2 border-destructive"
                )}
              >
                <p className="font-semibold mb-2 flex items-center gap-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      Correct!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      Incorrect
                    </>
                  )}
                </p>
                <p className="text-sm">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="flex gap-3">
              {!showFeedback ? (
                <Button onClick={handleSubmit} className="flex-1 gradient-primary">
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1 gradient-success">
                  {currentIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "Finish Quiz"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
