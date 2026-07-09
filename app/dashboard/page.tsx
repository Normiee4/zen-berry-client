"use client"

import { useEffect, useState } from "react"
import { DragDropContext, DropResult } from "@hello-pangea/dnd"
import { AIInsightsCard } from "@/components/dashboard/Ai-insights-card"
import { BrainDumpCard } from "@/components/dashboard/Brain-dump-card"
import { MatchaProgressCard } from "@/components/dashboard/Matcha-progress-card"
import { MITCard } from "@/components/dashboard/Mit-card"
import { StreakCard } from "@/components/dashboard/Streak-card"
import { TimerCard } from "@/components/dashboard/Timer-card"

import { useMITApi, useTasksApi } from "@/hooks/useTasksApi"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ConfirmDragDialog } from "@/components/dashboard/ConfirmDragDialog"
import { DailyZenTip } from "@/components/dashboard/Daily-zen-tip"
import { TodayRecap } from "@/components/dashboard/Today-recap"
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay"
import { ProductTour } from "@/components/product-tour/product-tour"
import { useProductTour } from "@/hooks/use-product-tour"
import { useProductTourStore } from "@/store/product-tour-store"
import { toast } from "sonner"

interface PendingDrag {
  direction: "to-mit" | "to-braindump"
  taskTitle: string
  sourceIndex: number
}

export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    fetch("/api/auth-service/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.has_onboarded === false) {
          setShowOnboarding(true)
        }
      })
      .catch(() => {})
  }, [])

  const handleOnboardingComplete = async () => {
    await fetch("/api/auth-service/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ has_onboarded: true }),
    })
    setShowOnboarding(false)
    useProductTourStore.getState().triggerTour()
  }

  const { isActive, steps, onClose } = useProductTour()

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
      deleteTask(mit.id)
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
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 items-stretch lg:grid-cols-3">
            <div className="flex h-full flex-col gap-6">
              <div className="flex-1" data-tour="step-2">
                <ErrorBoundary name="Timer" fallback={<p className="text-sm text-muted-foreground p-4">Timer unavailable</p>}>
                  <TimerCard />
                </ErrorBoundary>
              </div>
              <div data-tour="step-5">
                <ErrorBoundary name="Progress" fallback={<p className="text-sm text-muted-foreground p-4">Progress unavailable</p>}>
                  <MatchaProgressCard />
                </ErrorBoundary>
              </div>
              <div data-tour="step-6">
                <ErrorBoundary name="Streak" fallback={<p className="text-sm text-muted-foreground p-4">Streak unavailable</p>}>
                  <StreakCard />
                </ErrorBoundary>
              </div>
            </div>

            <div className="flex h-full flex-col gap-6">
              <div className="flex-1" data-tour="step-3">
                <MITCard
                  mits={mits}
                  droppableId="mit-list"
                  onAdd={addMIT}
                  onUpdateTitle={updateTitle}
                  onMarkDone={markAsDone}
                  remainingSlots={remainingSlots}
                />
              </div>
              <div className="flex-1" data-tour="step-4">
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
            </div>

            <div className="flex h-full flex-col gap-6">
              <div className="flex-[2]" data-tour="step-9">
                <ErrorBoundary name="AI Insights" fallback={<p className="text-sm text-muted-foreground p-4">Insights unavailable</p>}>
                  <AIInsightsCard />
                </ErrorBoundary>
              </div>
              <div className="flex-1">
                <DailyZenTip />
              </div>
              <div className="flex-1" data-tour="step-8">
                <TodayRecap />
              </div>
            </div>
          </div>
        </div>
      <ConfirmDragDialog
        open={pendingDrag !== null}
        direction={pendingDrag?.direction ?? null}
        taskTitle={pendingDrag?.taskTitle ?? ""}
        onConfirm={executeDrag}
        onCancel={() => setPendingDrag(null)}
      />

      {showOnboarding && <OnboardingOverlay onComplete={handleOnboardingComplete} />}
      <ProductTour isActive={isActive} steps={steps} onClose={onClose} />
    </DragDropContext>
  )
}
