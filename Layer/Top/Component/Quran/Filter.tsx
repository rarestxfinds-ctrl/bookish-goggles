import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { surahList } from "@/Bottom/API/Quran";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";
import { SlidingPill } from "@/Top/Component/UI/Sliding-Pill";
import { cn } from "@/Middle/Library/utils";

interface FilterProps {
  isOpen: boolean;
  onClose: () => void;
  filterType: "surah" | "juz" | "hizb" | "page" | "revelation" | null;
  setFilterType: (type: "surah" | "juz" | "hizb" | "page" | "revelation" | null) => void;
  selectedSurah: number | null;
  setSelectedSurah: (surah: number | null) => void;
  selectedAyah: number | null;
  setSelectedAyah: (ayah: number | null) => void;
  revelationOrder: "asc" | "desc";
  setRevelationOrder: (order: "asc" | "desc") => void;
  onApply: () => void;
  onReset: () => void;
}

export function Filter({
  isOpen,
  onClose,
  filterType,
  setFilterType,
  selectedSurah,
  setSelectedSurah,
  selectedAyah,
  setSelectedAyah,
  revelationOrder,
  setRevelationOrder,
  onApply,
  onReset,
}: FilterProps) {
  const [showSurahDropdown, setShowSurahDropdown] = useState(false);
  const [showAyahDropdown, setShowAyahDropdown] = useState(false);
  
  const selectedSurahMeta = selectedSurah ? surahList.find(s => s.id === selectedSurah) : null;
  const ayahs = selectedSurahMeta ? Array.from({ length: selectedSurahMeta.numberOfAyahs }, (_, i) => i + 1) : [];

  if (!isOpen) return null;

  const orderOptions = [
    { id: "asc", label: "Ascending" },
    { id: "desc", label: "Descending" },
    { id: "revelation", label: "Revelation" },
  ];

  const getOrderValue = () => {
    if (revelationOrder === "asc") return "asc";
    if (revelationOrder === "desc") return "desc";
    return "revelation";
  };

  const handleOrderChange = (value: string) => {
    if (value === "asc") setRevelationOrder("asc");
    else if (value === "desc") setRevelationOrder("desc");
    else setRevelationOrder("revelation");
  };

  return (
    <div className="absolute right-0 mt-2 w-80 z-50">
      <Container className="!p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Filter
          </h3>
          {(filterType || selectedSurah) && (
            <Button onClick={onReset} size="sm" className="text-xs">
              Clear
            </Button>
          )}
        </div>

        {/* Filter Type Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => {
              setFilterType("surah");
              setSelectedSurah(null);
              setSelectedAyah(null);
            }}
            size="sm"
            active={filterType === "surah"}
            className="text-xs"
          >
            Surah
          </Button>
          <Button
            onClick={() => {
              setFilterType("juz");
              setSelectedSurah(null);
              setSelectedAyah(null);
            }}
            size="sm"
            active={filterType === "juz"}
            className="text-xs"
          >
            Juz
          </Button>
          <Button
            onClick={() => {
              setFilterType("hizb");
              setSelectedSurah(null);
              setSelectedAyah(null);
            }}
            size="sm"
            active={filterType === "hizb"}
            className="text-xs"
          >
            Hizb
          </Button>
          <Button
            onClick={() => {
              setFilterType("page");
              setSelectedSurah(null);
              setSelectedAyah(null);
            }}
            size="sm"
            active={filterType === "page"}
            className="text-xs"
          >
            Page
          </Button>
        </div>

        {/* Surah & Revelation Section */}
        {(filterType === "surah" || filterType === "revelation") && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            {/* Surah Dropdown */}
            {filterType === "surah" && (
              <div className="relative">
                <Button
                  onClick={() => setShowSurahDropdown(!showSurahDropdown)}
                  className="w-full justify-between"
                  fullWidth
                >
                  <span>
                    {selectedSurahMeta ? `${selectedSurahMeta.id}. ${selectedSurahMeta.englishName}` : "Select Surah"}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showSurahDropdown && "rotate-180")} />
                </Button>
                {showSurahDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto z-[100]">
                    <Container className="!p-1">
                      {surahList.map((surah) => (
                        <button
                          key={surah.id}
                          onClick={() => {
                            setSelectedSurah(surah.id);
                            setSelectedAyah(null);
                            setShowSurahDropdown(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                            "text-black dark:text-white",
                            selectedSurah === surah.id
                              ? "bg-black dark:bg-white text-white dark:text-black"
                              : "hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                          )}
                        >
                          {surah.id}. {surah.englishName}
                        </button>
                      ))}
                    </Container>
                  </div>
                )}
              </div>
            )}

            {/* Ayah Dropdown */}
            {filterType === "surah" && selectedSurah && (
              <div className="relative">
                <Button
                  onClick={() => setShowAyahDropdown(!showAyahDropdown)}
                  className="w-full justify-between"
                  fullWidth
                >
                  <span>
                    {selectedAyah ? `Ayah ${selectedAyah}` : "All Ayahs"}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showAyahDropdown && "rotate-180")} />
                </Button>
                {showAyahDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto z-[100]">
                    <Container className="!p-1">
                      <button
                        onClick={() => {
                          setSelectedAyah(null);
                          setShowAyahDropdown(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                          "text-black dark:text-white",
                          selectedAyah === null
                            ? "bg-black dark:bg-white text-white dark:text-black"
                            : "hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                        )}
                      >
                        All Ayahs
                      </button>
                      {ayahs.map((ayah) => (
                        <button
                          key={ayah}
                          onClick={() => {
                            setSelectedAyah(ayah);
                            setShowAyahDropdown(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                            "text-black dark:text-white",
                            selectedAyah === ayah
                              ? "bg-black dark:bg-white text-white dark:text-black"
                              : "hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
                          )}
                        >
                          Ayah {ayah}
                        </button>
                      ))}
                    </Container>
                  </div>
                )}
              </div>
            )}

            {/* Order SlidingPill */}
            {(filterType === "surah" || filterType === "revelation") && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Order
                </p>
                <SlidingPill
                  options={orderOptions}
                  value={getOrderValue()}
                  onChange={handleOrderChange}
                  size="sm"
                />
              </div>
            )}
          </div>
        )}

        <Button
          onClick={onApply}
          fullWidth
          className="mt-2"
        >
          Apply
        </Button>
      </Container>
    </div>
  );
}