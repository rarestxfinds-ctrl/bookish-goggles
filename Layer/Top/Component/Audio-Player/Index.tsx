import { memo, useState } from "react";
import { createPortal } from "react-dom";
import { useAudio } from "@/Middle/Context/Audio";
import { surahList } from "@/Bottom/API/Quran";
import { AudioPlayerMain } from "./Main";
import type { AudioPlayerProps, SettingsMenu } from "./Types";

export const AudioPlayer = memo(function AudioPlayer({
  isVisible,
  onClose,
  surahId,
  surahName,
}: AudioPlayerProps) {
  const {
    isPlaying,
    isLoading,
    currentSurah,
    currentPage,
    currentTime,
    duration,
    progress,
    togglePlayPause,
    stop,
    seekTo,
    setVolume,
    repeatMode,
    setRepeatMode,
    playbackSpeed,
    setPlaybackSpeed,
    playbackMode,
  } = useAudio();

  const [volume, setLocalVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsMenu, setSettingsMenu] = useState<SettingsMenu>("main");
  const [isMinimized, setIsMinimized] = useState(false);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setLocalVolume(newVolume);
    setVolume(isMuted ? 0 : newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setVolume(isMuted ? volume : 0);
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleClose = () => {
    stop();
    setIsMinimized(false); // reset minimize state when closed
    onClose();
  };

  const resolvedSurahId = currentSurah ?? surahId;
  const currentSurahData = resolvedSurahId
    ? surahList.find((s) => s.id === resolvedSurahId)
    : null;

  const trackTitle = currentSurahData
    ? currentSurahData.englishName
    : surahName ?? (currentPage ? `Page ${currentPage}` : null);

  if (!isVisible) return null;

  return createPortal(
    <AudioPlayerMain
      isPlaying={isPlaying}
      isLoading={isLoading}
      progress={progress}
      currentTime={currentTime}
      duration={duration}
      trackTitle={trackTitle}
      repeatMode={repeatMode}
      playbackSpeed={playbackSpeed}
      playbackMode={playbackMode}
      volume={volume}
      isMuted={isMuted}
      settingsOpen={settingsOpen}
      settingsMenu={settingsMenu}
      minimized={isMinimized}
      onTogglePlayPause={togglePlayPause}
      onSeek={handleSeek}
      onVolumeChange={handleVolumeChange}
      onToggleMute={toggleMute}
      onSettingsOpenChange={setSettingsOpen}
      onSettingsMenuChange={setSettingsMenu}
      onRepeatModeChange={setRepeatMode}
      onPlaybackSpeedChange={setPlaybackSpeed}
      onClose={handleClose}
      onToggleMinimize={() => setIsMinimized(!isMinimized)}
    />,
    document.body
  );
});