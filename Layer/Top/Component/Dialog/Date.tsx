import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Top/Component/UI/Dialog";
import { Button } from "@/Top/Component/UI/Button";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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

interface IslamicEvent {
  name: string;
  description: string;
  hijriDate?: string;
  gregorianDate?: string;
}

interface DateDialogProps {
  open: boolean;
  onClose: () => void;
  day: CalendarDay | null;
  hijriMonth: number;
  hijriYear: number;
}

export function DateDialog({ open, onClose, day, hijriMonth, hijriYear }: DateDialogProps) {
  const [events, setEvents] = useState<IslamicEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (!open || !day) return;

    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        // Using Aladhan API to get Islamic events for the specific date
        const response = await fetch(
          `https://api.aladhan.com/v1/gToHCalendar/${day.gregorian.month.number}/${day.gregorian.year}`
        );
        const data = await response.json();
        
        if (data.code === 200 && data.data) {
          // Filter events for the specific day
          const dayEvents = data.data.filter((item: any) => 
            item.gregorian.day === day.gregorian.day &&
            item.gregorian.month.number === day.gregorian.month.number &&
            item.gregorian.year === day.gregorian.year
          ).map((item: any) => ({
            name: `${item.hijri.month.en} ${item.hijri.day}`,
            description: `${item.hijri.weekday.en}, ${item.hijri.month.en} ${item.hijri.day}, ${item.hijri.year} AH`,
            hijriDate: `${item.hijri.month.en} ${item.hijri.day}, ${item.hijri.year}`,
            gregorianDate: `${item.gregorian.month.en} ${item.gregorian.day}, ${item.gregorian.year}`,
          }));
          setEvents(dayEvents);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [open, day]);

  if (!day) return null;

  const hasEvents = events.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-[40px] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {day.hijri.month.en} {day.hijri.day}, {day.hijri.year} AH
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Islamic Events */}
          {loadingEvents ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : hasEvents ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-primary">Islamic Events</h3>
              {events.map((event, idx) => (
                <div key={idx} className="p-3 rounded-[40px] bg-muted/30">
                  <p className="font-medium">{event.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-[40px] bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">No Islamic events on this day.</p>
            </div>
          )}

          {/* Gregorian Date */}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Gregorian Date</p>
            <p className="text-sm font-medium">
              {day.gregorian.weekday.en}, {day.gregorian.month.en} {day.gregorian.day}, {day.gregorian.year}
            </p>
          </div>

          {/* Hijri Details */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <p className="text-xs text-muted-foreground">Hijri Month</p>
              <p className="text-sm font-medium">{day.hijri.month.en}</p>
              <p className="text-xs text-muted-foreground font-arabic">{day.hijri.month.ar}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Weekday</p>
              <p className="text-sm font-medium">{day.hijri.weekday.en}</p>
              <p className="text-xs text-muted-foreground font-arabic">{day.hijri.weekday.ar}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Button onClick={onClose} fullWidth>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}