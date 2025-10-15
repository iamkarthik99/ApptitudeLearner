import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { LogOut, Award, Trophy, Flame } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (data) setProfile(data);

    const { count } = await supabase
      .from("user_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    setTotalQuestions(count || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen pb-24 pt-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="gradient-primary text-white border-0">
          <CardContent className="pt-6 text-center space-y-2">
            <div className="h-20 w-20 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-4">
              <span className="text-3xl font-bold">{profile?.full_name?.charAt(0) || "U"}</span>
            </div>
            <h2 className="text-2xl font-bold">{profile?.full_name || "User"}</h2>
            <p className="text-white/80">Keep up the great work!</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{profile?.total_points || 0}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Flame className="h-8 w-8 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold">{profile?.current_streak || 0}</p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold">{totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </CardContent>
          </Card>
        </div>

        {totalQuestions >= 100 && (
          <Card className="border-2 border-success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <Award className="h-6 w-6" />
                Achievement Unlocked!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">You've completed 100+ questions!</p>
              <Button className="w-full gradient-success">Download Certificate</Button>
            </CardContent>
          </Card>
        )}

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
