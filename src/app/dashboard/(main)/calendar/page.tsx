"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays, isToday, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import useSWR from "swr";
import {
  generateTimeSlots,
  calculateBookingTop,
  calculateBookingHeight,
  getWorkingHours,
  getBusinessHours,
  timeToMinutes,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Staff {
  id: string;
  name: string;
  schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

interface Booking {
  id: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: string;
  customer: {
    name: string | null;
    phone: string;
  };
  service: {
    name: string;
    duration: number;
  };
  staff: {
    id: string;
    name: string;
  };
}

function formatTime(time: string): string {
  const [hour, min] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    confirmed: "bg-blue-500",
    pending: "bg-yellow-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
    "no-show": "bg-orange-500",
    rescheduled: "bg-purple-500",
  };
  return colors[status] || "bg-gray-500";
}

function BookingBlock({ booking, dayStartHour }: { booking: Booking; dayStartHour: number }) {
  const top = calculateBookingTop(booking.startTime, dayStartHour);
  const height = calculateBookingHeight(booking.service.duration);
  const statusColor = getStatusColor(booking.status);

  // Don't render if booking is outside the visible range
  if (top < 0 || top > 10000) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded px-2 py-1 text-white text-xs shadow-sm z-10 cursor-pointer hover:shadow-md transition-shadow overflow-hidden",
        statusColor
      )}
      style={{
        top: `${top}px`,
        height: `${Math.max(height, 24)}px`,
        minHeight: "24px",
      }}
      title={`${booking.service.name} - ${booking.customer.name || "Guest"} - ${formatTime(booking.startTime)}`}
    >
      <div className="font-semibold truncate leading-tight">{booking.service.name}</div>
      <div className="truncate text-white/90 leading-tight text-[10px]">
        {booking.customer.name || booking.customer.phone}
      </div>
      {height >= 40 && (
        <div className="text-white/80 text-[10px] mt-0.5">{formatTime(booking.startTime)}</div>
      )}
    </div>
  );
}

function TimeColumn({ timeSlots }: { timeSlots: string[] }) {
  return (
    <div className="sticky left-0 z-20 bg-white border-r border-gray-200 min-w-[80px]">
      {timeSlots.map((time) => (
        <div
          key={time}
          className="h-[60px] border-b border-gray-100 flex items-start justify-end pr-3 pt-1"
        >
          <span className="text-xs text-gray-500 font-medium">{formatTime(time)}</span>
        </div>
      ))}
    </div>
  );
}

function StaffColumn({
  staff,
  bookings,
  timeSlots,
  dayOfWeek,
  dayStartHour,
  workingHours,
}: {
  staff: Staff;
  bookings: Booking[];
  timeSlots: string[];
  dayOfWeek: number;
  dayStartHour: number;
  workingHours: { startTime: string; endTime: string } | null;
}) {
  const staffBookings = bookings.filter((b) => b.staff.id === staff.id);
  const dayStartMinutes = dayStartHour * 60;

  return (
    <div className="relative border-r border-gray-200 min-w-[200px]">
      {/* Staff Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 font-semibold text-gray-900">
        {staff.name}
      </div>

      {/* Time Slots Grid */}
      <div className="relative">
        {timeSlots.map((time) => {
          const timeMinutes = timeToMinutes(time);
          let isWorkingHour = false;

          if (workingHours) {
            const workingStart = timeToMinutes(workingHours.startTime);
            const workingEnd = timeToMinutes(workingHours.endTime);
            // Check if this time slot (30 min block) overlaps with working hours
            isWorkingHour = timeMinutes >= workingStart && timeMinutes < workingEnd;
          }

          return (
            <div
              key={time}
              className={cn(
                "h-[60px] border-b border-gray-100",
                !isWorkingHour && "bg-gray-50 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]"
              )}
            />
          );
        })}

        {/* Bookings */}
        {staffBookings.map((booking) => (
          <BookingBlock key={booking.id} booking={booking} dayStartHour={dayStartHour} />
        ))}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayOfWeek = selectedDate.getDay();

  // Fetch staff
  const { data: staffData, error: staffError } = useSWR("/api/dashboard/staff", fetcher);
  const staff: Staff[] = staffData?.staff || [];

  // Fetch bookings
  const { data: bookingsData, error: bookingsError } = useSWR(
    `/api/dashboard/bookings?date=${dateStr}`,
    fetcher
  );
  const bookings: Booking[] = bookingsData?.bookings || [];

  // Calculate business hours from all staff schedules
  const allSchedules = staff.flatMap((s) => s.schedules);
  const { startHour, endHour } = getBusinessHours(allSchedules);
  const timeSlots = generateTimeSlots(startHour, endHour);

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  if (staffError || bookingsError) {
    return (
      <div className="p-4 lg:p-8">
        <div className="text-center py-12 text-red-600">
          Failed to load calendar data
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-4">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <div className="flex-1 flex items-center justify-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE")}
                </div>
                <div className="text-sm text-gray-500">
                  {format(selectedDate, "MMMM d, yyyy")}
                </div>
              </div>
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        {staff.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center flex-shrink-0">
            <p className="text-gray-500">No staff members found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 min-h-0">
            <div className="h-full overflow-auto">
              <div className="flex min-w-max h-full">
                {/* Time Column */}
                <TimeColumn timeSlots={timeSlots} />

                {/* Staff Columns */}
                {staff.map((staffMember) => {
                  const workingHours = getWorkingHours(staffMember.schedules, dayOfWeek);
                  return (
                    <StaffColumn
                      key={staffMember.id}
                      staff={staffMember}
                      bookings={bookings}
                      timeSlots={timeSlots}
                      dayOfWeek={dayOfWeek}
                      dayStartHour={startHour}
                      workingHours={workingHours}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
