"use client";

import { useState } from "react";
import { Play, Square, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project, ActiveTimer } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  projects: Project[];
  activeTimer: ActiveTimer | null;
  onStart: (projectId: string) => void;
  onStop: () => void;
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectList({
  projects,
  activeTimer,
  onStart,
  onStop,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName("");
    setAddOpen(false);
  };

  const handleUpdate = () => {
    if (!editId || !editName.trim()) return;
    onUpdate(editId, editName.trim());
    setEditId(null);
    setEditName("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Projects</h2>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Project name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <Button type="submit">Add</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No projects yet. Add one to get started.
        </p>
      )}

      {projects.map((project) => {
        const isActive = activeTimer?.projectId === project.id;
        return (
          <div
            key={project.id}
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <span
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />

            {editId === project.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate();
                }}
                className="flex flex-1 gap-2"
              >
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="h-8"
                />
                <Button type="submit" size="sm">
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditId(null)}
                >
                  Cancel
                </Button>
              </form>
            ) : (
              <>
                <span className="flex-1 font-medium truncate">
                  {project.name}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditId(project.id);
                      setEditName(project.name);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onDelete(project.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {isActive ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={onStop}
                      className="ml-1"
                    >
                      <Square className="h-3.5 w-3.5 mr-1 fill-current" />
                      Stop
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onStart(project.id)}
                      className="ml-1"
                      style={{
                        backgroundColor: project.color,
                        color: "white",
                      }}
                    >
                      <Play className="h-3.5 w-3.5 mr-1 fill-current" />
                      Start
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
