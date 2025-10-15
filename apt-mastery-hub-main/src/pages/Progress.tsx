import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";

interface DomainMastery {
  domain: string;
  total_attempted: number;
  total_correct: number;
  accuracy_percentage: number;
}

export default function Progress() {
  const navigate = useNavigate();
  const [mastery, setMastery] = useState<DomainMastery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndLoadProgress();
  }, []);

  const checkUserAndLoadProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("domain_mastery")
      .select("*")
      .eq("user_id", session.user.id);

    if (error) {
      toast.error("Failed to load progress");
    } else if (data) {
      setMastery(data);
    }
    setLoading(false);
  };

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      aptitude: "primary",
      reasoning: "secondary",
      verbal: "accent",
      technical: "success",
      general_knowledge: "warning",
    };
    return colors[domain] || "primary";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Your Progress
          </h1>
          <p className="text-muted-foreground">Track your mastery across all domains</p>
        </div>

        {mastery.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <Target className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-semibold text-lg">No progress yet</p>
                <p className="text-sm text-muted-foreground">
                  Start practicing to see your stats here
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mastery.map((domain) => (
              <Card key={domain.domain} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize flex items-center justify-between">
                    <span>{domain.domain.replace("_", " ")}</span>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(domain.accuracy_percentage)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Attempted</span>
                    <span className="font-semibold">{domain.total_attempted}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Correct</span>
                    <span className="font-semibold text-success">{domain.total_correct}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full gradient-${getDomainColor(domain.domain)} transition-all duration-500`}
                      style={{ width: `${domain.accuracy_percentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
