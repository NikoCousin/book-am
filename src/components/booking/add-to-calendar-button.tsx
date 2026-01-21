"use client";

import { CalendarPlus } from "lucide-react";

export function AddToCalendarButton() {
  return (
    <button
      className="w-full py-3 px-4 rounded-lg font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
      onClick={() => {
        alert("Add to Calendar feature coming soon!");
      }}
    >
      <CalendarPlus className="w-5 h-5" />
      Add to Calendar
    </button>
  );
}
