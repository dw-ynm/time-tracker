export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // milliseconds
  note?: string;
}

export interface ActiveTimer {
  projectId: string;
  startTime: string; // ISO string
  note?: string;
  paused?: boolean;
  accumulatedMs?: number; // ms accumulated before current run segment
}
