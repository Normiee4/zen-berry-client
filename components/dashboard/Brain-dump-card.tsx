"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Task {
  id: number
  title: string
  completed: boolean
}

export function BrainDumpCard() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Reply to emails", completed: false },
    { id: 2, title: "Buy groceries", completed: false },
    { id: 3, title: "Read chapter 5", completed: true },
    { id: 4, title: "Schedule dentist appointment", completed: false },
    { id: 5, title: "Update portfolio website", completed: false },
  ])
  const [newTask, setNewTask] = useState("")

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }])
    setNewTask("")
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask()
    }
  }

  return (
    <div className="flex h-full flex-col rounded-3xl bg-strawberry-light/30 p-6">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">&#x1F9E0;</span>
        <h3 className="text-lg font-semibold text-foreground">Brain Dump</h3>
        <span className="text-base">&#x1F331;</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Capture everything — promote to MIT when ready
      </p>

      {/* Input */}
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-white/70 p-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Quick thought..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        />
        <button
          onClick={addTask}
          className="flex size-7 items-center justify-center rounded-full bg-matcha text-white hover:bg-matcha/90 transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* Task List */}
      <div className="h-96 flex flex-col">
        <ScrollArea className="flex flex-1 flex-col overflow-hidden">
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
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                    task.completed
                      ? "bg-matcha-light/40"
                      : "bg-white/70"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      task.completed
                        ? "border-matcha bg-matcha"
                        : "border-muted-foreground/30 bg-white"
                    }`}
                  >
                    {task.completed && (
                      <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                    onClick={() => deleteTask(task.id)}
                    className="flex size-10 p-2 shrink-0 items-center justify-center rounded-full transition-colors text-red-400 cursor-pointer hover:bg-red-100"
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
            </div>
          )}
          <ScrollBar orientation="vertical" className="bg-matcha/30 hover:bg-matcha/60" />
        </ScrollArea>
      </div>
    </div>
  )
}