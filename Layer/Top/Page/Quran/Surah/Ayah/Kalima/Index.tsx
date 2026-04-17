import { useParams } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { SurahNavbar } from "@/Top/Component/Quran/Surah/Navbar";
import { SurahNavigation } from "@/Top/Component/Quran/Surah/Navigation";
import { AudioPlayer } from "@/Top/Component/Audio-Player/Index";
import { SurahHeader } from "@/Top/Component/Quran/Surah/Header";
import { useAudioPlayback } from "@/Top/Component/Quran/Layout/Safhah/Utility";
import { NotesDialog } from "@/Top/Component/Dialog/Notes";
import { ShareDialog } from "@/Top/Component/Dialog/Share";
import { SurahInfoDialog } from "@/Top/Component/Dialog/Surah-Info";
import { surahList, juzData } from "@/Bottom/API/Quran";
import { useApp } from "@/Middle/Context/App";
import { useAudio } from "@/Middle/Context/Audio";
import { useQuranData } from "@/Middle/Hook/Use-Quran-Data";
import { useReadingSession } from "@/Middle/Hook/Use-Reading-Session";
import { useQuranGoals } from "@/Middle/Hook/Use-Quran-Goals";
import { Button } from "@/Top/Component/UI/button";
import { Skeleton } from "@/Top/Component/UI/Skeleton";
import { AlertCircle, Info, Play, Pause, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Alert, AlertDescription } from "@/Top/Component/UI/Alert";
import { cn } from "@/Middle/Library/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Top/Component/UI/tooltip";
import { useTranslation } from "@/Middle/Hook/Use-Translation";

