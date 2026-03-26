import { lazy, Suspense } from "react";
import { Toaster } from "@/Top/Component/UI/toaster";
import { Toaster as Sonner } from "@/Top/Component/UI/sonner";
import { TooltipProvider } from "@/Top/Component/UI/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/Middle/Context/App-Context";
import { AudioProvider } from "@/Middle/Context/Audio-Context";
import { AuthProvider } from "@/Middle/Context/Auth-Context";
import { ErrorBoundary } from "@/Top/Component/Error-Boundary";
import { GridSkeleton } from "@/Top/Component/Skeleton/Content-Skeleton";

import Index from "@/Top/Page/Index";

// Quran
const Quran        = lazy(() => import("@/Top/Page/Quran/Index"));
const SurahIndex   = lazy(() => import("@/Top/Page/Quran/Surah/Index"));
const AyahIndex    = lazy(() => import("@/Top/Page/Quran/Surah/Ayah/Index"));
const KalimaIndex  = lazy(() => import("@/Top/Page/Quran/Surah/Ayah/Kalima/Index"));
const QuranGoals   = lazy(() => import("@/Top/Component/Quran/Goals"));
const JuzPage      = lazy(() => import("@/Top/Page/Juz-Page"));
const QuranPage    = lazy(() => import("@/Top/Page/Quran/Index"));

// Hadith
const Hadiths          = lazy(() => import("@/Top/Page/Hadith/List"));
const HadithCollection = lazy(() => import("@/Top/Page/Hadith/Collection"));
const HadithChapter    = lazy(() => import("@/Top/Page/Hadith/Chapter"));

// Aid
const Aid              = lazy(() => import("@/Top/Page/Aid/Main"));
const Dua              = lazy(() => import("@/Top/Page/Aid/Dua/List"));
const DuaCategory      = lazy(() => import("@/Top/Page/Aid/Dua/Category"));
const AlphabetIndex    = lazy(() => import("@/Top/Page/Aid/Alphabet/Index"));
const AlphabetLetter   = lazy(() => import("@/Top/Page/Aid/Alphabet/Letter"));
const TajweedCategory  = lazy(() => import("@/Top/Page/Aid/Alphabet/Tajweed/Category"));
const TajweedRule      = lazy(() => import("@/Top/Page/Aid/Alphabet/Tajweed/Rule"));
const PrayerTimes      = lazy(() => import("@/Top/Page/Prayer-Times"));
const QiblaPage        = lazy(() => import("@/Top/Page/Qibla"));
const HijriCalendar    = lazy(() => import("@/Top/Page/Hijri-Calendar"));
const ZakatCalculator  = lazy(() => import("@/Top/Page/Zakat-Calculator"));

// General
const Feedback       = lazy(() => import("@/Top/Page/Feedback"));
const SignIn         = lazy(() => import("@/Top/Page/Sign-In"));
const SignUp         = lazy(() => import("@/Top/Page/Sign-Up"));
const ForgotPassword = lazy(() => import("@/Top/Page/Forgot-Password"));
const Privacy        = lazy(() => import("@/Top/Page/Privacy"));
const Terms          = lazy(() => import("@/Top/Page/Terms"));
const Sitemap        = lazy(() => import("@/Top/Page/Sitemap"));
const SearchResults  = lazy(() => import("@/Top/Page/Search-Results"));
const Profile        = lazy(() => import("@/Top/Page/Profile"));
const NotFound       = lazy(() => import("@/Top/Page/Not-Found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function LazyFallback() {
  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24">
      <div className="container max-w-4xl">
        <GridSkeleton count={6} />
      </div>
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <AudioProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Suspense fallback={<LazyFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />

                    {/* ── Quran ── */}
                    <Route path="/Quran"                                                      element={<Quran />} />
                    <Route path="/Quran/Surah/:id"                                            element={<SurahIndex />} />
                    <Route path="/Quran/Surah/:id/Ayah/:verseId"                              element={<AyahIndex />} />
                    <Route path="/Quran/Surah/:id/Ayah/:verseId/Kalima/:kalimaId"             element={<KalimaIndex />} />
                    <Route path="/Quran/Juz/:id"                                              element={<JuzPage />} />
                    <Route path="/Quran/Page/:id"                                             element={<QuranPage />} />
                    <Route path="/Quran/Hizb/:id"                                             element={<JuzPage />} />
                    <Route path="/Quran/Goals"                                                element={<QuranGoals />} />

                    {/* ── Hadith ── */}
                    <Route path="/Hadiths"                                                    element={<Hadiths />} />
                    <Route path="/Hadiths/:collectionId"                                      element={<HadithCollection />} />
                    <Route path="/Hadiths/:collectionId/:chapterId"                           element={<HadithChapter />} />

                    {/* ── Aid ── */}
                    <Route path="/Aid"                                                        element={<Aid />} />
                    <Route path="/Aid/Dua"                                                    element={<Dua />} />
                    <Route path="/Aid/Dua/:categoryId"                                        element={<DuaCategory />} />
                    <Route path="/Aid/Alphabet"                                               element={<AlphabetIndex />} />
                    <Route path="/Aid/Alphabet/:letterId"                                     element={<AlphabetLetter />} />
                    <Route path="/Aid/Alphabet/Tajweed/:categoryId"                           element={<TajweedCategory />} />
                    <Route path="/Aid/Alphabet/Tajweed/:categoryId/:subcategoryId"            element={<TajweedRule />} />
                    <Route path="/Aid/Prayers"                                                element={<PrayerTimes />} />
                    <Route path="/Aid/Qibla"                                                  element={<QiblaPage />} />
                    <Route path="/Aid/Hijri-Calendar"                                         element={<HijriCalendar />} />
                    <Route path="/Aid/Zakat-Calculator"                                       element={<ZakatCalculator />} />

                    {/* ── General ── */}
                    <Route path="/Feedback"                                                   element={<Feedback />} />
                    <Route path="/Sign-In"                                                    element={<SignIn />} />
                    <Route path="/Sign-Up"                                                    element={<SignUp />} />
                    <Route path="/Forgot-Password"                                            element={<ForgotPassword />} />
                    <Route path="/Privacy"                                                    element={<Privacy />} />
                    <Route path="/Terms"                                                      element={<Terms />} />
                    <Route path="/Sitemap"                                                    element={<Sitemap />} />
                    <Route path="/Search"                                                     element={<SearchResults />} />
                    <Route path="/Profile"                                                    element={<Profile />} />
                    <Route path="*"                                                           element={<NotFound />} />
                  </Routes>
                </Suspense>
              </TooltipProvider>
            </AudioProvider>
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;