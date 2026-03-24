"use client";

import { useEffect, useState } from "react";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActiveTimer as ActiveTimerType, Project } from "@/lib/types";
import { formatDuration } from "@/lib/time";

interface Props {
  timer: ActiveTimerType;
  project: Project | undefined;
  onStop: () => void;
  onUpdateNote: (note: string) => void;
}

export function ActiveTimerDisplay({ timer, project, onStop, onUpdateNote }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(timer.startTime).getTime();
    const originalTitle = document.title;
    const tick = () => {
      const now = Date.now() - start;
      setElapsed(now);
      // Show timer in browser tab title
      document.title = `${formatDuration(now)} — ${project?.name ?? "Timer"}`;
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => {
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, [timer.startTime, project?.name]);

  return (
    <div
      className="rounded-xl p-6 text-center space-y-3"
      style={{ backgroundColor: `${project?.color ?? "#54B6BE"}20` }}
    >
      <div className="flex items-center justify-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-full animate-pulse"
          style={{ backgroundColor: project?.color ?? "#54B6BE" }}
        />
        <span className="text-sm font-medium text-muted-foreground">
          Tracking time
        </span>
      </div>
      <p className="text-lg font-semibold" style={{ color: project?.color }}>
        {project?.name ?? "Unknown project"}
      </p>
      <p className="font-mono text-5xl font-bold tracking-tight">
        {formatDuration(elapsed)}
      </p>
      <div className="max-w-xs mx-auto">
        <Input
          placeholder="What are you working on?"
          value={timer.note ?? ""}
          onChange={(e) => onUpdateNote(e.target.value)}
          className="text-center text-sm bg-background/50"
        />
      </div>
      <Button
        variant="destructive"
        size="lg"
        className="mt-2"
        onClick={onStop}
      >
        <Square className="mr-2 h-4 w-4 fill-current" />
        Stop
      </Button>
    </div>
  );
}
