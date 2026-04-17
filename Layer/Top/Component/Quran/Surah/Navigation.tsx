import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { surahList } from "@/Bottom/API/Quran";
import { Button } from "@/Top/Component/UI/Button";

interface SurahNavigationProps {
  currentSurahId: number;
}

export function SurahNavigation({ currentSurahId }: SurahNavigationProps) {
  const prevSurah = surahList.find((s) => s.id === currentSurahId - 1);
  const nextSurah = surahList.find((s) => s.id === currentSurahId + 1);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex items-center justify-center gap-3 py-4 border-border mt-8 flex-wrap">
      {prevSurah && (
        <Link to={`/Quran/Surah/${prevSurah.id}`}>
          <Button className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Previous Surah
          </Button>
        </Link>
      )}

      <Button onClick={scrollToTop}>
        Beginning of Surah
      </Button>

      {nextSurah && (
        <Link to={`/Quran/Surah/${nextSurah.id}`}>
          <Button className="gap-2">
            Next Surah
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}