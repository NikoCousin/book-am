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
