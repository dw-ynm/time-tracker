"use client";

import { useMemo, useState } from "react";
import { format, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Copy, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project, TimeEntry } from "@/lib/types";
import {
  getWeekRange,
  getWeekDays,
  getEntriesForWeek,
  formatHours,
  totalDuration,
} from "@/lib/time";

interface Props {
  entries: TimeEntry[];
  projects: Project[];
}

export function WeeklySummary({ entries, projects }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentDate = useMemo(() => {
    let d = new Date();
    if (weekOffset > 0) d = addWeeks(d, weekOffset);
    if (weekOffset < 0) d = subWeeks(d, Math.abs(weekOffset));
    return d;
  }, [weekOffset]);

  const { start, end } = getWeekRange(currentDate);
  const weekDays = getWeekDays(currentDate);
  const weekEntries = getEntriesForWeek(entries, currentDate);

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  // Per-project totals with notes
  const projectTotals = useMemo(() => {
    const durMap = new Map<string, number>();
    const noteMap = new Map<string, string[]>();
    for (const e of weekEntries) {
      durMap.set(e.projectId, (durMap.get(e.projectId) ?? 0) + e.duration);
      if (e.note) {
        const notes = noteMap.get(e.projectId) ?? [];
        if (!notes.includes(e.note)) notes.push(e.note);
        noteMap.set(e.projectId, notes);
      }
    }
    return Array.from(durMap.entries())
      .map(([projectId, duration]) => ({
        project: projectMap.get(projectId),
        projectId,
        duration,
        notes: noteMap.get(projectId) ?? [],
      }))
      .sort((a, b) => b.duration - a.duration);
  }, [weekEntries, projectMap]);

  // Per-day totals
  const dayTotals = useMemo(() => {
    return weekDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayEntries = weekEntries.filter((e) => e.date === dateStr);
      return { day, total: totalDuration(dayEntries) };
    });
  }, [weekDays, weekEntries]);

  const weekTotal = totalDuration(weekEntries);

  const handleCopy = () => {
    const lines: string[] = [];
    lines.push(
      `Time Report: ${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`
    );
    lines.push("");

    for (const { project, duration, notes } of projectTotals) {
      lines.push(`${project?.name ?? "Unknown"}: ${formatHours(duration)}`);
      if (notes.length > 0) {
        for (const note of notes) {
          lines.push(`  - ${note}`);
        }
      }
    }

    lines.push("");
    lines.push("Daily breakdown:");
    for (const { day, total } of dayTotals) {
      if (total > 0) {
        lines.push(`  ${format(day, "EEE, MMM d")}: ${formatHours(total)}`);
      }
    }

    lines.push("");
    lines.push(`Total: ${formatHours(weekTotal)}`);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setWeekOffset((o) => o - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-semibold">
            {format(start, "MMM d")} – {format(end, "MMM d, yyyy")}
          </p>
          <p className="text-2xl font-bold font-mono mt-1">
            {formatHours(weekTotal)}
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setWeekOffset((o) => o + 1)}
          disabled={weekOffset >= 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Project totals */}
      {projectTotals.length > 0 ? (
        <div className="space-y-2">
          {projectTotals.map(({ project, projectId, duration, notes }) => {
            const pct = weekTotal > 0 ? (duration / weekTotal) * 100 : 0;
            return (
              <div key={projectId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: project?.color ?? "#666",
                      }}
                    />
                    <span className="font-medium">
                      {project?.name ?? "Deleted"}
                    </span>
                  </div>
                  <span className="font-mono">{formatHours(duration)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: project?.color ?? "#666",
                    }}
                  />
                </div>
                {notes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {notes.map((note) => (
                      <span
                        key={note}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                      >
                        <MessageSquare className="h-2.5 w-2.5" />
                        {note}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No entries this week.
        </p>
      )}

      {/* Daily breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
          Daily
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {dayTotals.map(({ day, total }) => (
            <div key={day.toISOString()} className="text-center">
              <p className="text-xs text-muted-foreground">
                {format(day, "EEE")}
              </p>
              <p className="text-xs font-mono mt-1">
                {total > 0 ? formatHours(total) : "–"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Copy button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={handleCopy}
        disabled={weekEntries.length === 0}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copy as text
          </>
        )}
      </Button>
    </div>
  );
}
