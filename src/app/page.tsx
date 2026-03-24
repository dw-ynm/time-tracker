"use client";

import Image from "next/image";
import { Timer, CalendarDays, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimeTracker } from "@/hooks/use-time-tracker";
import { ActiveTimerDisplay } from "@/components/active-timer";
import { ProjectList } from "@/components/project-list";
import { DailyView } from "@/components/daily-view";
import { WeeklySummary } from "@/components/weekly-summary";
import { ManualEntry } from "@/components/manual-entry";

export default function Home() {
  const {
    projects,
    entries,
    activeTimer,
    loaded,
    addProject,
    updateProject,
    deleteProject,
    startTimer,
    stopTimer,
    updateTimerNote,
    addManualEntry,
    updateEntry,
    deleteEntry,
  } = useTimeTracker();

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/younium-logo.png"
            alt="Younium"
            width={100}
            height={22}
            className="shrink-0"
            priority
          />
          <span className="text-border">|</span>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight whitespace-nowrap">
            Time Tracker
          </h1>
        </div>
        <ManualEntry projects={projects} onAdd={addManualEntry} />
      </header>

      {/* Active timer display */}
      {activeTimer && (
        <ActiveTimerDisplay
          timer={activeTimer}
          project={projects.find((p) => p.id === activeTimer.projectId)}
          onStop={stopTimer}
          onUpdateNote={updateTimerNote}
        />
      )}

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="projects" className="flex-1">
            <Timer className="h-4 w-4 mr-1.5" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex-1">
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1">
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Weekly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <ProjectList
            projects={projects}
            activeTimer={activeTimer}
            onStart={startTimer}
            onStop={stopTimer}
            onAdd={addProject}
            onUpdate={updateProject}
            onDelete={deleteProject}
          />
        </TabsContent>

        <TabsContent value="daily" className="mt-4">
          <DailyView
            entries={entries}
            projects={projects}
            onDeleteEntry={deleteEntry}
            onUpdateEntry={updateEntry}
          />
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <WeeklySummary entries={entries} projects={projects} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
