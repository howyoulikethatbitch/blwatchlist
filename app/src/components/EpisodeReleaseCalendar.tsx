import { useEffect, useState } from 'react';
import { CalendarDays, Check, RotateCcw, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

interface EpisodeReleaseCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  releaseDates: string[];
  onSave: (releaseDates: string[]) => void;
}

function dateToKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function keyToDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) &&
    date.getMonth() === Number(match[2]) - 1 &&
    date.getDate() === Number(match[3])
    ? date
    : null;
}

export default function EpisodeReleaseCalendar({
  isOpen,
  onClose,
  releaseDates,
  onSave,
}: EpisodeReleaseCalendarProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedDates(
      releaseDates
        .map(keyToDate)
        .filter((date): date is Date => date !== null),
    );
  }, [isOpen, releaseDates]);

  const handleSave = () => {
    onSave([...new Set(selectedDates.map(dateToKey))].sort());
    onClose();
  };

  const handleClear = () => {
    setSelectedDates([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#141414] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CalendarDays className="w-5 h-5 text-[#E50914]" />
            Episode Release Dates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-[#B3B3B3]">
            Select every date an episode releases. You can reopen this calendar
            anytime when the airing schedule changes.
          </p>

          <div className="flex justify-center rounded-xl bg-white/[0.04] p-2 overflow-x-auto">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={(dates) => setSelectedDates(dates || [])}
              numberOfMonths={1}
              className="bg-transparent [--cell-size:2.5rem]"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#B3B3B3]">
            <span>{selectedDates.length} release date{selectedDates.length === 1 ? '' : 's'} selected</span>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-[#888] hover:text-white tap-active"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/10 text-[#B3B3B3] hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4 mr-1.5" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 bg-[#E50914] hover:bg-[#E50914]/90 text-white font-semibold"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Save Dates
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}