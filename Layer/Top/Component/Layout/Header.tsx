// Layer/Top/Component/Header.tsx (excerpt of relevant parts)
import { memo, useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings, ArrowLeft, Search, Home, X } from "lucide-react";
import { useScrollDirection } from "@/Middle/Hook/Use-Scroll-Direction";
import { useApp } from "@/Middle/Context/App";
import { useAuth } from "@/Middle/Context/Auth";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import { cn } from "@/Middle/Library/utils";
import { Link } from "react-router-dom";
import { Button } from "@/Top/Component/UI/Button";
import { Input } from "@/Top/Component/UI/Input";
import { mobileSettingsStore } from "@/Top/Component/Settings/mobileSettingsStore";

export const Header = memo(function Header() {
  const { scrollDirection } = useScrollDirection();
  const { 
    isSettingsSidebarOpen, 
    setSettingsSidebarOpen, 
    isSearchSidebarOpen,
    setSearchSidebarOpen 
  } = useApp();
  const { user } = useAuth();
  const { t, isRtl } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const shouldHide = scrollDirection === "down";
  const isHome = location.pathname === "/";

  const isMobileSettingsOpen = isMobile && isSettingsSidebarOpen;

  const [mobileTitle, setMobileTitle] = useState("Settings");
  const [showMobileBack, setShowMobileBack] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to store changes for title, back, and search mode
  useEffect(() => {
    if (!isMobileSettingsOpen) return;
    const { title, showBack, isSearchMode: searchMode } = mobileSettingsStore.getState();
    setMobileTitle(title);
    setShowMobileBack(showBack);
    setIsSearchMode(searchMode);
    const unsubscribe = mobileSettingsStore.subscribe(() => {
      const { title, showBack, isSearchMode: searchMode } = mobileSettingsStore.getState();
      setMobileTitle(title);
      setShowMobileBack(showBack);
      setIsSearchMode(searchMode);
    });
    return unsubscribe;
  }, [isMobileSettingsOpen]);

  useEffect(() => {
    if (isSearchMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchMode]);

  const handleMobileBack = () => mobileSettingsStore.goBack();
  const handleMobileClose = () => mobileSettingsStore.close();

  const handleOpenSearch = () => {
    mobileSettingsStore.enterSearchMode(() => {
      setSearchQuery("");
    });
  };

  const handleExitSearch = () => {
    mobileSettingsStore.exitSearchMode();
    setSearchQuery("");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // The actual filtering happens in the Mobile component via the store's search query state.
    // We'll need to store the query in the store or pass it via a context/prop.
    // For simplicity, we can store the query in the store as well.
    mobileSettingsStore.setSearchQuery?.(value); // we'll add this method later
  };

  const showRegularBack = !isHome || isSettingsSidebarOpen || isSearchSidebarOpen;
  const showBackButton = isMobileSettingsOpen ? showMobileBack : showRegularBack;

  const handleBack = useCallback(() => {
    if (isMobileSettingsOpen) {
      handleMobileBack();
    } else if (isSettingsSidebarOpen) {
      setSettingsSidebarOpen(false);
    } else if (isSearchSidebarOpen) {
      setSearchSidebarOpen(false);
    } else if (!isHome) {
      navigate(-1);
    }
  }, [
    isMobileSettingsOpen,
    isSettingsSidebarOpen,
    isSearchSidebarOpen,
    isHome,
    navigate,
    setSettingsSidebarOpen,
    setSearchSidebarOpen,
  ]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-between items-center pt-2 sm:pt-4 px-2 sm:px-4 isolate",
        shouldHide && !isSettingsSidebarOpen && !isSearchSidebarOpen && !isMobileSettingsOpen
          ? "-translate-y-24 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {isMobileSettingsOpen && isSearchMode ? (
        // Search mode UI (full-width input + close button)
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search settings..."
              className="w-full rounded-full pr-10"
            />
            {searchQuery && (
              <Button
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full p-0"
                size="sm"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <Button
            onClick={handleExitSearch}
            className="w-9 h-9 sm:w-10 sm:h-10 p-0"
            variant="ghost"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      ) : (
        <>
          {/* Left section: back button, title, home */}
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                onClick={handleBack}
                className="w-9 h-9 sm:w-10 sm:h-10 p-0 transition-transform hover:scale-105 active:scale-95"
                variant="ghost"
              >
                {isRtl ? <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" /> : <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            )}
            {isMobileSettingsOpen && mobileTitle && (
              <div className="py-1 px-3 rounded-full bg-white dark:bg-black border-2 border-black dark:border-white">
                <h2 className="text-sm font-semibold text-foreground">{mobileTitle}</h2>
              </div>
            )}
            {!isMobileSettingsOpen && !showRegularBack && !isHome && (
              <Button onClick={() => navigate('/')} className="w-9 h-9 sm:w-10 sm:h-10 p-0" variant="ghost">
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>

          {/* Right section: search, settings, sign in */}
          <div className="flex items-center gap-1 sm:gap-2">
            {isMobileSettingsOpen ? (
              <>
                <Button
                  onClick={handleOpenSearch}
                  className="w-9 h-9 sm:w-10 sm:h-10 p-0"
                  variant="ghost"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  onClick={handleMobileClose}
                  className="w-9 h-9 sm:w-10 sm:h-10 p-0"
                  variant="ghost"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setSearchSidebarOpen(true)} className="w-9 h-9 sm:w-10 sm:h-10 p-0" variant="ghost">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button onClick={() => setSettingsSidebarOpen(true)} className="w-9 h-9 sm:w-10 sm:h-10 p-0" variant="ghost">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                {!user && (
                  <Link
                    to="/Sign-In"
                    className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white text-primary hover:scale-102 hover:bg-black dark:hover:bg-white hover:border-white dark:hover:border-black hover:text-white dark:hover:text-black transition-all duration-200"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
});