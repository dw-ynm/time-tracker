import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, parseISO } from "date-fns";
import { TimeEntry } from "./types";

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function formatHours(ms: number): string {
  const hours = ms / 3_600_000;
  return `${hours.toFixed(1)}h`;
}

export function getWeekRange(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
}

export function getWeekDays(date: Date = new Date()): Date[] {
  const { start, end } = getWeekRange(date);
  return eachDayOfInterval({ start, end });
}

export function getEntriesForDay(entries: TimeEntry[], date: Date): TimeEntry[] {
  const dateStr = format(date, "yyyy-MM-dd");
  return entries.filter((e) => e.date === dateStr);
}

export function getEntriesForWeek(entries: TimeEntry[], date: Date = new Date()): TimeEntry[] {
  const { start, end } = getWeekRange(date);
  return entries.filter((e) => {
    const entryDate = parseISO(e.date);
    return isWithinInterval(entryDate, { start, end });
  });
}

export function totalDuration(entries: TimeEntry[]): number {
  return entries.reduce((sum, e) => sum + e.duration, 0);
}

export function formatTimeOfDay(isoString: string): string {
  return format(parseISO(isoString), "HH:mm");
}

export function formatDateShort(date: Date): string {
  return format(date, "EEE, MMM d");
}
