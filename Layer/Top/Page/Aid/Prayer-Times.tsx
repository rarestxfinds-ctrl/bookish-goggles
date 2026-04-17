import { useState, useEffect } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { Loader2, MapPin } from "lucide-react";
import { Container } from "@/Top/Component/UI/Container";
import { Button } from "@/Top/Component/UI/Button";
import { usePrayerTimes } from "@/Middle/Hook/usePrayerTimes";
import { Header } from "@/Top/Component/Aid/Prayer/Header";
import { NextPrayer } from "@/Top/Component/Aid/Prayer/NextPrayer";
import { PrayerCard } from "@/Top/Component/Aid/Prayer/PrayerCard";
import { AdditionalTimes } from "@/Top/Component/Aid/Prayer/AdditionalTimes";
import { getNextPrayer, getElapsedProgress } from "@/Top/Component/Aid/Prayer/Utility";
import { MAIN_PRAYERS } from "@/Top/Component/Aid/Prayer/Constant";

export default function PrayerPage() {
  const {
    location,
    timings,
    hijri,
    loading,
    error,
    settings,
    requestLocation,
    methodLabel,
    isUsingSavedLocation,
  } = usePrayerTimes();

  const [, setTick] = useState(0);

  // Tick every minute to update progress
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const nextPrayer = timings ? getNextPrayer(timings) : null;
  const progress = timings && nextPrayer ? getElapsedProgress(timings, nextPrayer) : 0;

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto py-6">
          <Container className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Fetching prayer times...</p>
          </Container>
        </div>
      </Layout>
    );
  }

  // Error state - location not detected
  if (error) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto py-6">
          <Container className="p-8 text-center space-y-4">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">
              Please select a location in Settings to get prayer times.
            </p>
            <Button onClick={requestLocation} variant="secondary">
              Try Auto Location Again
            </Button>
          </Container>
        </div>
      </Layout>
    );
  }

  if (!timings) return null;

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto py-6">
        <Header
          location={location}
          hijri={hijri}
          onRefresh={requestLocation}
        />

        {/* Prayer Times Content */}
        <div className="space-y-3">
          {/* All prayers */}
          {MAIN_PRAYERS.map((prayer) => (
            <PrayerCard
              key={prayer}
              prayer={prayer}
              timings={timings}
              settings={settings}
              isNext={prayer === nextPrayer}
            />
          ))}

          {/* Imsak & Midnight */}
          <AdditionalTimes timings={timings} settings={settings} />

          {/* Footer: method and manual location indicator */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            {methodLabel}
            {isUsingSavedLocation && " • Manual Location"}
          </p>
        </div>
      </div>
    </Layout>
  );
}