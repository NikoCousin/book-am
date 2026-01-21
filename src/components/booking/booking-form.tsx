"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { DatePicker } from "./date-picker";
import { TimeSlots } from "./time-slots";
import { getNext14Days, generateTimeSlots, formatDateFull, formatTime } from "@/lib/booking";
import { Clock, Calendar, ArrowRight } from "lucide-react";

interface BookingFormProps {
  businessId: string;
  businessSlug: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export function BookingForm({ businessId, businessSlug, service, schedule }: BookingFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Get closed days (days without schedule)
  const scheduledDays = schedule.map((s) => s.dayOfWeek);
  const closedDays = [0, 1, 2, 3, 4, 5, 6].filter(
    (day) => !scheduledDays.includes(day)
  );

  const availableDates = getNext14Days(closedDays);

  // Get time slots for selected day
  const getScheduleForDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    return schedule.find((s) => s.dayOfWeek === dayOfWeek);
  };

  const timeSlots = selectedDate
    ? (() => {
        const daySchedule = getScheduleForDay(selectedDate);
        if (!daySchedule) return [];
        return generateTimeSlots(daySchedule.startTime, daySchedule.endTime, 30);
      })()
    : [];

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchBookedSlots = async () => {
      setLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(
          `/api/bookings?businessId=${businessId}&date=${dateStr}`
        );
        const data = await res.json();
        setBookedSlots(data.bookedSlots || []);
      } catch (error) {
        console.error("Failed to fetch booked slots:", error);
        setBookedSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSlots();
    setSelectedTime(null);
  }, [selectedDate, businessId]);

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const params = new URLSearchParams({
      date: dateStr,
      time: selectedTime,
    });

    router.push(`/${businessSlug}/book/${service.id}/confirm?${params.toString()}`);
  };

  const canContinue = selectedDate && selectedTime;

  return (
    <div className="space-y-8">
      {/* Date Selection */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Select Date</h2>
        </div>
        <DatePicker
          dates={availableDates}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      </section>

      {/* Time Selection */}
      {selectedDate && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Select Time</h2>
          </div>
          {loading ? (
            <div className="text-center py-6 text-gray-500">
              Loading available times...
            </div>
          ) : (
            <TimeSlots
              slots={timeSlots}
              bookedSlots={bookedSlots}
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
            />
          )}
        </section>
      )}

      {/* Summary & Continue */}
      {canContinue && (
        <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Your Selection</h3>
          <p className="text-gray-700">
            {formatDateFull(selectedDate)} at {formatTime(selectedTime)}
          </p>
        </section>
      )}

      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className={`
          w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
          ${
            canContinue
              ? "bg-gray-900 text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
