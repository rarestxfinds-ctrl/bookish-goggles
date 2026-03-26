import { useState } from "react";
import { Layout } from "@/Top/Component/Layout/Layout";
import { SurahCard } from "@/Top/Component/Surah/Card";
import { surahList, juzData, getSurahsByRevelationOrder, getSurah } from "@/Bottom/API/Quran";
import hizbData from "@/Bottom/Data/Quran/Meta/Hizb.json";
import { Filter } from "@/Top/Component/Quran/Filter";
import { TrendingUp, Filter as FilterIcon, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/Middle/Context/Auth-Context";
import { useReadingProgress } from "@/Middle/Hook/Use-Reading-Progress";
import { useQuery } from "@tanstack/react-query";

const revelationOrderedSurahs = getSurahsByRevelationOrder();

// Get unique hizb numbers (1-60)
const hizbNumbers = Array.from({ length: 60 }, (_, i) => i + 1);

const Quran = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<"surah" | "juz" | "hizb" | "page" | "revelation" | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [revelationOrder, setRevelationOrder] = useState<"asc" | "desc">("asc");
  const { user } = useAuth();
  const { progress } = useReadingProgress();
  const navigate = useNavigate();

  const continueReadingSurah = progress ? surahList.find((s) => s.id === progress.last_surah_id) : null;

  const { data: surahData } = useQuery({
    queryKey: ['surah', selectedSurah],
    queryFn: () => selectedSurah ? getSurah(selectedSurah) : null,
    enabled: !!selectedSurah,
  });

  const selectedSurahMeta = selectedSurah ? surahList.find(s => s.id === selectedSurah) : null;
  const ayahs = selectedSurahMeta ? Array.from({ length: selectedSurahMeta.numberOfAyahs }, (_, i) => i + 1) : [];

  const getView = () => {
    if (selectedSurah && selectedAyah && surahData) {
      const verse = surahData.verses[selectedAyah - 1];
      return {
        type: "kalimah",
        data: verse?.words.map((word: string, idx: number) => ({
          text: word,
          index: idx,
          translation: verse?.wbwTranslation?.[idx]
        })) || []
      };
    }
    
    if (selectedSurah && !selectedAyah) {
      return { type: "ayahs", data: ayahs, surah: selectedSurahMeta };
    }
    
    if (filterType === "juz") {
      return { type: "juz", data: juzData };
    }
    
    if (filterType === "hizb") {
      return { type: "hizb", data: hizbNumbers };
    }
    
    if (filterType === "page") {
      return { type: "page", data: Array.from({ length: 604 }, (_, i) => i + 1) };
    }
    
    if (filterType === "revelation") {
      const sorted = revelationOrder === "asc" ? revelationOrderedSurahs : [...revelationOrderedSurahs].reverse();
      return { type: "surahs", data: sorted };
    }
    
    return { type: "surahs", data: surahList };
  };

  const view = getView();

  const handleApplyFilter = () => {
    setShowFilter(false);
  };

  const handleReset = () => {
    setFilterType(null);
    setSelectedSurah(null);
    setSelectedAyah(null);
    setRevelationOrder("asc");
  };

  const getFilterLabel = () => {
    if (selectedSurah && selectedAyah) return `Surah ${selectedSurah}, Ayah ${selectedAyah}`;
    if (selectedSurah) return `Surah ${selectedSurah}`;
    if (filterType === "juz") return "Juz";
    if (filterType === "hizb") return "Hizb";
    if (filterType === "page") return "Page";
    if (filterType === "revelation") return revelationOrder === "asc" ? "Revelation (1→114)" : "Revelation (114→1)";
    return "Filter";
  };

  return (
    <Layout>
      <section className="py-6 sm:py-8">
        <div className="container">
          <div className="glass-card flex items-center justify-between p-4 sm:p-6">
            <div className="flex-1">
              <div className="flex items-center justify-between w-full mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">Continue Reading</h2>
                <Link
                  to={continueReadingSurah
                    ? `/Quran/Surah/${continueReadingSurah.id}?verse=${progress?.last_ayah_id || 1}`
                    : "/Quran/Surah/1"
                  }
                  className="glass-btn px-3 py-1.5 text-xs text-primary"
                >
                  Verse {progress?.last_ayah_id || 1} →
                </Link>
              </div>
              <div className="mb-3">
                <p className="font-surah text-2xl sm:text-3xl mb-2" dir="rtl">
                  {continueReadingSurah?.surahFontName || "001"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base">
                  {continueReadingSurah
                    ? `${continueReadingSurah.id}. ${continueReadingSurah.englishName}`
                    : "1. Al-Fatihah"}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ({continueReadingSurah?.englishNameTranslation || "The Opener"})
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (!user) { navigate("/Sign-Up"); return; }
                navigate("/Quran/Goals");
              }}
              className="glass-btn px-3 py-2 text-sm"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Goals
            </button>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="container">
          <div className="relative flex justify-end mb-6">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`glass-btn px-4 py-2 text-sm flex items-center gap-2 ${
                filterType || selectedSurah ? "bg-primary/20 text-primary" : ""
              }`}
            >
              <FilterIcon className="h-4 w-4" />
              {getFilterLabel()}
              <ChevronDown className={`h-3 w-3 transition-transform ${showFilter ? "rotate-180" : ""}`} />
            </button>
            <Filter
              isOpen={showFilter}
              onClose={() => setShowFilter(false)}
              filterType={filterType}
              setFilterType={setFilterType}
              selectedSurah={selectedSurah}
              setSelectedSurah={setSelectedSurah}
              selectedAyah={selectedAyah}
              setSelectedAyah={setSelectedAyah}
              revelationOrder={revelationOrder}
              setRevelationOrder={setRevelationOrder}
              onApply={handleApplyFilter}
              onReset={handleReset}
            />
          </div>

          {/* Kalimah View */}
          {view.type === "kalimah" && (
            <div className="space-y-3">
              {view.data.map((word: any, idx: number) => (
                <Link
                  key={idx}
                  to={`/Quran/Surah/${selectedSurah}/Ayah/${selectedAyah}/Kalima/${idx + 1}`}
                  className="glass-card p-4 flex items-center justify-between hover:border-primary transition-all"
                >
                  <span className="text-sm text-muted-foreground">{idx + 1}</span>
                  <div className="text-right">
                    <p className="font-surah text-xl" dir="rtl">{word.text}</p>
                    {word.translation && (
                      <p className="text-xs text-muted-foreground mt-1">{word.translation}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Ayahs View */}
          {view.type === "ayahs" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {view.data.map((ayahNum: number) => (
                <button
                  key={ayahNum}
                  onClick={() => setSelectedAyah(ayahNum)}
                  className="glass-card p-4 text-center hover:border-primary transition-all"
                >
                  <p className="font-semibold text-lg">{ayahNum}</p>
                </button>
              ))}
            </div>
          )}

          {/* Juz View */}
          {view.type === "juz" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {view.data.map((juz: any) => (
                <Link
                  key={juz.juzNumber}
                  to={`/Quran/Page/${Math.ceil(juz.juzNumber * 20)}`}
                  className="glass-card p-4 text-center hover:border-primary transition-all"
                >
                  <p className="font-semibold text-lg">{juz.juzNumber}</p>
                </Link>
              ))}
            </div>
          )}

          {/* Hizb View */}
          {view.type === "hizb" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {view.data.map((hizbNum: number) => {
                const pageNumber = Math.ceil((hizbNum / 60) * 604);
                return (
                  <Link
                    key={hizbNum}
                    to={`/Quran/Page/${pageNumber}`}
                    className="glass-card p-4 text-center hover:border-primary transition-all"
                  >
                    <p className="font-semibold text-lg">{hizbNum}</p>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Page View */}
          {view.type === "page" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {view.data.map((pageNum: number) => (
                <Link
                  key={pageNum}
                  to={`/Quran/Page/${pageNum}`}
                  className="glass-card p-4 text-center hover:border-primary transition-all"
                >
                  <p className="font-semibold text-lg">{pageNum}</p>
                </Link>
              ))}
            </div>
          )}

          {/* Surahs View */}
          {view.type === "surahs" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {view.data.map((surah: any) => (
                <div
                  key={surah.id}
                  onClick={() => {
                    if (filterType === "surah") {
                      setSelectedSurah(surah.id);
                    } else {
                      navigate(`/Quran/Surah/${surah.id}`);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <SurahCard surah={surah} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Quran;