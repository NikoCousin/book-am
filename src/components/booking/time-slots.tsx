"use client";

import { formatTime } from "@/lib/booking";

interface TimeSlotsProps {
  slots: string[];
  bookedSlots: string[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export function TimeSlots({
  slots,
  bookedSlots,
  selectedTime,
  onSelect,
}: TimeSlotsProps) {
  const availableSlots = slots.filter((slot) => !bookedSlots.includes(slot));

  if (availableSlots.length === 0) {
    return (
      <p className="text-gray-500 text-center py-6">
        No available time slots for this day.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isBooked = bookedSlots.includes(slot);
        const isSelected = selectedTime === slot;

        return (
          <button
            key={slot}
            onClick={() => !isBooked && onSelect(slot)}
            disabled={isBooked}
            className={`
              py-3 px-2 rounded-lg border text-sm font-medium transition-all
              ${
                isBooked
                  ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed line-through"
                  : isSelected
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-900 border-gray-200 hover:border-gray-400"
              }
            `}
          >
            {formatTime(slot)}
          </button>
        );
      })}
    </div>
  );
}
