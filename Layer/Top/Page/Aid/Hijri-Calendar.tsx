import { useState, useEffect } from "react";
import { Layout } from "@/Top/Component/Layout/Index";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/Top/Component/UI/Button";
import { Container } from "@/Top/Component/UI/Container";
import { DateDialog } from "@/Top/Component/Dialog/Date";

interface HijriDate {
  day: string;
  weekday: { en: string; ar: string };
  month: { number: number; en: string; ar: string };
  year: string;
  designation: { abbreviated: string };
}

interface CalendarDay {
  hijri: HijriDate;
  gregorian: {
    date: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
  };
}

const HijriCalendarPage = () => {
  const today = new Date();

  const [hijriMonth, setHijriMonth] = useState<number | null>(null);
  const [hijriYear, setHijriYear] = useState<number | null>(null);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const todayStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Step 1: On mount, get today's Hijri date
  useEffect(() => {
    fetch(`https://api.aladhan.com/v1/gToH/${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200 && data.data) {
          setHijriMonth(data.data.hijri.month.number);
          setHijriYear(parseInt(data.data.hijri.year));
        }
      })
      .catch(console.error);
  }, []);

  // Step 2: Fetch the full Hijri month calendar
  useEffect(() => {
    if (hijriMonth === null || hijriYear === null) return;

    setLoading(true);
    setError(null);

    fetch(`https://api.aladhan.com/v1/hToGCalendar/${hijriMonth}/${hijriYear}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.code === 200 && data.data) {
          setDays(data.data);
          // Set today's date as active by default
          const todayDateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
          setActiveDate(todayDateStr);
        } else {
          setError("Failed to load calendar data");
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError("Unable to load calendar. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [hijriMonth, hijriYear]);

  const goNext = () => {
    if (hijriMonth === null || hijriYear === null) return;
    if (hijriMonth === 12) {
      setHijriMonth(1);
      setHijriYear(hijriYear + 1);
    } else {
      setHijriMonth(hijriMonth + 1);
    }
  };

  const goPrev = () => {
    if (hijriMonth === null || hijriYear === null) return;
    if (hijriMonth === 1) {
      setHijriMonth(12);
      setHijriYear(hijriYear - 1);
    } else {
      setHijriMonth(hijriMonth - 1);
    }
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
    setModalOpen(true);
  };

  const getOffset = () => {
    if (days.length === 0) return 0;
    const firstDayName = days[0].gregorian.weekday.en;
    return weekDays.indexOf(firstDayName);
  };

  const hijriMonthName = days.length > 0
    ? `${days[0].hijri.month.en} ${days[0].hijri.year} AH`
    : "";

  const gregorianRange = days.length > 0
    ? (() => {
        const first = days[0].gregorian;
        const last = days[days.length - 1].gregorian;
        return `${first.month.en} ${first.day} – ${last.month.en} ${last.day}, ${last.year}`;
      })()
    : "";

  const isToday = (day: CalendarDay): boolean => {
    return day.gregorian.date === todayStr;
  };

  const isActive = (day: CalendarDay): boolean => {
    const dateStr = `${day.gregorian.year}-${day.gregorian.month.number}-${parseInt(day.gregorian.day)}`;
    return activeDate === dateStr;
  };

  return (
    <Layout>
      <section className="py-6">
        <div className="container max-w-2xl mx-auto">
          {/* Header */}
          <Container className="!py-3 !px-4 mb-4">
            <div className="flex items-center justify-between">
              <Button size="sm" className="w-9 h-9 p-0 rounded-full" onClick={goPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <p className="text-lg font-semibold">{hijriMonthName}</p>
                <p className="text-xs text-muted-foreground">{gregorianRange}</p>
              </div>
              <Button size="sm" className="w-9 h-9 p-0 rounded-full" onClick={goNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Container>

          {loading ? (
            <Container className="p-12 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </Container>
          ) : error ? (
            <Container className="p-8 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </Container>
          ) : (
            <div>
              {/* Weekday labels */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {weekDays.map((d) => (
                  <Container key={d} className="!py-1 !px-0 text-center">
                    <span className="text-xs text-muted-foreground font-medium">{d}</span>
                  </Container>
                ))}
              </div>

              {/* Calendar grid */}
<div className="grid grid-cols-7 gap-1">
  {Array.from({ length: getOffset() }).map((_, i) => (
    <div key={`empty-${i}`} />
  ))}

  {days.map((day) => {
    const todayFlag = isToday(day);
    const activeFlag = isActive(day);

    return (
      <button
        key={day.gregorian.date}
        onClick={() => handleDayClick(day)}
        className={`
          group relative rounded-[40px] transition-all duration-200 py-2 px-1 text-center
          focus:outline-none focus:ring-2 focus:ring-primary
          ${
            activeFlag
              ? "bg-black dark:bg-white border-2 border-white dark:border-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white hover:border-black dark:hover:border-white"
              : "bg-white dark:bg-black border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-white dark:hover:border-black"
          }
        `}
      >
        {/* Hijri day */}
        <p className={`
          text-sm font-semibold leading-tight
          ${activeFlag 
            ? "text-white dark:text-black group-hover:text-black dark:group-hover:text-white" 
            : "text-black dark:text-white group-hover:text-white dark:group-hover:text-black"
          }
        `}>
          {day.hijri.day}
        </p>
        {/* Gregorian day */}
        <p className={`
          text-xs leading-tight mt-0.5
          ${activeFlag 
            ? "text-white/70 dark:text-black/70 group-hover:text-black/70 dark:group-hover:text-white/70" 
            : "text-muted-foreground group-hover:text-white/70 dark:group-hover:text-black/70"
          }
        `}>
          {day.gregorian.day}
        </p>
      </button>
    );
  })}
</div>
            </div>
          )}
        </div>
      </section>

      {/* Date Dialog */}
      <DateDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        day={selectedDay}
        hijriMonth={hijriMonth || 1}
        hijriYear={hijriYear || 1446}
      />
    </Layout>
  );
};

export default HijriCalendarPage;