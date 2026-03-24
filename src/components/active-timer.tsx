"use client";

import { useEffect, useState } from "react";
import { Square, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActiveTimer as ActiveTimerType, Project } from "@/lib/types";
import { formatDuration } from "@/lib/time";

interface Props {
  timer: ActiveTimerType;
  project: Project | undefined;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onUpdateNote: (note: string) => void;
}

export function ActiveTimerDisplay({ timer, project, onStop, onPause, onResume, onUpdateNote }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const accumulated = timer.accumulatedMs ?? 0;

    if (timer.paused) {
      setElapsed(accumulated);
      document.title = `${formatDuration(accumulated)} ⏸ ${project?.name ?? "Timer"}`;
      return;
    }

    const start = new Date(timer.startTime).getTime();
    const originalTitle = document.title;
    const tick = () => {
      const now = accumulated + (Date.now() - start);
      setElapsed(now);
      document.title = `${formatDuration(now)} — ${project?.name ?? "Timer"}`;
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => {
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, [timer.startTime, timer.paused, timer.accumulatedMs, project?.name]);

  return (
    <div
      className="rounded-xl p-6 text-center space-y-3"
      style={{ backgroundColor: `${project?.color ?? "#54B6BE"}20` }}
    >
      <div className="flex items-center justify-center gap-2">
        <span
          className={`inline-block h-3 w-3 rounded-full ${timer.paused ? "" : "animate-pulse"}`}
          style={{ backgroundColor: project?.color ?? "#54B6BE" }}
        />
        <span className="text-sm font-medium text-muted-foreground">
          {timer.paused ? "Paused" : "Tracking time"}
        </span>
      </div>
      <p className="text-lg font-semibold" style={{ color: project?.color }}>
        {project?.name ?? "Unknown project"}
      </p>
      <p className={`font-mono text-5xl font-bold tracking-tight ${timer.paused ? "opacity-60" : ""}`}>
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
      <div className="flex items-center justify-center gap-2 mt-2">
        {timer.paused ? (
          <Button
            size="lg"
            onClick={onResume}
            style={{ backgroundColor: project?.color ?? "#54B6BE", color: "white" }}
          >
            <Play className="mr-2 h-4 w-4 fill-current" />
            Resume
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            onClick={onPause}
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
        )}
        <Button
          variant="destructive"
          size="lg"
          onClick={onStop}
        >
          <Square className="mr-2 h-4 w-4 fill-current" />
          Stop
        </Button>
      </div>
    </div>
  );
}
