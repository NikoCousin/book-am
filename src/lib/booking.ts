import { addDays, format, isSameDay, startOfDay } from "date-fns";

export function getNext14Days(closedDays: number[] = [0]): Date[] {
  const dates: Date[] = [];
  const today = startOfDay(new Date());

  for (let i = 0; i < 14; i++) {
    const date = addDays(today, i);
    const dayOfWeek = date.getDay();

    // Skip closed days (default: Sunday = 0)
    if (!closedDays.includes(dayOfWeek)) {
      dates.push(date);
    }
  }

  return dates;
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const timeStr = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;
    slots.push(timeStr);

    currentMin += intervalMinutes;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
}

export function formatDateShort(date: Date): string {
  return format(date, "EEE, MMM d");
}

export function formatDateFull(date: Date): string {
  return format(date, "EEEE, MMMM d, yyyy");
}

export function formatTime(time: string): string {
  const [hour, min] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
}

export function isDateInPast(date: Date): boolean {
  return date < startOfDay(new Date());
}

export function isSameDateAs(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

/**
 * Get the schedule for a specific day of week from a staff member's schedules
 */
export function getScheduleForDay(
  schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
  dayOfWeek: number
): { startTime: string; endTime: string } | null {
  return schedules.find((s) => s.dayOfWeek === dayOfWeek) || null;
}

/**
 * Get available time slots for a specific staff member on a given date
 * @param schedules - Array of staff schedules
 * @param date - The date to check
 * @param bookedSlots - Array of already booked time slots (e.g., ["10:00", "14:30"])
 * @param intervalMinutes - Time slot interval in minutes (default: 30)
 * @returns Array of available time slots in "HH:mm" format
 */
export function getAvailableTimeSlotsForStaff(
  schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
  date: Date,
  bookedSlots: string[],
  intervalMinutes: number = 30
): string[] {
  const dayOfWeek = date.getDay();
  const schedule = getScheduleForDay(schedules, dayOfWeek);

  if (!schedule) {
    return []; // No schedule for this day
  }

  const allSlots = generateTimeSlots(
    schedule.startTime,
    schedule.endTime,
    intervalMinutes
  );

  // Filter out booked slots
  return allSlots.filter((slot) => !bookedSlots.includes(slot));
}

/**
 * Get available time slots across all staff members (any available slot)
 * This merges schedules from multiple staff and finds slots available from any staff member
 * @param allStaffSchedules - Array of staff schedules, each with staffId and schedules
 * @param date - The date to check
 * @param bookedSlotsByStaff - Map of staffId to their booked slots (e.g., { "staff1": ["10:00"], "staff2": ["14:30"] })
 * @param intervalMinutes - Time slot interval in minutes (default: 30)
 * @returns Array of available time slots in "HH:mm" format (available from at least one staff member)
 */
export function getAvailableTimeSlotsAnyStaff(
  allStaffSchedules: Array<{
    staffId: string;
    schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
  }>,
  date: Date,
  bookedSlotsByStaff: Record<string, string[]>,
  intervalMinutes: number = 30
): string[] {
  const dayOfWeek = date.getDay();
  const availableSlotsSet = new Set<string>();

  // For each staff member, find their available slots
  for (const staff of allStaffSchedules) {
    const schedule = getScheduleForDay(staff.schedules, dayOfWeek);
    if (!schedule) continue; // Skip if no schedule for this day

    const allSlots = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      intervalMinutes
    );

    const bookedSlots = bookedSlotsByStaff[staff.staffId] || [];
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    // Add all available slots to the set (union of all staff availability)
    availableSlots.forEach((slot) => availableSlotsSet.add(slot));
  }

  // Convert set to sorted array
  return Array.from(availableSlotsSet).sort();
}
