import { useParams } from "react-router-dom";
import { Layout } from "@/Top/Component/Layout/Index";
import { SurahNavbar } from "@/Top/Component/Quran/Surah/Navbar";
import { SurahNavigation } from "@/Top/Component/Quran/Surah/Navigation";
import { AudioPlayer } from "@/Top/Component/Audio-Player/Index";
import { SurahHeader } from "@/Top/Component/Quran/Surah/Header";
import { VerseCard } from "@/Top/Component/Quran/Layout/Ayah/Main";
import { PageLines } from "@/Top/Component/Quran/Layout/Safhah/Main";
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
import { AlertCircle } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Alert, AlertDescription } from "@/Top/Component/UI/Alert";

const AyahIndex = () => {
  const { id, verseId } = useParams<{ id: string; verseId: string }>();
  const surahId  = parseInt(id || "1");
  const verseNum = parseInt(verseId || "1");
  const surah    = surahList.find((s) => s.id === surahId) || surahList[0];

  const {
    layout, fontSize, translationFontSize, quranFont,
    showArabicText, verseTranslation, hoverTranslation, inlineTranslation,
  } = useApp();

  const { stop: stopAudio, isPlaying } = useAudio();
  const { data: surahData, isLoading, error, refetch } = useQuranData(surahId);
  const verses = surahData?.verses;
  const verse  = verses?.find((v) => v.verseNumber === verseNum);

  const { startSession, stopSession, saveMinutesToGoal } = useReadingSession();
  const { activeGoal } = useQuranGoals();

  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [surahInfoDialog, setSurahInfoDialog]  = useState(false);
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; ayahId?: number; verseText?: string }>({ open: false });
  const [shareDialog, setShareDialog] = useState<{ open: boolean; ayahId?: number; verseText?: string; translation?: string }>({ open: false });

  const verseRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const isPageLayout = layout === "page";

  const { currentJuz, currentHizb, currentPage } = useMemo(() => {
    const juzInfo    = juzData.find(juz => juz.surahs.some(s => s.id === surahId));
    const juzNumber  = juzInfo?.juzNumber || 1;
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

  const arabicFontSize         = `${(1.5 * fontSize) / 5}rem`;
  const translationFontSizeValue = `${(1 * translationFontSize) / 3}rem`;

  // For page layout, we need to build a single line of resolved words for this verse
  const pageLayoutWords = useMemo(() => {
    if (!isPageLayout || !verse) return null;
    // Each word in the verse becomes a resolved word object
    const words = verse.words.map((glyph, idx) => ({
      glyph,
      verse,
      wordIndex: idx,
      isVerseEnd: idx === verse.words.length - 1,
      isVerseNumber: false,
      verseNumber: undefined,
    }));
    // We create a single line (array of words) and wrap in an array of lines
    return [words];
  }, [isPageLayout, verse]);

  useEffect(() => {
    startSession();
    return () => {
      stopSession().then((minutes) => {
        if (activeGoal && minutes > 0) saveMinutesToGoal(activeGoal.id, minutes);
      });
    };
  }, [surahId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to verse on load
  useEffect(() => {
    if (verse) {
      const el = verseRefs.current.get(verseNum);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }, [verse, verseNum]);

  if (isLoading) {
    return (
      <Layout hideFooter>
        <SurahNavbar surahName={surah.englishName} surahId={surah.id} juz={currentJuz} hizb={currentHizb} page={currentPage} />
        <div className="container py-8 max-w-4xl mx-auto pb-24 space-y-4">
          <div className="p-6 border border-border rounded-xl">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !verse) {
    return (
      <Layout hideFooter>
        <SurahNavbar surahName={surah.englishName} surahId={surah.id} juz={currentJuz} hizb={currentHizb} page={currentPage} />
        <div className="container py-8 max-w-4xl mx-auto pb-24">
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load verse data. Please try again later.</AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const showBismillah = surahId !== 1 && surahId !== 9 && showArabicText;

  // Compute word count for the header (optional)
  const wordCount = verse.words.length;

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
        <SurahHeader
          surah={surah}
          wordCount={wordCount}
          showBismillah={showBismillah}
          fontClass={getFontClass()}
          arabicFontSize={arabicFontSize}
          onInfoClick={() => setSurahInfoDialog(true)}
          onAudioClick={() => setShowAudioPlayer(true)}
        />

        {isPageLayout ? (
          <div className="glass-container !rounded-xl overflow-hidden !block">
            <div className="pt-4 px-6 sm:px-8 pb-4">
              <PageLines
                resolvedLines={pageLayoutWords!}
                fontClass={getFontClass()}
                arabicFontSize={arabicFontSize}
                wordSpacing="1.8px"
                surahId={surahId}
                verseRefs={verseRefs}
                hoveredVerse={null}
                setHoveredVerse={() => {}}
              />
            </div>
          </div>
        ) : (
          <VerseCard
            verse={verse}
            surah={surah}
            showArabicText={showArabicText}
            verseTranslation={verseTranslation}
            translationFontSize={translationFontSizeValue}
            isHighlighted={true}
            verseRef={(el) => { if (el) verseRefs.current.set(verse.verseNumber, el); }}
            onNotesClick={() => setNotesDialog({ open: true, ayahId: verse.verseNumber, verseText: verse.arabic })}
            onShareClick={() => setShareDialog({ open: true, ayahId: verse.verseNumber, verseText: verse.arabic, translation: verse.translation })}
          />
        )}

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

export default AyahIndex;