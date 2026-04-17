import { useState, useEffect, useCallback, useRef } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";
import { Plus, Minus, RotateCcw, Repeat, Target, Volume2, VolumeX, Hand } from "lucide-react";

const TasbihPage = () => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [loopCount, setLoopCount] = useState(1);
  const [currentLoop, setCurrentLoop] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedLoops, setCompletedLoops] = useState(0);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showLoopModal, setShowLoopModal] = useState(false);
  const [tempTarget, setTempTarget] = useState(33);
  const [tempLoop, setTempLoop] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem("tasbih-state");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCount(parsed.count || 0);
      setTarget(parsed.target || 33);
      setLoopCount(parsed.loopCount || 1);
      setCurrentLoop(parsed.currentLoop || 1);
      setCompletedLoops(parsed.completedLoops || 0);
    }
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem("tasbih-state", JSON.stringify({
      count, target, loopCount, currentLoop, completedLoops
    }));
  }, [count, target, loopCount, currentLoop, completedLoops]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/click-sound.mp3");
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  const increment = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    playSound();
    
    // Check if target reached
    if (newCount >= target) {
      const newCompletedLoops = completedLoops + 1;
      setCompletedLoops(newCompletedLoops);
      
      // Check if all loops completed
      if (currentLoop >= loopCount) {
        // All loops complete - reset everything
        setCount(0);
        setCurrentLoop(1);
        alert(`Completed ${loopCount} loop${loopCount > 1 ? 's' : ''}! 🎉`);
      } else {
        // Move to next loop
        setCount(0);
        setCurrentLoop(currentLoop + 1);
        alert(`Loop ${currentLoop} completed! Moving to loop ${currentLoop + 1}`);
      }
    }
  }, [count, target, currentLoop, loopCount, completedLoops, playSound]);

  const decrement = useCallback(() => {
    if (count > 0) {
      setCount(count - 1);
    }
  }, [count]);

  const resetCurrentLoop = useCallback(() => {
    if (confirm("Reset current loop?")) {
      setCount(0);
    }
  }, []);

  const resetAll = useCallback(() => {
    if (confirm("Reset all progress?")) {
      setCount(0);
      setCurrentLoop(1);
      setCompletedLoops(0);
    }
  }, []);

  const handleTargetSave = useCallback(() => {
    setTarget(tempTarget);
    setShowTargetModal(false);
  }, [tempTarget]);

  const handleLoopSave = useCallback(() => {
    setLoopCount(tempLoop);
    setCurrentLoop(1);
    setCount(0);
    setCompletedLoops(0);
    setShowLoopModal(false);
  }, [tempLoop]);

  const progress = (count / target) * 100;
  const loopProgress = (currentLoop / loopCount) * 100;

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-6 px-4">
        <Container className="!p-6">
          {/* Main Counter */}
          <div className="text-center mb-8">
            <div className="relative mb-4">
              <div className={`
                text-8xl font-bold font-mono transition-all duration-200
                ${count > 0 ? "scale-105 text-primary" : "scale-100"}
              `}>
                {count}
              </div>
              <div className="absolute -top-2 -right-2 text-xs text-muted-foreground">
                / {target}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(progress)}% of current target
            </p>
          </div>

          {/* Loop Progress */}
          <div className="mb-8 p-4 rounded-[40px] bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Loop Progress</span>
              </div>
              <span className="text-sm font-mono">
                {currentLoop} / {loopCount}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary/60 transition-all duration-300 rounded-full"
                style={{ width: `${loopProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Completed loops: {completedLoops}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              onClick={decrement}
              variant="secondary"
              className="w-16 h-16 rounded-full p-0"
              disabled={count === 0}
            >
              <Minus className="h-8 w-8" />
            </Button>
            
            <Button
              onClick={increment}
              className="w-24 h-24 rounded-full p-0 text-3xl font-bold shadow-lg"
            >
              +
            </Button>
            
            <Button
              onClick={resetCurrentLoop}
              variant="secondary"
              className="w-16 h-16 rounded-full p-0"
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </div>

          {/* Settings Section */}
          <div className="space-y-3 pt-4 border-t border-border">
            {/* Target and Loop Settings */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => {
                  setTempTarget(target);
                  setShowTargetModal(true);
                }} 
                variant="secondary"
                className="gap-2"
              >
                <Target className="h-4 w-4" />
                Target: {target}
              </Button>
              
              <Button 
                onClick={() => {
                  setTempLoop(loopCount);
                  setShowLoopModal(true);
                }} 
                variant="secondary"
                className="gap-2"
              >
                <Repeat className="h-4 w-4" />
                Loops: {loopCount}
              </Button>
            </div>

            {/* Sound Toggle and Reset All */}
            <div className="flex gap-3">
              <Button 
                onClick={() => setSoundEnabled(!soundEnabled)} 
                variant="secondary"
                className="flex-1 gap-2"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {soundEnabled ? "Sound On" : "Sound Off"}
              </Button>
              
              <Button 
                onClick={resetAll} 
                variant="secondary"
                className="flex-1"
              >
                Reset All
              </Button>
            </div>
          </div>

          {/* Recommended using fingers message */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-2">
              <Hand className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Recommended: Using your fingers for tasbih is sunnah
              </p>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-muted-foreground">
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Space</kbd> or <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">↑</kbd> to increment • 
              <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] ml-1">↓</kbd> to decrement
            </p>
          </div>
        </Container>
      </div>

      {/* Target Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Container className="max-w-sm w-full !p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Set Target</h3>
            <input
              type="number"
              value={tempTarget}
              onChange={(e) => setTempTarget(Math.max(1, Number(e.target.value)))}
              className="w-full px-4 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-center text-lg font-mono outline-none focus:border-primary transition-colors mb-4"
              min="1"
              autoFocus
            />
            <div className="flex gap-3">
              <Button onClick={() => setShowTargetModal(false)} variant="secondary" fullWidth>
                Cancel
              </Button>
              <Button onClick={handleTargetSave} fullWidth>
                Save
              </Button>
            </div>
          </Container>
        </div>
      )}

      {/* Loop Modal */}
      {showLoopModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Container className="max-w-sm w-full !p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Set Number of Loops</h3>
            <input
              type="number"
              value={tempLoop}
              onChange={(e) => setTempLoop(Math.max(1, Number(e.target.value)))}
              className="w-full px-4 py-2 rounded-[40px] bg-muted/30 border-2 border-black dark:border-white text-center text-lg font-mono outline-none focus:border-primary transition-colors mb-4"
              min="1"
              autoFocus
            />
            <div className="flex gap-3">
              <Button onClick={() => setShowLoopModal(false)} variant="secondary" fullWidth>
                Cancel
              </Button>
              <Button onClick={handleLoopSave} fullWidth>
                Save
              </Button>
            </div>
          </Container>
        </div>
      )}
    </Layout>
  );
};

export default TasbihPage;