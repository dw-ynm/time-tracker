"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Trash2, Pencil, Check, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project, TimeEntry } from "@/lib/types";
import {
  formatDuration,
  formatHours,
  formatBillableHours,
  formatTimeOfDay,
  totalDuration,
} from "@/lib/time";

interface Props {
  entries: TimeEntry[];
  projects: Project[];
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, updates: { startTime?: string; endTime?: string; note?: string }) => void;
}

function EntryRow({
  entry,
  project,
  onDelete,
  onUpdate,
}: {
  entry: TimeEntry;
  project: Project | undefined;
  onDelete: () => void;
  onUpdate: (updates: { startTime?: string; endTime?: string; note?: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editNote, setEditNote] = useState("");

  const startEdit = () => {
    setEditStart(format(parseISO(entry.startTime), "HH:mm"));
    setEditEnd(format(parseISO(entry.endTime), "HH:mm"));
    setEditNote(entry.note ?? "");
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdate({ startTime: editStart, endTime: editEnd, note: editNote });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-md border px-3 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: project?.color ?? "#666" }}
          />
          <span className="font-medium text-sm truncate">
            {project?.name ?? "Deleted project"}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}>
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={editStart}
            onChange={(e) => setEditStart(e.target.value)}
            className="h-7 text-xs w-24"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            type="time"
            value={editEnd}
            onChange={(e) => setEditEnd(e.target.value)}
            className="h-7 text-xs w-24"
          />
        </div>
        <Input
          placeholder="Note (e.g. research, call, migration...)"
          value={editNote}
          onChange={(e) => setEditNote(e.target.value)}
          className="h-7 text-xs"
        />
      </div>
    );
  }

  return (
    <div className="rounded-md border px-3 py-2 text-sm">
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: project?.color ?? "#666" }}
        />
        <span className="font-medium truncate min-w-0">
          {project?.name ?? "Deleted project"}
        </span>
        <span className="ml-auto text-muted-foreground whitespace-nowrap font-mono text-xs">
          {formatTimeOfDay(entry.startTime)} –{" "}
          {formatTimeOfDay(entry.endTime)}
        </span>
        <span className="font-mono text-xs whitespace-nowrap">
          {formatDuration(entry.duration)}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0"
          onClick={startEdit}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 shrink-0 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {entry.note && (
        <div className="flex items-start gap-1.5 mt-1.5 ml-6">
          <MessageSquare className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-xs text-muted-foreground">{entry.note}</span>
        </div>
      )}
    </div>
  );
}

export function DailyView({ entries, projects, onDeleteEntry, onUpdateEntry }: Props) {
  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  // Group entries by date, sorted newest first
  const grouped = useMemo(() => {
    const map = new Map<string, TimeEntry[]>();
    for (const entry of entries) {
      const list = map.get(entry.date) ?? [];
      list.push(entry);
      map.set(entry.date, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 14); // last 2 weeks
  }, [entries]);

  if (grouped.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No time entries yet. Start a timer to begin tracking.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, dayEntries]) => {
        const dayTotal = totalDuration(dayEntries);
        const sorted = [...dayEntries].sort((a, b) =>
          b.startTime.localeCompare(a.startTime)
        );

        // Per-project totals for the day
        const projectTotals = new Map<string, number>();
        for (const e of dayEntries) {
          projectTotals.set(
            e.projectId,
            (projectTotals.get(e.projectId) ?? 0) + e.duration
          );
        }

        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">
                {format(parseISO(date), "EEEE, MMM d")}
              </h3>
              <span className="text-sm font-mono flex items-center gap-1.5">
                <span className="text-muted-foreground">{formatHours(dayTotal)}</span>
                <span className="text-xs text-muted-foreground/60">→</span>
                <span className="text-foreground">{formatBillableHours(dayTotal)}</span>
              </span>
            </div>

            {/* Per-project subtotals */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Array.from(projectTotals.entries()).map(
                ([projectId, duration]) => {
                  const project = projectMap.get(projectId);
                  return (
                    <span
                      key={projectId}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${project?.color ?? "#666"}20`,
                        color: project?.color ?? "#666",
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: project?.color ?? "#666",
                        }}
                      />
                      {project?.name ?? "Deleted"}: {formatHours(duration)} → {formatBillableHours(duration)}
                    </span>
                  );
                }
              )}
            </div>

            <div className="space-y-1">
              {sorted.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  project={projectMap.get(entry.projectId)}
                  onDelete={() => onDeleteEntry(entry.id)}
                  onUpdate={(updates) => onUpdateEntry(entry.id, updates)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
