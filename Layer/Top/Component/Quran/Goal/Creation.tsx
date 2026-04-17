import { useState } from "react";
import { ChevronRight, ChevronLeft, Loader2, Repeat, Calendar, Clock, Book, Settings, Target } from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { Input } from "@/Top/Component/UI/Input";
import { Label } from "@/Top/Component/UI/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Top/Component/UI/Select";
import { GOAL_PRESETS, type GoalPreset } from "@/Middle/Hook/Use-Quran-Goals";
import { surahList } from "@/Bottom/API/Quran";

const iconMap: Record<string, any> = {
  clock: Clock,
  book: Book,
  calendar: Calendar,
  settings: Settings,
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TOTAL_VERSES = 6236;

interface Creation_Props {
  onCreateGoal: (goal: any) => Promise<void>;
  onClose: () => void;
}

export function Creation({ onCreateGoal, onClose }: Creation_Props) {
  const [step, setStep] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState<GoalPreset | null>(null);
  const [frequency, setFrequency] = useState<"daily" | "duration">("daily");
  const [isCreating, setIsCreating] = useState(false);

  const [customGoalType, setCustomGoalType] = useState<"time_based" | "khatm" | "verses">("time_based");
  const [customDailyTarget, setCustomDailyTarget] = useState(15);
  const [customDuration, setCustomDuration] = useState(30);
  const [customVersesPerDay, setCustomVersesPerDay] = useState(20);

  const handleCreateGoal = async () => {
    if (!selectedPreset) return;
    setIsCreating(true);
    try {
      if (selectedPreset.id === "custom") {
        await onCreateGoal({
          id: "custom",
          goal_type: customGoalType,
          frequency,
          daily_target: customGoalType === "time_based" ? customDailyTarget : customGoalType === "verses" ? customVersesPerDay : undefined,
          duration: customGoalType === "khatm" ? customDuration : customGoalType === "verses" ? customDuration : undefined,
        });
      } else {
        await onCreateGoal({
          id: selectedPreset.id,
          goal_type: selectedPreset.goal_type,
          frequency,
          daily_target: selectedPreset.daily_target,
          duration: selectedPreset.duration,
        });
      }
      setStep(1);
      setSelectedPreset(null);
      onClose();
    } catch (error) {
      console.error("Error creating goal:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const generateSchedule = () => {
    if (!selectedPreset) return [];
    const schedule = [];
    const today = new Date();

    let days: number;
    let versesPerDay: number;
    let dailyMinutes: number | undefined;

    if (selectedPreset.id === "custom") {
      days = customGoalType === "time_based" ? 7 : customDuration;
      versesPerDay = customGoalType === "khatm" ? Math.ceil(TOTAL_VERSES / customDuration) : customGoalType === "verses" ? customVersesPerDay : 0;
      dailyMinutes = customGoalType === "time_based" ? customDailyTarget : undefined;
    } else {
      days = selectedPreset.duration || 7;
      versesPerDay = selectedPreset.goal_type === "khatm" ? Math.ceil(TOTAL_VERSES / days) : 0;
      dailyMinutes = selectedPreset.daily_target;
    }

    let currentVerse = 1;
    for (let i = 0; i < Math.min(days, 7); i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayName = DAYS_OF_WEEK[date.getDay()];

      if (dailyMinutes) {
        schedule.push({ day: dayName, task: `Read ${dailyMinutes} min` });
      } else if (versesPerDay > 0) {
        const findSurah = (v: number) => {
          let remaining = v;
          for (const s of surahList) {
            if (remaining <= s.numberOfAyahs) return s;
            remaining -= s.numberOfAyahs;
          }
          return surahList[surahList.length - 1];
        };
        const startSurah = findSurah(currentVerse);
        const endVerse = Math.min(currentVerse + versesPerDay, TOTAL_VERSES);
        const endSurah = findSurah(endVerse);
        schedule.push({ day: dayName, task: `${startSurah?.englishName} → ${endSurah?.englishName}` });
        currentVerse = endVerse;
      }
    }
    if (days > 7) schedule.push({ day: `+${days - 7} more`, task: "" });
    return schedule;
  };

  const wizardStep = step === 1 ? 2 : step;

  // Get selected preset info
  const selectedPresetInfo = selectedPreset ? GOAL_PRESETS.find(p => p.id === selectedPreset.id) : null;
  const SelectedIcon = selectedPresetInfo ? iconMap[selectedPresetInfo.icon] || Clock : Clock;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-[1600px] mx-auto px-4">
        {/* Progress bar */}
        <div className="w-full bg-muted h-1 rounded-full mb-8">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-500" 
            style={{ width: `${(step / (selectedPreset?.id === "custom" ? 3 : 4)) * 100}%` }} 
          />
        </div>

        {/* Main content area - split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Title Container with Info inside */}
          <div className="ui card p-8 !block space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {wizardStep === 2 && "Pick a preset"}
                {wizardStep === 3 && selectedPreset?.id === "custom" && "Configure your goal"}
                {wizardStep === 3 && selectedPreset?.id !== "custom" && "Choose frequency"}
                {wizardStep === 4 && "Your schedule"}
              </h1>
            </div>

            {/* Info Panel - inside Title Container, only visible when something is selected */}
            {selectedPreset && (
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-4">Selected Goal</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="ui button w-12 h-12 rounded-lg flex items-center justify-center">
                      <SelectedIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">{selectedPresetInfo?.title || "Custom Goal"}</p>
                    </div>
                  </div>
                  {selectedPreset.id !== "custom" && selectedPresetInfo && (
                    <div className="pt-4 border-t border-border">
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Type:</span> {selectedPresetInfo.goal_type === "time_based" ? "Time-based" : selectedPresetInfo.goal_type === "khatm" ? "Khatm" : "Verses"}
                        </p>
                        {selectedPresetInfo.daily_target && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Daily Target:</span> {selectedPresetInfo.daily_target} {selectedPresetInfo.goal_type === "time_based" ? "minutes" : "verses"}
                          </p>
                        )}
                        {selectedPresetInfo.duration && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Duration:</span> {selectedPresetInfo.duration} days
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Selection container */}
          <div className="ui card p-8 !block">
            {/* Step 1: Pick a preset */}
            {wizardStep === 2 && (
              <div className="space-y-3">
                {GOAL_PRESETS.map((preset) => {
                  const Icon = iconMap[preset.icon] || Clock;
                  const isSelected = selectedPreset?.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={cn(
                        "w-full ui card flex items-center gap-4 p-4 transition-all text-left",
                        isSelected && "active"
                      )}
                    >
                      <div className={cn(
                        "ui button w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        isSelected && "active"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base">{preset.title}</p>
                      </div>
                      {preset.recommended && (
                        <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full flex-shrink-0">Rec</span>
                      )}
                    </button>
                  );
                })}
                <div className="flex justify-end pt-6">
                  <button
                    onClick={() => setStep(selectedPreset?.id === "custom" ? 3 : 3)}
                    disabled={!selectedPreset}
                    className="ui button px-6 py-2.5 text-sm gap-2 disabled:opacity-50"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Custom goal configuration */}
            {wizardStep === 3 && selectedPreset?.id === "custom" && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Goal Type</Label>
                  <Select value={customGoalType} onValueChange={(v) => setCustomGoalType(v as any)}>
                    <SelectTrigger className="ui button h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time_based">Time-Based (min/day)</SelectItem>
                      <SelectItem value="khatm">Complete Quran (Khatm)</SelectItem>
                      <SelectItem value="verses">Verses Per Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {customGoalType === "time_based" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Daily Minutes</Label>
                    <Input type="number" value={customDailyTarget} onChange={(e) => setCustomDailyTarget(Math.max(1, parseInt(e.target.value) || 1))} className="ui button h-10" min={1} max={120} />
                  </div>
                )}

                {customGoalType === "khatm" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Duration (days)</Label>
                    <Input type="number" value={customDuration} onChange={(e) => setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))} className="ui button h-10" min={1} max={730} />
                    <p className="text-xs text-muted-foreground">≈ {Math.ceil(TOTAL_VERSES / customDuration)} verses/day</p>
                  </div>
                )}

                {customGoalType === "verses" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Verses Per Day</Label>
                      <Input type="number" value={customVersesPerDay} onChange={(e) => setCustomVersesPerDay(Math.max(1, parseInt(e.target.value) || 1))} className="ui button h-10" min={1} max={300} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Duration (days)</Label>
                      <Input type="number" value={customDuration} onChange={(e) => setCustomDuration(Math.max(1, parseInt(e.target.value) || 1))} className="ui button h-10" min={1} />
                    </div>
                  </>
                )}

                <div className="flex justify-between pt-6">
                  <button onClick={() => setStep(2)} className="ui button px-6 py-2.5 text-sm gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={handleCreateGoal} disabled={isCreating} className="ui button px-6 py-2.5 text-sm bg-primary text-primary-foreground disabled:opacity-50">
                    {isCreating ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Creating...</> : "Start!"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Non-custom frequency step */}
            {wizardStep === 3 && selectedPreset?.id !== "custom" && (
              <div className="space-y-3">
                <button
                  onClick={() => setFrequency("daily")}
                  className={cn(
                    "w-full ui card flex items-center gap-4 p-4 transition-all",
                    frequency === "daily" && "active"
                  )}
                >
                  <div className={cn(
                    "ui button w-10 h-10 rounded-lg flex items-center justify-center",
                    frequency === "daily" && "active"
                  )}>
                    <Repeat className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-base">Daily</p>
                    <p className="text-sm text-muted-foreground">Resets every day</p>
                  </div>
                </button>
                <button
                  onClick={() => setFrequency("duration")}
                  className={cn(
                    "w-full ui card flex items-center gap-4 p-4 transition-all",
                    frequency === "duration" && "active"
                  )}
                >
                  <div className={cn(
                    "ui button w-10 h-10 rounded-lg flex items-center justify-center",
                    frequency === "duration" && "active"
                  )}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-base">Duration</p>
                    <p className="text-sm text-muted-foreground">Track over set days</p>
                  </div>
                </button>
                <div className="flex justify-between pt-6">
                  <button onClick={() => setStep(2)} className="ui button px-6 py-2.5 text-sm gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={() => setStep(4)} className="ui button px-6 py-2.5 text-sm gap-2">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Schedule preview */}
            {wizardStep === 4 && (
              <div className="space-y-5">
                <div className="relative pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-px bg-primary/20" />
                  {generateSchedule().slice(0, 6).map((item, index) => (
                    <div key={index} className="relative pb-3 last:pb-0">
                      <div className="absolute -left-5 top-2.5 w-2.5 h-2.5 rounded-full border-2 border-primary bg-background" />
                      <div className="ui card flex items-center justify-between p-3 !block">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-base">{item.day}</span>
                          <span className="text-sm text-muted-foreground">{item.task}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-6">
                  <button onClick={() => setStep(3)} className="ui button px-6 py-2.5 text-sm gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={handleCreateGoal} disabled={isCreating} className="ui button px-6 py-2.5 text-sm bg-primary text-primary-foreground disabled:opacity-50">
                    {isCreating ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Creating...</> : "Start!"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}