const KalimaIndex = () => {
  const { id, verseId, kalimaId } = useParams<{ id: string; verseId: string; kalimaId: string }>();
  const surahId = parseInt(id || "1");
  const verseNum = parseInt(verseId || "1");
  const wordIndex = parseInt(kalimaId || "1") - 1; // 0‑based
  const surah = surahList.find((s) => s.id === surahId) || surahList[0];

  const { t } = useTranslation();
  const {
    fontSize, quranFont, showArabicText,
  } = useApp();

  const { stop: stopAudio, isPlaying: isAudioPlaying, isLoading: isAudioLoading, currentSurah, playFullSurah, togglePlayPause } = useAudio();
  const { data: surahData, isLoading, error, refetch } = useQuranData(surahId);
  const verses = surahData?.verses;
  const verse = verses?.find((v) => v.verseNumber === verseNum);
  const word = verse?.words[wordIndex];

  const { startSession, stopSession, saveMinutesToGoal } = useReadingSession();
  const { activeGoal } = useQuranGoals();

  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [surahInfoDialog, setSurahInfoDialog] = useState(false);
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; ayahId?: number; verseText?: string }>({ open: false });
  const [shareDialog, setShareDialog] = useState<{ open: boolean; ayahId?: number; verseText?: string; translation?: string }>({ open: false });

  const wordRef = useRef<HTMLSpanElement>(null);
  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const { playWordAudio, isPlaying: isWordPlaying } = useAudioPlayback(surahId);

  const { currentJuz, currentHizb, currentPage } = useMemo(() => {
    const juzInfo = juzData.find(juz => juz.surahs.some(s => s.id === surahId));
    const juzNumber = juzInfo?.juzNumber || 1;
    const totalVersesBefore = surahList.filter(s => s.id < surahId).reduce((sum, s) => sum + s.numberOfAyahs, 0);
    const pageNumber = Math.ceil((totalVersesBefore / 6236) * 604) || 1;
    return { currentJuz: juzNumber, currentHizb: (juzNumber - 1) * 2 + 1, currentPage: pageNumber };
  }, [surahId]);

  const getFontClass = () => {
    switch (quranFont) {
      case "indopak":    return "font-indopak";
      case "uthmani_v1": return "font-uthmani_v1";
      case "uthmani_v2": return "font-uthmani_v2";
      case "uthmani_v4": return "font-uthmani_v4";
      default:           return "font-uthmani";
    }
  };

  const arabicFontSize = `${(1.5 * fontSize) / 5}rem`;

  // Full surah audio
  const isThisSurahPlaying = currentSurah === surahId && isAudioPlaying;
  const handleAudioClick = () => {
    setShowAudioPlayer(true);
    if (isThisSurahPlaying) {
      togglePlayPause();
    } else if (currentSurah === surahId && !isAudioPlaying) {
      togglePlayPause();
    } else {
      playFullSurah(surahId);
    }
  };

  // Word audio
  const handleWordAudio = () => {
    if (word && verse) {
      playWordAudio(verseNum, wordIndex);
    }
  };
  const isWordCurrentlyPlaying = word && verse && isWordPlaying(`word-${verseNum}-${wordIndex}`);

  // Navigation
  const totalWordsInVerse = verse?.words.length || 0;
  const hasPrevWord = verse && wordIndex > 0;
  const hasNextWord = verse && wordIndex < totalWordsInVerse - 1;
  const hasPrevVerse = verseNum > 1;
  const hasNextVerse = verses && verseNum < verses.length;

  const getPrevUrl = () => {
    if (hasPrevWord) return `/Quran/Surah/${surahId}/Ayah/${verseNum}/Kalima/${wordIndex}`; // 1‑based
    if (hasPrevVerse) {
      const prevVerse = verses![verseNum - 2];
      const lastWordIdx = prevVerse.words.length;
      return `/Quran/Surah/${surahId}/Ayah/${verseNum - 1}/Kalima/${lastWordIdx}`;
    }
    return null;
  };

  const getNextUrl = () => {
    if (hasNextWord) return `/Quran/Surah/${surahId}/Ayah/${verseNum}/Kalima/${wordIndex + 2}`;
    if (hasNextVerse) return `/Quran/Surah/${surahId}/Ayah/${verseNum + 1}/Kalima/1`;
    return null;
  };

  useEffect(() => {
    startSession();
    return () => {
      stopSession().then((minutes) => {
        if (activeGoal && minutes > 0) saveMinutesToGoal(activeGoal.id, minutes);
      });
    };
  }, [surahId]);

  useEffect(() => {
    if (wordRef.current) {
      setTimeout(() => wordRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }, [word]);

  if (isLoading) {
    return (
      <Layout hideFooter>
        <SurahNavbar surahName={surah.englishName} surahId={surah.id} juz={currentJuz} hizb={currentHizb} page={currentPage} />
        <div className="container py-8 max-w-4xl mx-auto pb-24">
          <div className="p-6 border border-border rounded-xl">
            <Skeleton className="h-8 w-full mb-4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !verse || !word) {
    return (
      <Layout hideFooter>
        <SurahNavbar surahName={surah.englishName} surahId={surah.id} juz={currentJuz} hizb={currentHizb} page={currentPage} />
        <div className="container py-8 max-w-4xl mx-auto pb-24">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load word data. Please try again later.</AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <SurahNavbar
        surahName={surah.englishName}
        surahId={surah.id}
        juz={currentJuz}
        hizb={currentHizb}
        page={currentPage}
      />

      <div className="container pt-28 max-w-4xl mx-auto pb-24">
        {/* Simple header */}
        <div className="glass-container !rounded-xl !block w-full mb-6">
          <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">
                {surah.id}:{verse.verseNumber}.{wordIndex + 1}
              </span>
              <div
                className="font-surah leading-tight"
                style={{ fontSize: `calc(${arabicFontSize} * 1.2)` }}
              >
                {surah.surahFontName}
              </div>
              <div className="text-sm text-muted-foreground">
                {surah.englishNameTranslation}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSurahInfoDialog(true)}
                      className="p-2 rounded-lg hover:bg-muted/10 transition-colors"
                      aria-label="Surah info"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{t.quran.surahInfo}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-2 rounded-lg hover:bg-muted/10 transition-colors disabled:opacity-50"
                      disabled={isAudioLoading}
                      onClick={handleAudioClick}
                      aria-label={isThisSurahPlaying ? "Pause" : "Play surah"}
                    >
                      {isAudioLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isThisSurahPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isThisSurahPlaying ? t.quran.pauseAudio : t.quran.playAudio}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Word card */}
        <div className="glass-container !rounded-xl !block w-full">
          <div className="p-12 text-center">
            <span
              ref={wordRef}
              className={cn(
                "inline-block transition-all duration-200 select-text cursor-pointer",
                getFontClass(),
                isWordCurrentlyPlaying && "text-primary animate-pulse",
                "hover:text-primary"
              )}
              style={{
                fontSize: `calc(${arabicFontSize} * 1.8)`,
              }}
              onClick={handleWordAudio}
            >
              {word}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mt-6">
          {getPrevUrl() ? (
            <a
              href={getPrevUrl()!}
              className="glass-btn px-4 py-2 text-sm flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </a>
          ) : (
            <div className="w-24" />
          )}
          <div className="flex-1" />
          {getNextUrl() ? (
            <a
              href={getNextUrl()!}
              className="glass-btn px-4 py-2 text-sm flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </a>
          ) : (
            <div className="w-24" />
          )}
        </div>

        <SurahNavigation
          currentSurahId={surahId}
          totalVerses={surah.numberOfAyahs}
        />
      </div>

      <AudioPlayer
        isVisible={showAudioPlayer}
        onClose={() => { stopAudio(); setShowAudioPlayer(false); }}
        surahId={surahId}
        surahName={surah.englishName}
      />

      <NotesDialog
        open={notesDialog.open}
        onOpenChange={(open) => setNotesDialog({ ...notesDialog, open })}
        surahId={surahId}
        surahName={surah.englishName}
        ayahId={notesDialog.ayahId}
        verseText={notesDialog.verseText}
      />
      <ShareDialog
        open={shareDialog.open}
        onOpenChange={(open) => setShareDialog({ ...shareDialog, open })}
        surahId={surahId}
        surahName={surah.englishName}
        ayahId={shareDialog.ayahId}
        verseText={shareDialog.verseText}
        translation={shareDialog.translation}
      />
      <SurahInfoDialog
        open={surahInfoDialog}
        onOpenChange={setSurahInfoDialog}
        surahId={surahId}
        surah={surah}
      />
    </Layout>
  );
};

export default KalimaIndex;