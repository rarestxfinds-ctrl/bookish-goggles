import { Flame, Trophy, Clock, Calendar, Target, Trash2, MapPin } from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";
import { Progress_Ring } from "./Progress";
import type { Goal_Progress } from "./Types";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Active_Props {
  activeGoal: any;
  weekProgress: any[];
  totalMinutesRead: number;
  todayMinutes: number;
  todaySeconds?: number; // Add seconds prop
  todayPercentage: number;
  dayProgress: Goal_Progress | null;
  overallProgress: number;
  versesRead: number;
  totalVerses: number;
  currentSurah: any;
  currentAyah: number;
  currentJuz: number;
  currentPage: number;
  onDeleteGoal: () => void;
  onCreateNewGoal: () => void;
}

export function Active({
  activeGoal,
  weekProgress,
  totalMinutesRead,
  todayMinutes,
  todaySeconds = 0,
  todayPercentage,
  dayProgress,
  overallProgress,
  versesRead,
  totalVerses,
  currentSurah,
  currentAyah,
  currentJuz,
  currentPage,
  onDeleteGoal,
  onCreateNewGoal,
}: Active_Props) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const endDate = activeGoal?.end_date ? new Date(activeGoal.end_date) : null;
  const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86400000)) : null;
  const dailyTarget = activeGoal?.daily_target || 0;
  const completedDays = weekProgress?.filter(p => p.completed).length || 0;

  // Calculate time remaining for today (in seconds for precision)
  const totalTodaySeconds = (todayMinutes * 60) + todaySeconds;
  const targetSeconds = dailyTarget * 60;
  const remainingSeconds = targetSeconds > totalTodaySeconds ? targetSeconds - totalTodaySeconds : 0;
  
  // Format remaining time
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return "0m 0s";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs}s`;
    return `${minutes}m ${secs}s`;
  };
  
  const timeRemainingFormatted = formatTimeRemaining(remainingSeconds);
  const isGoalCompleted = totalTodaySeconds >= targetSeconds;

  // Calculate ring value
  const ringValue = activeGoal?.goal_type === "time_based" 
    ? todayPercentage 
    : activeGoal?.goal_type === "khatm" 
      ? overallProgress 
      : dayProgress?.todayPercent || 0;

  const ringLabel = activeGoal?.goal_type === "time_based" 
    ? !isGoalCompleted ? timeRemainingFormatted : "Done!"
    : `${ringValue}%`;

  const ringSublabel = activeGoal?.goal_type === "time_based" 
    ? "left today" 
    : dayProgress ? `day ${dayProgress.dayNumber}` : "overall";

  if (!activeGoal) return null;

  return (
    <div className="container py-6 sm:py-8 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Container className="!w-auto !py-1 !px-3 mb-2">
            <h1 className="text-sm font-semibold text-foreground">Your Progress</h1>
          </Container>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {activeGoal.goal_type === "time_based" 
              ? `${dailyTarget} min/day` 
              : activeGoal.goal_type === "khatm" 
                ? `Khatm${daysRemaining !== null ? ` · ${daysRemaining}d left` : ""}`
                : "Custom goal"}
          </p>
        </div>
        <Button onClick={onDeleteGoal} size="sm" className="w-9 h-9 p-0 rounded-full text-destructive/70 hover:text-destructive" title="Delete Goal">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Hero ring + stats */}
      <Container className="!p-6 sm:!p-8 mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="relative flex-shrink-0">
            <Progress_Ring
              value={ringValue}
              size={140}
              strokeWidth={10}
              label={ringLabel}
              sublabel={ringSublabel}
            />
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-3 flex-1 w-full">
            <Container className="!p-3 text-center">
              <Flame className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-foreground">{activeGoal.current_streak || 0}</p>
              <p className="text-[10px] text-muted-foreground">Streak</p>
            </Container>
            <Container className="!p-3 text-center">
              <Trophy className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-foreground">{activeGoal.longest_streak || 0}</p>
              <p className="text-[10px] text-muted-foreground">Best</p>
            </Container>
            <Container className="!p-3 text-center">
              <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-foreground">{totalMinutesRead}</p>
              <p className="text-[10px] text-muted-foreground">Total Min</p>
            </Container>
            <Container className="!p-3 text-center">
              <Calendar className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold text-foreground">{completedDays}/7</p>
              <p className="text-[10px] text-muted-foreground">This Week</p>
            </Container>
          </div>
        </div>
      </Container>

      {/* Today's Progress Bar - Time Based Goal */}
      {activeGoal.goal_type === "time_based" && dailyTarget > 0 && (
        <Container className="!p-4 sm:!p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Today</span>
            <span className="text-xs text-muted-foreground">
              {todayMinutes}:{String(todaySeconds).padStart(2, '0')}/{dailyTarget} min
            </span>
          </div>
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${Math.min(todayPercentage, 100)}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {isGoalCompleted ? "✅ Goal achieved!" : `${formatTimeRemaining(remainingSeconds)} remaining`}
          </p>
        </Container>
      )}

      {/* Khatm day progress */}
      {activeGoal.goal_type === "khatm" && dayProgress && (
        <Container className="!p-4 sm:!p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Day {dayProgress.dayNumber}/{dayProgress.totalDays}</span>
            </div>
            <span className="text-xs font-medium text-primary">{dayProgress.todayPercent}%</span>
          </div>
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${dayProgress.todayPercent}%` }} />
          </div>
          <div className="flex gap-2">
            <Container className="!p-2.5 flex-1">
              <p className="text-[10px] text-muted-foreground">From</p>
              <p className="text-xs font-medium truncate text-foreground">{dayProgress.startPos?.surahName || "Start"}</p>
            </Container>
            <div className="flex items-center text-muted-foreground">→</div>
            <Container className="!p-2.5 flex-1">
              <p className="text-[10px] text-muted-foreground">To</p>
              <p className="text-xs font-medium truncate text-foreground">
                {dayProgress.endPos?.surahName || "End"} {dayProgress.endPos?.ayah ? `(${dayProgress.endPos.ayah})` : ""}
              </p>
            </Container>
          </div>
        </Container>
      )}

      {/* Current Position */}
      <Container className="!p-4 sm:!p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Current Position</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Container className="!p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Surah</p>
            <p className="font-semibold text-xs truncate text-foreground">{currentSurah?.englishName || "Al-Fatihah"}</p>
          </Container>
          <Container className="!p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Ayah</p>
            <p className="font-semibold text-sm text-foreground">{currentAyah || 1}</p>
          </Container>
          <Container className="!p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Juz</p>
            <p className="font-semibold text-sm text-foreground">{currentJuz || 1}</p>
          </Container>
          <Container className="!p-2 text-center">
            <p className="text-[10px] text-muted-foreground">Page</p>
            <p className="font-semibold text-sm text-foreground">{currentPage || 1}</p>
          </Container>
        </div>

        {activeGoal.goal_type === "khatm" && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Khatm Progress</span>
              <span className="text-xs font-medium text-foreground">{overallProgress}%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${overallProgress}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{versesRead}/{totalVerses} verses</p>
          </div>
        )}
      </Container>

      {/* Week dots */}
      <Container className="!p-4 sm:!p-5 mb-4">
        <span className="text-sm font-medium mb-3 block text-foreground">This Week</span>
        <div className="flex items-center justify-between">
          {DAYS_OF_WEEK.map((day, index) => {
            const progressForDay = weekProgress?.find((p) => new Date(p.date).getDay() === index);
            const isToday = index === dayOfWeek;
            const isCompleted = progressForDay?.completed;
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">{day}</span>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs font-medium",
                  isCompleted
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : isToday
                      ? "border-2 border-primary border-dashed text-primary"
                      : "bg-muted/50 text-muted-foreground"
                )}>
                  {isCompleted ? "✓" : isToday ? "•" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      {/* New goal CTA */}
      <Button
        onClick={onCreateNewGoal}
        className="w-full !p-4 text-center border-dashed border-2 border-border hover:border-primary/30 transition-colors"
        variant="secondary"
        fullWidth
      >
        <div>
          <p className="text-sm text-muted-foreground">Want to change your goal?</p>
          <span className="text-primary text-sm font-medium mt-1 inline-flex items-center gap-1">
            <Target className="h-3.5 w-3.5" /> Create New Goal
          </span>
        </div>
      </Button>
    </div>
  );
}