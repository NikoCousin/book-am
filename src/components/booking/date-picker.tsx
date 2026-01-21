"use client";

import { format, isToday, isTomorrow } from "date-fns";
import { isSameDateAs } from "@/lib/booking";

interface DatePickerProps {
  dates: Date[];
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE");
}

export function DatePicker({ dates, selectedDate, onSelect }: DatePickerProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {dates.map((date) => {
        const isSelected = selectedDate && isSameDateAs(date, selectedDate);
        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelect(date)}
            className={`
              flex flex-col items-center p-3 rounded-lg border transition-all
              ${
                isSelected
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-900 border-gray-200 hover:border-gray-400"
              }
            `}
          >
            <span className="text-xs font-medium">
              {getDateLabel(date)}
            </span>
            <span className="text-lg font-bold mt-1">
              {format(date, "d")}
            </span>
            <span className="text-xs mt-0.5 opacity-70">
              {format(date, "MMM")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
