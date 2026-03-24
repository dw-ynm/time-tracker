"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Project } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  projects: Project[];
  onAdd: (
    projectId: string,
    date: string,
    startTime: string,
    endTime: string,
    note?: string
  ) => void;
}

export function ManualEntry({ projects, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [note, setNote] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    onAdd(projectId, date, startTime, endTime, note || undefined);
    setNote("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Manual entry
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add time entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="me-project">Project</Label>
            <select
              id="me-project"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="me-date">Date</Label>
            <Input
              id="me-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="me-start">Start time</Label>
              <Input
                id="me-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="me-end">End time</Label>
              <Input
                id="me-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="me-note">Note (optional)</Label>
            <Input
              id="me-note"
              placeholder="e.g. research, call, migration..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Add entry
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
