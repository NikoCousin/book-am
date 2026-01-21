/**
 * Calendar utility functions for day view
 */

const MINUTES_PER_HOUR = 60;
const PIXELS_PER_MINUTE = 2; // Each minute = 2px (30 min = 60px)
const TIME_SLOT_HEIGHT = 30 * PIXELS_PER_MINUTE; // 60px per 30-minute slot

/**
 * Generate time slots from start to end hour
 */
export function generateTimeSlots(startHour: number = 9, endHour: number = 20): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

/**
 * Convert time string (HH:mm) to minutes since start of day
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
}

/**
 * Convert minutes since start of day to time string (HH:mm)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const mins = minutes % MINUTES_PER_HOUR;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Calculate top position (in pixels) for a booking based on start time
 */
export function calculateBookingTop(startTime: string, dayStartHour: number = 9): number {
  const startMinutes = timeToMinutes(startTime);
  const dayStartMinutes = dayStartHour * MINUTES_PER_HOUR;
  const offsetMinutes = startMinutes - dayStartMinutes;
  return offsetMinutes * PIXELS_PER_MINUTE;
}

/**
 * Calculate height (in pixels) for a booking based on duration
 */
export function calculateBookingHeight(durationMinutes: number): number {
  return durationMinutes * PIXELS_PER_MINUTE;
}

/**
 * Check if a time is within working hours for a staff member on a given day
 */
export function isWithinWorkingHours(
  time: string,
  schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
  dayOfWeek: number
): boolean {
  const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
  if (!schedule) return false;

  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(schedule.startTime);
  const endMinutes = timeToMinutes(schedule.endTime);

  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

/**
 * Get working hours range for a staff member on a given day
 */
export function getWorkingHours(
  schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
  dayOfWeek: number
): { startTime: string; endTime: string } | null {
  return schedules.find((s) => s.dayOfWeek === dayOfWeek) || null;
}

/**
 * Get the earliest start time and latest end time from all schedules
 */
export function getBusinessHours(
  allSchedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
): { startHour: number; endHour: number } {
  if (allSchedules.length === 0) {
    return { startHour: 9, endHour: 20 };
  }

  let earliestStart = 24;
  let latestEnd = 0;

  allSchedules.forEach((schedule) => {
    const startHour = parseInt(schedule.startTime.split(":")[0]);
    const endHour = parseInt(schedule.endTime.split(":")[0]);
    if (startHour < earliestStart) earliestStart = startHour;
    if (endHour > latestEnd) latestEnd = endHour;
  });

  return {
    startHour: earliestStart,
    endHour: latestEnd + 1, // Add 1 to include the end hour
  };
}
