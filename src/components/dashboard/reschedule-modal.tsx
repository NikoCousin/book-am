"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Calendar, Clock, User, Scissors } from "lucide-react";
import { DatePicker } from "@/components/booking/date-picker";
import { TimeSlots } from "@/components/booking/time-slots";
import { getNext14Days, generateTimeSlots } from "@/lib/booking";

interface Booking {
  id: string;
  date: string;
  startTime: string;
  customer: {
    name: string | null;
    phone: string;
  };
  service: {
    name: string;
    duration: number;
  };
}

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface RescheduleModalProps {
  booking: Booking;
  businessId: string;
  schedule: Schedule[];
  onClose: () => void;
  onReschedule: (bookingId: string, date: string, time: string) => Promise<void>;
}

export function RescheduleModal({
  booking,
  businessId,
  schedule,
  onClose,
  onReschedule,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        // Exclude current booking's slot if rescheduling to same day
        const slots = (data.bookedSlots || []).filter(
          (slot: string) =>
            !(format(new Date(booking.date), "yyyy-MM-dd") === dateStr &&
              slot === booking.startTime)
        );
        setBookedSlots(slots);
      } catch (error) {
        console.error("Failed to fetch booked slots:", error);
        setBookedSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSlots();
    setSelectedTime(null);
  }, [selectedDate, businessId, booking.date, booking.startTime]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    await onReschedule(booking.id, dateStr, selectedTime);
    setSubmitting(false);
  };

  const canSubmit = selectedDate && selectedTime && !submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Reschedule Booking
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Current Booking Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4 text-gray-500" />
              <span>{booking.customer.name || "Guest"}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{booking.customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Scissors className="w-4 h-4 text-gray-500" />
              <span>{booking.service.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{booking.service.duration} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Current: {format(new Date(booking.date), "MMM d, yyyy")} at {booking.startTime}</span>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-700" />
              <h3 className="font-medium text-gray-900">New Date</h3>
            </div>
            <DatePicker
              dates={availableDates}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-700" />
                <h3 className="font-medium text-gray-900">New Time</h3>
              </div>
              {loading ? (
                <div className="text-center py-4 text-gray-500 text-sm">
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors
              ${
                canSubmit
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {submitting ? "Updating..." : "Send New Time to Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
