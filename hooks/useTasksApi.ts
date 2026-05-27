"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { toast } from "sonner"

export interface Task {
  id: string
  title: string
  completed: boolean
  type: "mit" | "braindump"
}

interface UseTasksOptions {
  type?: "mit" | "braindump"
}

async function fetchTasks(type?: string): Promise<{ tasks: Task[]; mitCount: number; mitLimit: number }> {
  const params = new URLSearchParams()
  if (type) params.set("type", type)
  params.set("completed", "false")

  const res = await fetch(`/api/tasks?${params.toString()}`)
  if (!res.ok) throw new Error("Failed to fetch tasks")
  return res.json()
}

export function useTasksApi(options: UseTasksOptions = {}) {
  const { type } = options
  const queryClient = useQueryClient()
  const queryKey = ["tasks", type]

  const { data: apiData, isLoading: isApiLoading, error: apiError } = useQuery({
    queryKey,
    queryFn: () => fetchTasks(type),
    staleTime: 30 * 1000,
    retry: 1,
  })

  const tasks = apiData && !apiError
    ? apiData.tasks.map((t) => ({
        id: String(t.id),
        title: t.title,
        completed: t.completed,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: ((t as any).isMIT ? "mit" : "braindump") as "mit" | "braindump",
      }))
    : []

  const addTask = useCallback(async (task: Omit<Task, "id">) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, type: task.type }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to add task")
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add task")
    }
  }, [queryClient])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })
      if (!res.ok) throw new Error("Failed to update")
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update task")
    }
  }, [queryClient])

  const deleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete task")
    }
  }, [queryClient])

  return {
    tasks,
    isLoading: isApiLoading,
    addTask,
    updateTask,
    deleteTask,
  }
}

export function useMITApi() {
  const queryClient = useQueryClient()

  const { data: apiData, isLoading: isApiLoading, error: apiError } = useQuery({
    queryKey: ["tasks", "mit"],
    queryFn: () => fetchTasks("mit"),
    staleTime: 30 * 1000,
  })

  const mits = apiData && !apiError
    ? apiData.tasks.map((t: { id: string | number; title: string }) => ({ id: String(t.id), title: t.title }))
    : []

  const addMIT = useCallback(async (title: string): Promise<{ success: boolean; error?: string }> => {
    if (!title.trim()) return { success: false, error: "Title cannot be empty" }

    if (mits.length >= 3) return { success: false, error: "You can only have 3 Most Important Tasks at a time." }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), type: "mit" }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to add MIT")
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      return { success: true }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to add"
      toast.error(msg)
      return { success: false, error: msg }
    }
  }, [mits.length, queryClient])

  const markAsDone = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: true }),
      })
      if (!res.ok) throw new Error("Failed to complete")
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] })
      queryClient.invalidateQueries({ queryKey: ["analytics-milestones"] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to complete task")
    }
  }, [queryClient])

  const updateTitle = useCallback(async (id: string, title: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
      })
      if (!res.ok) throw new Error("Failed to update")
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update title")
    }
  }, [queryClient])

  return {
    mits,
    addMIT,
    markAsDone,
    updateTitle,
    remainingSlots: 3 - mits.length,
    isLoading: isApiLoading,
  }
}
