"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DragDropContext, DropResult } from "@hello-pangea/dnd"
import { AIInsightsCard } from "@/components/dashboard/Ai-insights-card"
import { BrainDumpCard } from "@/components/dashboard/Brain-dump-card"
import { MatchaProgressCard } from "@/components/dashboard/Matcha-progress-card"
import { MITCard } from "@/components/dashboard/Mit-card"
import { StreakCard } from "@/components/dashboard/Streak-card"
import { TimerCard } from "@/components/dashboard/Timer-card"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useMITApi, useTasksApi } from "@/hooks/useTasksApi"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ConfirmDragDialog } from "@/components/dashboard/ConfirmDragDialog"
import { DailyZenTip } from "@/components/dashboard/Daily-zen-tip"
import { toast } from "sonner"

interface PendingDrag {
  direction: "to-mit" | "to-braindump"
  taskTitle: string
  sourceIndex: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    fetch("/api/auth-service/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
        setLoadingUser(false)
      })
      .catch(() => setLoadingUser(false))
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth-service/logout", { method: "POST" })
    router.push("/auth/login")
    router.refresh()
  }

  const { mits, addMIT, updateTitle, markAsDone, remainingSlots } = useMITApi()
  const { tasks, addTask, deleteTask, updateTask } = useTasksApi()
  const [pendingDrag, setPendingDrag] = useState<PendingDrag | null>(null)

  const brainDumpTasks = tasks.filter((t) => t.type === "braindump")

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (source.droppableId === "mit-list" && destination.droppableId === "braindump-list") {
      const mit = mits[source.index]
      if (!mit) return
      setPendingDrag({ direction: "to-braindump", taskTitle: mit.title, sourceIndex: source.index })
    }

    if (source.droppableId === "braindump-list" && destination.droppableId === "mit-list") {
      const task = brainDumpTasks[source.index]
      if (!task) return
      if (remainingSlots <= 0) {
        toast.error("You can only have 3 Most Important Tasks at a time. Complete one first.")
        return
      }
      setPendingDrag({ direction: "to-mit", taskTitle: task.title, sourceIndex: source.index })
    }
  }

  const executeDrag = () => {
    if (!pendingDrag) return

    if (pendingDrag.direction === "to-braindump") {
      const mit = mits[pendingDrag.sourceIndex]
      if (!mit) { setPendingDrag(null); return }
      addTask({ title: mit.title, completed: false, type: "braindump" })
      markAsDone(mit.id)
    }

    if (pendingDrag.direction === "to-mit") {
      const task = brainDumpTasks[pendingDrag.sourceIndex]
      if (!task) { setPendingDrag(null); return }
      addMIT(task.title).then((result) => {
        if (result.success) {
          deleteTask(task.id)
        }
      })
    }

    setPendingDrag(null)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-cream">
        <header className="border-b border-border/30 bg-white/50">
          <div className="mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-matcha text-cream font-bold">
                ZB
              </div>
              <h1 className="text-xl font-bold text-foreground">Zen Berry</h1>
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="text-right sm:text-left">
                <p className="text-sm font-medium text-foreground">Welcome back!</p>
                <p className="text-xs text-muted-foreground">
                  {loadingUser ? "Loading..." : user?.name}
                </p>
              </div>
              <Button size="sm" variant="outline" className="border-border" onClick={handleLogout} disabled={loadingUser}>
                {loadingUser ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LogOut className="mr-2 size-4" />}
                Log out
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-8xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-3">
            <div className="flex flex-col gap-6">
              <ErrorBoundary name="Timer" fallback={<p className="text-sm text-muted-foreground p-4">Timer unavailable</p>}>
                <TimerCard />
              </ErrorBoundary>
              <ErrorBoundary name="Streak" fallback={<p className="text-sm text-muted-foreground p-4">Streak unavailable</p>}>
                <StreakCard />
              </ErrorBoundary>
              <ErrorBoundary name="Progress" fallback={<p className="text-sm text-muted-foreground p-4">Progress unavailable</p>}>
                <MatchaProgressCard />
              </ErrorBoundary>
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
                  const task = tasks.find((t) => t.id === id)
                  if (task) updateTask(id, { completed: !task.completed })
                }}
                onDelete={deleteTask}
              />
            </div>

            <div className="flex flex-col gap-6">
              <ErrorBoundary name="AI Insights" fallback={<p className="text-sm text-muted-foreground p-4">Insights unavailable</p>}>
                <AIInsightsCard />
              </ErrorBoundary>
              {user && <DailyZenTip />}
            </div>
          </div>
        </main>
      </div>
      <ConfirmDragDialog
        open={pendingDrag !== null}
        direction={pendingDrag?.direction ?? null}
        taskTitle={pendingDrag?.taskTitle ?? ""}
        onConfirm={executeDrag}
        onCancel={() => setPendingDrag(null)}
      />
    </DragDropContext>
  )
}
