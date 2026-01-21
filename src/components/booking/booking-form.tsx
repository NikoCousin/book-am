"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { DatePicker } from "./date-picker";
import { TimeSlots } from "./time-slots";
import {
  getNext14Days,
  generateTimeSlots,
  formatDateFull,
  formatTime,
  getAvailableTimeSlotsForStaff,
  getAvailableTimeSlotsAnyStaff,
  getScheduleForDay,
} from "@/lib/booking";
import { Clock, Calendar, ArrowRight, Users, ArrowLeft, User } from "lucide-react";

type BookingStep = "select-staff" | "select-date";

interface BookingFormProps {
  businessId: string;
  businessSlug: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  staffMembers: Array<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    imageUrl: string | null;
    schedules: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>;
  }>;
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export function BookingForm({
  businessId,
  businessSlug,
  service,
  staffMembers,
  schedule,
}: BookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>("select-staff");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Get the selected staff member's data
  const selectedStaff = selectedStaffId
    ? staffMembers.find((s) => s.id === selectedStaffId)
    : null;

  // Calculate closed days based on selected staff or all staff
  const getClosedDays = () => {
    if (selectedStaffId && selectedStaff) {
      // Use selected staff's schedules
      const scheduledDays = selectedStaff.schedules.map((s) => s.dayOfWeek);
      return [0, 1, 2, 3, 4, 5, 6].filter((day) => !scheduledDays.includes(day));
    } else {
      // Use all staff schedules (union)
      const scheduledDays = schedule.map((s) => s.dayOfWeek);
      return [0, 1, 2, 3, 4, 5, 6].filter((day) => !scheduledDays.includes(day));
    }
  };

  const availableDates = getNext14Days(getClosedDays());

  // Get time slots for selected day based on selected staff
  const getTimeSlots = () => {
    if (!selectedDate) return [];

    if (selectedStaffId && selectedStaff) {
      // Get slots for specific staff member
      const daySchedule = getScheduleForDay(selectedStaff.schedules, selectedDate.getDay());
      if (!daySchedule) return [];
      return generateTimeSlots(daySchedule.startTime, daySchedule.endTime, 30);
    } else {
      // Get slots from any staff member (union of all schedules)
      const dayOfWeek = selectedDate.getDay();
      const daySchedules = schedule.filter((s) => s.dayOfWeek === dayOfWeek);
      if (daySchedules.length === 0) return [];

      // Get all time slots from all staff schedules for this day
      const allSlots = new Set<string>();
      daySchedules.forEach((s) => {
        const slots = generateTimeSlots(s.startTime, s.endTime, 30);
        slots.forEach((slot) => allSlots.add(slot));
      });
      return Array.from(allSlots).sort();
    }
  };

  const timeSlots = getTimeSlots();

  // Fetch booked slots when date or staff changes
  useEffect(() => {
    if (!selectedDate || step !== "select-date") return;

    const fetchBookedSlots = async () => {
      setLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const url = selectedStaffId
          ? `/api/bookings?businessId=${businessId}&date=${dateStr}&staffId=${selectedStaffId}`
          : `/api/bookings?businessId=${businessId}&date=${dateStr}`;
        const res = await fetch(url);
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
  }, [selectedDate, selectedStaffId, businessId, step]);

  const handleStaffSelect = (staffId: string | null) => {
    setSelectedStaffId(staffId);
    setStep("select-date");
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const params = new URLSearchParams({
      date: dateStr,
      time: selectedTime,
    });
    if (selectedStaffId) {
      params.append("staffId", selectedStaffId);
    }

    router.push(`/${businessSlug}/book/${service.id}/confirm?${params.toString()}`);
  };

  const canContinue = selectedDate && selectedTime;

  // Staff Selection Step
  if (step === "select-staff") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Select Professional</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Any Professional Option */}
          <button
            onClick={() => handleStaffSelect(null)}
            className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-900 transition-all text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-600" />
            </div>
            <span className="font-semibold text-gray-900">Any Professional</span>
            <span className="text-xs text-gray-500">We'll assign the best fit</span>
          </button>

          {/* Staff Members */}
          {staffMembers.map((staff) => (
            <button
              key={staff.id}
              onClick={() => handleStaffSelect(staff.id)}
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-900 transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {staff.imageUrl ? (
                  <img
                    src={staff.imageUrl}
                    alt={staff.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <span className="font-semibold text-gray-900">{staff.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Date & Time Selection Step
  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => {
          setStep("select-staff");
          setSelectedDate(null);
          setSelectedTime(null);
        }}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Change Professional</span>
      </button>

      {/* Selected Staff Info */}
      {selectedStaff && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
            {selectedStaff.imageUrl ? (
              <img
                src={selectedStaff.imageUrl}
                alt={selectedStaff.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{selectedStaff.name}</p>
            <p className="text-xs text-gray-500">Selected Professional</p>
          </div>
        </div>
      )}

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
          {selectedStaff && (
            <p className="text-sm text-gray-600 mt-1">with {selectedStaff.name}</p>
          )}
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
