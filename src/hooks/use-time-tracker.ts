"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { format } from "date-fns";
import { Project, TimeEntry, ActiveTimer } from "@/lib/types";
import { storage } from "@/lib/storage";
import { getNextColor } from "@/lib/colors";

export function useTimeTracker() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setProjects(storage.getProjects());
    setEntries(storage.getEntries());
    setActiveTimer(storage.getActiveTimer());
    setLoaded(true);
  }, []);

  // Persist changes
  useEffect(() => {
    if (!loaded) return;
    storage.setProjects(projects);
  }, [projects, loaded]);

  useEffect(() => {
    if (!loaded) return;
    storage.setEntries(entries);
  }, [entries, loaded]);

  useEffect(() => {
    if (!loaded) return;
    storage.setActiveTimer(activeTimer);
  }, [activeTimer, loaded]);

  const addProject = useCallback((name: string) => {
    setProjects((prev) => {
      const color = getNextColor(prev.map((p) => p.color));
      return [...prev, { id: uuid(), name, color }];
    });
  }, []);

  const updateProject = useCallback((id: string, name: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setEntries((prev) => prev.filter((e) => e.projectId !== id));
      if (activeTimer?.projectId === id) {
        setActiveTimer(null);
      }
    },
    [activeTimer]
  );

  const startTimer = useCallback(
    (projectId: string) => {
      const now = new Date().toISOString();

      // Stop current timer if running
      if (activeTimer) {
        const accumulated = activeTimer.accumulatedMs ?? 0;
        const currentSegment = activeTimer.paused
          ? 0
          : Date.now() - new Date(activeTimer.startTime).getTime();
        const totalDuration = accumulated + currentSegment;
        const entryStart = new Date(Date.now() - totalDuration);
        const entry: TimeEntry = {
          id: uuid(),
          projectId: activeTimer.projectId,
          date: format(entryStart, "yyyy-MM-dd"),
          startTime: entryStart.toISOString(),
          endTime: now,
          duration: totalDuration,
          note: activeTimer.note,
        };
        setEntries((prev) => [...prev, entry]);
      }

      setActiveTimer({ projectId, startTime: now });
    },
    [activeTimer]
  );

  const stopTimer = useCallback(() => {
    if (!activeTimer) return;
    const now = new Date().toISOString();
    const accumulated = activeTimer.accumulatedMs ?? 0;
    const currentSegment = activeTimer.paused
      ? 0
      : Date.now() - new Date(activeTimer.startTime).getTime();
    const totalDuration = accumulated + currentSegment;
    // Use original start time for the entry (first segment start)
    const entryStart = new Date(Date.now() - totalDuration);
    const entry: TimeEntry = {
      id: uuid(),
      projectId: activeTimer.projectId,
      date: format(entryStart, "yyyy-MM-dd"),
      startTime: entryStart.toISOString(),
      endTime: now,
      duration: totalDuration,
      note: activeTimer.note,
    };
    setEntries((prev) => [...prev, entry]);
    setActiveTimer(null);
  }, [activeTimer]);

  const pauseTimer = useCallback(() => {
    if (!activeTimer || activeTimer.paused) return;
    const currentSegment = Date.now() - new Date(activeTimer.startTime).getTime();
    const accumulated = (activeTimer.accumulatedMs ?? 0) + currentSegment;
    setActiveTimer({ ...activeTimer, paused: true, accumulatedMs: accumulated });
  }, [activeTimer]);

  const resumeTimer = useCallback(() => {
    if (!activeTimer || !activeTimer.paused) return;
    setActiveTimer({
      ...activeTimer,
      paused: false,
      startTime: new Date().toISOString(),
    });
  }, [activeTimer]);

  const updateTimerNote = useCallback((note: string) => {
    setActiveTimer((prev) => (prev ? { ...prev, note } : prev));
  }, []);

  const addManualEntry = useCallback(
    (projectId: string, date: string, startTime: string, endTime: string, note?: string) => {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      const duration = end.getTime() - start.getTime();
      if (duration <= 0) return;
      const entry: TimeEntry = {
        id: uuid(),
        projectId,
        date,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        duration,
        note,
      };
      setEntries((prev) => [...prev, entry]);
    },
    []
  );

  const updateEntry = useCallback(
    (id: string, updates: { startTime?: string; endTime?: string; note?: string; date?: string }) => {
      setEntries((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const newEntry = { ...e };
          if (updates.date !== undefined) newEntry.date = updates.date;
          if (updates.note !== undefined) newEntry.note = updates.note;
          if (updates.startTime !== undefined || updates.endTime !== undefined) {
            const date = updates.date ?? e.date;
            const startStr = updates.startTime ?? format(new Date(e.startTime), "HH:mm");
            const endStr = updates.endTime ?? format(new Date(e.endTime), "HH:mm");
            const start = new Date(`${date}T${startStr}`);
            const end = new Date(`${date}T${endStr}`);
            const duration = end.getTime() - start.getTime();
            if (duration <= 0) return e; // invalid edit, keep original
            newEntry.startTime = start.toISOString();
            newEntry.endTime = end.toISOString();
            newEntry.duration = duration;
          }
          return newEntry;
        })
      );
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    projects,
    entries,
    activeTimer,
    loaded,
    addProject,
    updateProject,
    deleteProject,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    updateTimerNote,
    addManualEntry,
    updateEntry,
    deleteEntry,
  };
}
