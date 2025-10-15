import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { Flame, Target, Brain, Zap, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  full_name: string | null;
  current_streak: number;
  total_points: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Fetch user profile
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, current_streak, total_points")
      .eq("id", session.user.id)
      .single();

    if (error) {
      toast.error("Failed to load profile");
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const quickStartTopics = [
    { domain: "aptitude", label: "Aptitude", icon: Brain, color: "primary" },
    { domain: "reasoning", label: "Reasoning", icon: Target, color: "secondary" },
    { domain: "technical", label: "Technical", icon: Zap, color: "accent" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || "Learner"}!
          </h1>
          <p className="text-muted-foreground">Ready to level up your skills?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="gradient-accent shadow-lg border-0">
            <CardContent className="pt-6 text-center">
              <Flame className="h-8 w-8 mx-auto mb-2 text-white" />
              <p className="text-3xl font-bold text-white">{profile?.current_streak || 0}</p>
              <p className="text-sm text-white/80">Day Streak</p>
            </CardContent>
          </Card>

          <Card className="gradient-primary shadow-lg border-0">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-white" />
              <p className="text-3xl font-bold text-white">{profile?.total_points || 0}</p>
              <p className="text-sm text-white/80">Total Points</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickStartTopics.map((topic) => (
              <Button
                key={topic.domain}
                variant="outline"
                className="w-full justify-start h-auto py-4 hover:shadow-md transition-all"
                onClick={() => navigate(`/practice?domain=${topic.domain}`)}
              >
                <topic.icon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-semibold">{topic.label}</p>
                  <p className="text-xs text-muted-foreground">Start practicing now</p>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Daily Challenge */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-lg">Daily Challenge</p>
                <p className="text-sm text-muted-foreground">
                  Complete 10 questions today
                </p>
              </div>
              <Button className="gradient-success">
                Start Challenge
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
