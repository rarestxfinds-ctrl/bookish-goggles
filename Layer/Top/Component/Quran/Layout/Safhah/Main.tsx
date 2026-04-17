// src/Top/Component/Quran/Layout/Safhah/Main.tsx
import React, { memo, useMemo } from "react";
import { useApp } from "@/Middle/Context/App";
import { useAudio } from "@/Middle/Context/Audio";
import { WordTooltip, useAudioPlayback, extractVerseNumberFromMarker } from "./Utility";
import type { PageLinesProps } from "./Types";

const LATIN_FONT_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)",
  fontFeatureSettings: "normal",
  fontVariant: "normal",
  fontWeight: 400,
};

export const PageLines = memo(function PageLines({
  resolvedLines,
  fontClass,
  arabicFontSize,
  wordSpacing,
  surahId,
  verseRefs,
  hoveredVerse,
  setHoveredVerse,
  showTransliteration,
  transliterationFontSize,
  hoverTranslation,
  inlineTranslation,
  inlineTransliteration,
  hideVerses = false,
  hideVerseMarkers = false,
}: PageLinesProps) {
  const { hoverRecitation, hifz } = useApp();
  const { activeVerse, activeWord, playAyah } = useAudio();
  const { playWordAudio, isPlaying } = useAudioPlayback(surahId);

  const inlineTranslationSize = Math.max(12);
  const inlineTransliterationSize = Math.max(12);

  const isHoverTranslationEnabled = useMemo(
    () => hoverTranslation !== "None" && hoverTranslation !== false,
    [hoverTranslation],
  );

  const showInlineTranslation = inlineTranslation !== "None";
  const showInlineTransliteration = inlineTransliteration !== "None";
  const anyInlineActive = showInlineTranslation || showInlineTransliteration;

  // Helper: check if a word is marked as completed (memorized)
  const isWordCompleted = (verse: any, wordIndex: number): boolean => {
    if (!verse) return false;
    return hifz.isWordCompleted(surahId, verse.verseNumber, wordIndex);
  };

  // Build class name – NO extra colors for completed words, only opacity handled separately
  const buildWordClassName = (
    isVerseHighlighted: boolean,
    isVerseMarker: boolean,
    isVerseEnd: boolean,
    isActive: boolean,
    isPlayingAudio: boolean,
  ): string => {
    let cls = "select-text transition-colors duration-200 inline ";
    if (isVerseHighlighted && !isVerseMarker) {
      cls += "text-primary";
    } else if (isActive) {
      cls += "text-emerald-500 animate-pulse";
    } else if (isPlayingAudio) {
      cls += "text-primary animate-pulse";
    } else if (isVerseEnd || isVerseMarker) {
      cls += "text-muted-foreground hover:text-primary cursor-pointer";
    } else {
      cls += "text-foreground hover:text-primary";
    }
    return cls;
  };

  const buildHandlers = (word: any) => {
    const { glyph, verse, wordIndex, isVerseEnd, isVerseNumber } = word;

    let handleClick: (() => void) | undefined;
    if (verse) {
      handleClick = isVerseEnd
        ? () => playAyah(surahId, verse.verseNumber)
        : () => playWordAudio(verse.verseNumber, wordIndex);
    } else if (isVerseNumber) {
      const vn = extractVerseNumberFromMarker(glyph);
      if (vn !== null) handleClick = () => playAyah(surahId, vn);
    }

    const handleMouseEnter = () => {
      if (isVerseNumber) {
        const vn = extractVerseNumberFromMarker(glyph);
        if (vn !== null) setHoveredVerse(vn);
      } else if (isVerseEnd && verse) {
        setHoveredVerse(verse.verseNumber);
      }
    };

    const handleMouseLeave = () => {
      if (isVerseNumber || isVerseEnd) setHoveredVerse(null);
    };

    return { handleClick, handleMouseEnter, handleMouseLeave };
  };

  const renderWordColumn = (word: any, idx: number, isFirstInLine = false) => {
    const {
      glyph,
      verse,
      wordIndex,
      isVerseEnd,
      isVerseNumber,
      verseNumber: markerVerseNumber,
    } = word;

    const isVerseMarker = verse !== null && wordIndex === verse.words.length - 1;

    // Determine if this word should be hidden when hideVerses is true
    const shouldHideBySetting = (hideVerses && !isVerseMarker) || (hideVerseMarkers && isVerseMarker);
    const wordCompleted = verse ? isWordCompleted(verse, wordIndex) : false;

    // If the word is completed, it becomes visible regardless of hideVerses
    const shouldBeVisible = !shouldHideBySetting || wordCompleted;
    const opacityClass = shouldBeVisible ? "opacity-100" : "opacity-0";
    const transitionClass = "transition-opacity duration-300";

    const belongsToVerse = verse?.verseNumber ?? markerVerseNumber;
    const isVerseHighlighted = hoveredVerse !== null && belongsToVerse === hoveredVerse;

    const hoverTranslationText =
      !isVerseEnd && !isVerseMarker && verse
        ? verse.wbwTranslationHover?.[wordIndex]
        : undefined;

    const inlineTranslationText =
      !isVerseEnd && !isVerseMarker && verse && showInlineTranslation
        ? verse.wbwTranslationInline?.[wordIndex]
        : undefined;

    const hoverTransliterationText =
      !isVerseEnd && !isVerseMarker && verse
        ? verse.wbwTransliterationHover?.[wordIndex]
        : undefined;

    const inlineTransliterationText =
      !isVerseEnd && !isVerseMarker && verse && showInlineTransliteration
        ? verse.wbwTransliterationInline?.[wordIndex]
        : undefined;

    const wordKey = verse ? `word-${verse.verseNumber}-${wordIndex}` : null;
    const ayahKey = verse ? `ayah-${verse.verseNumber}` : null;
    const isPlayingAudio =
      (wordKey !== null && isPlaying(wordKey)) ||
      (ayahKey !== null && isPlaying(ayahKey));

    const isActive =
      !isVerseEnd &&
      !isVerseMarker &&
      verse?.verseNumber === activeVerse &&
      wordIndex === activeWord;

    const { handleClick, handleMouseEnter, handleMouseLeave } = buildHandlers(word);

    // New click handler: only toggle memorization when hideVerses is true
    const handleWordClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Only toggle memorization when hideVerses is enabled
      if (hideVerses && verse && !isVerseMarker) {
        if (wordCompleted) {
          hifz.unmarkWordCompleted(surahId, verse.verseNumber, wordIndex);
        } else {
          hifz.markWordCompleted(surahId, verse.verseNumber, wordIndex);
        }
      }
      // Always play audio if there is a click handler
      if (handleClick) handleClick();
    };

    const spanClass = buildWordClassName(
      isVerseHighlighted,
      isVerseMarker,
      isVerseEnd,
      isActive,
      isPlayingAudio,
    );

    const refCallback = (el: HTMLSpanElement | null) => {
      if (el && isFirstInLine && verse && idx === 0) {
        verseRefs.current.set(verse.verseNumber, el as unknown as HTMLDivElement);
      }
    };

    const showTranslationCol = showInlineTranslation && !!inlineTranslationText;
    const showTransliterationCol = showInlineTransliteration && !!inlineTransliterationText;
    const hasInline = showTranslationCol || showTransliterationCol;

    return (
      <div
        key={idx}
        className={`flex flex-col items-center ${opacityClass} ${transitionClass}`}
        style={anyInlineActive ? { minWidth: "2rem" } : undefined}
      >
        <WordTooltip
          translation={hoverTranslationText}
          transliteration={hoverTransliterationText}
          enabled={isHoverTranslationEnabled && !shouldHideBySetting}
          onClick={handleWordClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span
            ref={refCallback}
            className={spanClass}
            style={{ cursor: "pointer" }}
            onClick={handleWordClick}
          >
            {glyph}{' '}
          </span>
        </WordTooltip>

        {hasInline && (
          <div
            className="flex flex-col items-center gap-y-0.5 mt-1 w-full"
            dir="ltr"
            style={LATIN_FONT_STYLE}
          >
            {showTranslationCol && (
              <span
                className="text-black dark:text-white text-center leading-tight block w-full"
                style={{ ...LATIN_FONT_STYLE, fontSize: `${inlineTranslationSize}px` }}
              >
                {inlineTranslationText}
              </span>
            )}
            {showTransliterationCol && (
              <span
                className="text-gray-500 dark:text-gray-400 text-center leading-tight block w-full"
                style={{ ...LATIN_FONT_STYLE, fontSize: `${inlineTransliterationSize}px` }}
              >
                {inlineTransliterationText}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div
        className={fontClass}
        style={{ fontSize: arabicFontSize, lineHeight: 1.8, wordSpacing }}
        dir="rtl"
      >
        {resolvedLines.map((line, lineIdx) => (
          <div
            key={lineIdx}
            className={`flex justify-center items-start flex-wrap ${anyInlineActive ? "gap-x-3 mb-6" : "gap-x-0 mb-0"}`}
            dir="rtl"
          >
            {line.map((word, wordIdx) => renderWordColumn(word, wordIdx, true))}
          </div>
        ))}
      </div>
    </div>
  );
});