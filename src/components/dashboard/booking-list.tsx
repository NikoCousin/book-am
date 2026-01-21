"use client";

import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Scissors,
  Check,
  X,
  UserX,
  CalendarClock,
  CheckCircle,
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { RescheduleModal } from "./reschedule-modal";

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
}

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface BookingListProps {
  businessId: string;
  schedule: Schedule[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatTime(time: string): string {
  const [hour, min] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string; icon?: React.ReactNode }> = {
    confirmed: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "Confirmed",
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Completed",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      label: "Cancelled",
    },
    "no-show": {
      bg: "bg-orange-100",
      text: "text-orange-800",
      label: "No Show",
    },
    rescheduled: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      label: "Rescheduled",
    },
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Pending",
    },
  };

  const { bg, text, label, icon } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${bg} ${text}`}>
      {icon}
      {label}
    </span>
  );
}

function BookingCard({
  booking,
  onStatusChange,
  onReschedule,
}: {
  booking: Booking;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onReschedule: (booking: Booking) => void;
}) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    await onStatusChange(booking.id, newStatus);
    setUpdating(false);
  };

  const showActions = booking.status === "confirmed";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Time & Details */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-gray-900">
              {formatTime(booking.startTime)}
            </span>
            <StatusBadge status={booking.status} />
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-gray-500" />
              <span>{booking.customerName || "Guest"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-gray-500" />
              <a href={`tel:${booking.customerPhone}`} className="hover:underline">
                {booking.customerPhone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Scissors className="w-4 h-4 text-gray-500" />
              <span>{booking.service.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{booking.service.duration} min</span>
            </div>
          </div>

          {booking.notes && (
            <p className="mt-2 text-sm text-gray-500 italic">
              Note: {booking.notes}
            </p>
          )}
        </div>

        {/* Right: Actions */}
        {showActions && (
          <div className="flex flex-wrap sm:flex-col gap-2">
            <button
              onClick={() => handleStatusChange("completed")}
              disabled={updating}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
            <button
              onClick={() => handleStatusChange("no-show")}
              disabled={updating}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>No Show</span>
            </button>
            <button
              onClick={() => onReschedule(booking)}
              disabled={updating}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 border border-blue-300 bg-white hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Reschedule</span>
            </button>
            <button
              onClick={() => handleStatusChange("cancelled")}
              disabled={updating}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-700 border border-red-300 bg-white hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function BookingList({ businessId, schedule }: BookingListProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data, error, isLoading } = useSWR(
    `/api/dashboard/bookings?date=${dateStr}`,
    fetcher
  );

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/dashboard/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        mutate(`/api/dashboard/bookings?date=${dateStr}`);
      }
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  const handleReschedule = async (bookingId: string, newDate: string, newTime: string) => {
    try {
      const res = await fetch(`/api/dashboard/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reschedule: true,
          date: newDate,
          time: newTime,
        }),
      });

      if (res.ok) {
        console.log(`SMS would be sent to ${rescheduleBooking?.customerPhone} with new time: ${newDate} at ${newTime}`);
        mutate(`/api/dashboard/bookings?date=${dateStr}`);
        // Also refresh the new date if different
        if (newDate !== dateStr) {
          mutate(`/api/dashboard/bookings?date=${newDate}`);
        }
        setRescheduleBooking(null);
      }
    } catch (error) {
      console.error("Failed to reschedule booking:", error);
    }
  };

  const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;
  const bookings: Booking[] = data?.bookings || [];

  return (
    <div>
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
          <div className="ml-2">
            <h2 className="text-lg font-bold text-gray-900">
              {isToday ? "Today" : format(selectedDate, "EEEE")}
            </h2>
            <p className="text-sm text-gray-600">
              {format(selectedDate, "MMMM d, yyyy")}
            </p>
          </div>
        </div>

        {!isToday && (
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Today
          </button>
        )}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          Loading bookings...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          Failed to load bookings
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No appointments for this day</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onStatusChange={handleStatusChange}
              onReschedule={setRescheduleBooking}
            />
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          businessId={businessId}
          schedule={schedule}
          onClose={() => setRescheduleBooking(null)}
          onReschedule={handleReschedule}
        />
      )}
    </div>
  );
}
