import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  full_name: string | null;
  total_points: number;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    checkUserAndLoadLeaderboard();
  }, []);

  const checkUserAndLoadLeaderboard = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, total_points")
      .order("total_points", { ascending: false })
      .limit(50);

    if (data) setLeaderboard(data);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-accent" />;
    if (index === 1) return <Medal className="h-6 w-6 text-muted-foreground" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen pb-24 pt-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Top performers worldwide</p>
        </div>

        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <Card key={entry.id} className={index < 3 ? "border-2 border-primary/20" : ""}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center">
                    {getRankIcon(index) || <span className="font-bold">#{index + 1}</span>}
                  </div>
                  <p className="font-semibold">{entry.full_name || "Anonymous"}</p>
                </div>
                <p className="font-bold text-primary">{entry.total_points} pts</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
