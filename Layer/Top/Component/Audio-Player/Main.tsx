import {
  Play,
  Pause,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";
import { Slider } from "@/Top/Component/UI/Slider";
import type { AudioPlayerMainProps } from "./Types";
import { formatTime } from "./Utility";
import { Settings } from "./Settings";

// Timeline component with labels on sides
const Timeline = ({
  progress,
  currentTime,
  duration,
  onSeek,
}: {
  progress: number;
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
}) => (
  <div className="flex items-center gap-2 w-full">
    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
      {formatTime(currentTime)}
    </span>
    <Slider
      value={[progress]}
      max={100}
      step={0.1}
      onValueChange={onSeek}
      className="flex-1"
    />
    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
      {formatTime(duration)}
    </span>
  </div>
);

export const AudioPlayerMain = ({
  isPlaying,
  isLoading,
  progress,
  currentTime,
  duration,
  trackTitle,
  repeatMode,
  playbackSpeed,
  playbackMode,
  volume,
  isMuted,
  settingsOpen,
  settingsMenu,
  minimized,
  onTogglePlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSettingsOpenChange,
  onSettingsMenuChange,
  onRepeatModeChange,
  onPlaybackSpeedChange,
  onClose,
  onToggleMinimize,
}: AudioPlayerMainProps) => {
  // Full view
  if (!minimized) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] px-4"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <Container className="!py-2 !px-3 sm:!py-2 sm:!px-4 shadow-lg">
          <Timeline
            progress={progress}
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
          />

          {trackTitle && (
            <div className="mt-2 text-xs font-medium truncate text-center">
              {trackTitle}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-2">
            {/* Settings component */}
            <Settings
              open={settingsOpen}
              onOpenChange={onSettingsOpenChange}
              menu={settingsMenu}
              onMenuChange={onSettingsMenuChange}
              repeatMode={repeatMode}
              onRepeatModeChange={onRepeatModeChange}
              playbackSpeed={playbackSpeed}
              onPlaybackSpeedChange={onPlaybackSpeedChange}
              playbackMode={playbackMode}
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={onVolumeChange}
              onToggleMute={onToggleMute}
            />

            {/* Play button */}
            <Button
              size="md"
              className="w-10 h-10 p-0 rounded-full"
              onClick={onTogglePlayPause}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            {/* Close button */}
            <Button
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>

            {/* Minimize button */}
            <Button
              size="sm"
              className="w-8 h-8 p-0 rounded-full"
              onClick={onToggleMinimize}
              title="Minimise player"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // Minimised view
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4"
      style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
    >
      {/* Minimize button outside - floating above */}
      <div className="flex justify-end mb-1">
        <Button
          size="sm"
          className="w-7 h-7 p-0 rounded-full shadow-lg"
          onClick={onToggleMinimize}
          title="Expand player"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Timeline with labels on sides */}
      <Container className="!py-2 !px-3 shadow-lg">
        <Timeline
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      </Container>
    </div>
  );
};