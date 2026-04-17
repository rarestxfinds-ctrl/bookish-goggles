import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { cn } from "@/Middle/Library/utils";
import { SearchInput } from ".././Input";
import { SearchResults } from ".././Results";
import type { SearchCategory, SearchResult } from "../Types";

export function Desktop({
  open,
  onClose,
  query,
  setQuery,
  category,
  setCategory,
  results,
  selectedIndex,
  onSearch,
  onResultClick,
  onSeeAll,
  inputRef,
}: DesktopProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isCenteringAfterClear, setIsCenteringAfterClear] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const fixedTopRef = useRef<number | null>(null);

  // Show results immediately when typing
  useEffect(() => {
    if (query.length > 0) {
      setShowResults(true);
      setIsClearing(false);
      setIsCenteringAfterClear(false);
      fixedTopRef.current = null;
    } else if (!isClearing && showResults) {
      // Start clearing: first phase – shrink height (keep top fixed)
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        fixedTopRef.current = rect.top;
      }
      setIsClearing(true);
      // Force height to base 64px
      setContentHeight(64);
    }
  }, [query, showResults]);

  // Listen for transition end on the container – first phase done
  useEffect(() => {
    if (!isClearing || !contentRef.current) return;
    
    const element = contentRef.current;
    let timeoutId: NodeJS.Timeout;
    
    const handleTransitionEnd = () => {
      if (query.length === 0) {
        setIsClearing(false);
        setIsCenteringAfterClear(true);
        setShowResults(false);
        if (contentRef.current) {
          const newHeight = contentRef.current.scrollHeight;
          setContentHeight(Math.max(newHeight, 64));
        }
      }
    };
    
    element.addEventListener('transitionend', handleTransitionEnd, { once: true });
    timeoutId = setTimeout(() => {
      if (query.length === 0) {
        setIsClearing(false);
        setIsCenteringAfterClear(true);
        setShowResults(false);
      }
    }, 350);
    
    return () => {
      element.removeEventListener('transitionend', handleTransitionEnd);
      clearTimeout(timeoutId);
    };
  }, [isClearing, query]);

  // Second phase: after results are unmounted, animate to center
  useEffect(() => {
    if (!isCenteringAfterClear) return;
    const timer = requestAnimationFrame(() => {
      setIsCenteringAfterClear(false);
      fixedTopRef.current = null;
    });
    return () => cancelAnimationFrame(timer);
  }, [isCenteringAfterClear]);

  // Measure height for non-clearing states
  useLayoutEffect(() => {
    if (isClearing || isCenteringAfterClear) return;
    if (!contentRef.current) return;
    if (query.length === 0 && !showResults) {
      setContentHeight(64);
      return;
    }
    const height = contentRef.current.scrollHeight;
    setContentHeight(Math.max(height, 64));
  }, [query, results, isDropdownOpen, showResults, isClearing, isCenteringAfterClear]);

  // Reset when modal closes
  useLayoutEffect(() => {
    if (!open) {
      setContentHeight(0);
      setShowResults(false);
      setIsClearing(false);
      setIsCenteringAfterClear(false);
      fixedTopRef.current = null;
    }
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = () => onClose();
  const handleModalClick = (e: React.MouseEvent) => e.stopPropagation();
  const shouldFlattenBottomRight = isDropdownOpen && query.length === 0;

  let topOffset: string;
  if (isClearing && fixedTopRef.current !== null) {
    topOffset = `${fixedTopRef.current}px`;
  } else {
    const height = contentHeight > 0 ? contentHeight : 64;
    topOffset = `calc(50% - ${height / 2}px)`;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      <div
        className="fixed left-[50%] z-50 w-[calc(100%-2rem)] max-w-lg sm:max-w-[520px] transition-all duration-300 ease-out"
        style={{
          top: topOffset,
          transform: 'translateX(-50%)',
          transition: isClearing ? 'none' : 'top 0.3s ease-out, transform 0.3s ease-out',
        }}
        role="dialog"
        aria-label="Search"
        onClick={handleModalClick}
      >
        <div
          ref={contentRef}
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            "bg-white dark:bg-black border-2 border-black dark:border-white shadow-2xl",
            query.length > 0 ? "rounded-2xl" : "rounded-full",
            shouldFlattenBottomRight && "rounded-br-none"
          )}
          style={{
            height: contentHeight > 0 ? contentHeight : 'auto',
            transition: 'height 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1), border-radius 0.2s ease-out',
          }}
        >
          <SearchInput
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
            onSearch={onSearch}
            inputRef={inputRef}
            onDropdownOpenChange={setIsDropdownOpen}
          />
          {showResults && (
            <div className="pt-2 transition-all duration-300 ease-out">
              <SearchResults
                query={query}
                category={category}
                results={results}
                selectedIndex={selectedIndex}
                onResultClick={onResultClick}
                onSeeAll={onSeeAll}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}