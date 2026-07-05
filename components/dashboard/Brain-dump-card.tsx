"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { DnDWrapper } from "@/components/DnDWrapper";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  type: string;
}

interface BrainDumpCardProps {
  tasks: Task[];
  droppableId: string;
  onAdd: (task: Omit<Task, "id"> & { id?: string }) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

function StaticTaskList({
  tasks,
  onToggleComplete,
  onDelete,
}: {
  tasks: Task[]
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-white/30 p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-3xl">🧠</span>
          <p className="text-sm font-medium text-muted-foreground">
            Having a Foggy Brain? — Dump your thoughts here!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pr-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
            task.completed ? "bg-matcha-light/40" : "bg-white/70"
          }`}
        >
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              task.completed
                ? "border-matcha bg-matcha"
                : "border-muted-foreground/30 bg-white"
            }`}
          >
            {task.completed && (
              <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6L5 8.5L9.5 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <span
            className={`flex-1 text-sm ${
              task.completed
                ? "text-muted-foreground line-through"
                : "text-foreground"
            }`}
          >
            {task.title}
          </span>
          <button
            onClick={() => onDelete(task.id)}
            className="flex size-10 p-2 shrink-0 items-center justify-center rounded-full transition-colors text-red-400 cursor-pointer hover:bg-red-100"
          >
            <Trash2 />
          </button>
        </div>
      ))}
    </div>
  )
}

export function BrainDumpCard({
  tasks,
  droppableId,
  onAdd,
  onToggleComplete,
  onDelete,
}: BrainDumpCardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newTaskTitle.trim() || isAdding) return;
    setIsAdding(true);
    await onAdd({
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      type: "braindump",
    });
    setIsAdding(false);
    setNewTaskTitle("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="flex h-full flex-col rounded-3xl bg-strawberry-light/30 p-6 border border-matcha-dark/20">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">🧠</span>
        <h3 className="text-lg font-semibold text-foreground">Brain Dump</h3>
        <span className="text-base">🌱</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Capture everything — promote to MIT when ready
      </p>

      {/* Input */}
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-white/70 p-3">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Quick thought..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        />
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="flex size-7 items-center justify-center rounded-full bg-matcha text-white hover:bg-matcha/90 disabled:opacity-50 transition-colors"
        >
          {isAdding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        </button>
      </div>

      {/* Task List */}
      <DnDWrapper
        fallback={
          <div className="flex flex-1 flex-col overflow-y-auto">
            <ScrollArea className="flex-1 max-h-[380px]">
              <StaticTaskList
                tasks={tasks}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
              />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        }
      >
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-1 flex-col overflow-y-auto"
            >
              <ScrollArea className="flex-1 max-h-[380px]">
                {tasks.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-white/30 p-6">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="text-3xl">🧠</span>
                      <p className="text-sm font-medium text-muted-foreground">
                        Having a Foggy Brain? — Dump your thoughts here!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 pr-4">
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                              task.completed ? "bg-matcha-light/40" : "bg-white/70"
                            } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                          >
                            <button
                              onClick={() => onToggleComplete(task.id)}
                              className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                task.completed
                                  ? "border-matcha bg-matcha"
                                  : "border-muted-foreground/30 bg-white"
                              }`}
                            >
                              {task.completed && (
                                <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                                  <path
                                    d="M2.5 6L5 8.5L9.5 4"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>
                            <span
                              className={`flex-1 text-sm ${
                                task.completed
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </span>
                            <button
                              onClick={() => onDelete(task.id)}
                              className="flex size-10 p-2 shrink-0 items-center justify-center rounded-full transition-colors text-red-400 cursor-pointer hover:bg-red-100"
                            >
                              <Trash2 />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                )}
                <ScrollBar orientation="vertical" />
              </ScrollArea>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DnDWrapper>
    </div>
  );
}