import { Project, TimeEntry, ActiveTimer } from "./types";

const PROJECTS_KEY = "tt_projects";
const ENTRIES_KEY = "tt_entries";
const TIMER_KEY = "tt_active_timer";

function get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getProjects: (): Project[] => get(PROJECTS_KEY, []),
  setProjects: (p: Project[]) => set(PROJECTS_KEY, p),

  getEntries: (): TimeEntry[] => get(ENTRIES_KEY, []),
  setEntries: (e: TimeEntry[]) => set(ENTRIES_KEY, e),

  getActiveTimer: (): ActiveTimer | null => get(TIMER_KEY, null),
  setActiveTimer: (t: ActiveTimer | null) => set(TIMER_KEY, t),
};
