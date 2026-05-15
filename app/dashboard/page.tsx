"use client";

import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { AIInsightsCard } from "@/components/dashboard/Ai-insights-card";
import { BrainDumpCard } from "@/components/dashboard/Brain-dump-card";
import { MatchaProgressCard } from "@/components/dashboard/Matcha-progress-card";
import { MITCard } from "@/components/dashboard/Mit-card";
import { StreakCard } from "@/components/dashboard/Streak-card";
import { TimerCard } from "@/components/dashboard/Timer-card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useMITApi } from "@/features/task-list/useTasksApi";
import { useTasksApi } from "@/features/task-list/useTasksApi";

export default function DashboardPage() {
  const { mits, addMIT, updateTitle, markAsDone, remainingSlots } = useMITApi();
  const { tasks, addTask, deleteTask, updateTask } = useTasksApi();

  const brainDumpTasks = tasks.filter((t) => t.type === "braindump");

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (source.droppableId === "mit-list" && destination.droppableId === "braindump-list") {
      const mit = mits[source.index];
      if (!mit) return;
      addTask({ title: mit.title, completed: false, type: "braindump" });
      markAsDone(mit.id);
    }

    if (source.droppableId === "braindump-list" && destination.droppableId === "mit-list") {
      const task = brainDumpTasks[source.index];
      if (!task) return;
      addMIT(task.title).then((result) => {
        if (result.success) {
          deleteTask(task.id);
        }
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-cream">
        <header className="border-b border-border/30 bg-white/50">
          <div className="mx-auto flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-matcha text-cream font-bold">
                ZB
              </div>
              <h1 className="text-xl font-bold text-foreground">Zen Berry</h1>
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="text-right sm:text-left">
                <p className="text-sm font-medium text-foreground">Welcome back!</p>
                <p className="text-xs text-muted-foreground">Jane Doe</p>
              </div>
              <Button size="sm" variant="outline" className="border-border">
                <LogOut className="mr-2 size-4" />
                Log out
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-3">
            <div className="flex flex-col gap-6">
              <TimerCard />
              <StreakCard />
              <MatchaProgressCard />
            </div>

            <div className="flex flex-col gap-6">
              <MITCard
                mits={mits}
                droppableId="mit-list"
                onAdd={addMIT}
                onUpdateTitle={updateTitle}
                onMarkDone={markAsDone}
                remainingSlots={remainingSlots}
              />
              <BrainDumpCard
                tasks={brainDumpTasks}
                droppableId="braindump-list"
                onAdd={(task) => addTask({ ...task, type: "braindump", completed: false })}
                onToggleComplete={(id) => {
                  const task = tasks.find((t) => t.id === id);
                  if (task) updateTask(id, { completed: !task.completed });
                }}
                onDelete={deleteTask}
              />
            </div>

            <div className="flex">
              <AIInsightsCard />
            </div>
          </div>
        </main>
      </div>
    </DragDropContext>
  );
}