"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useCallback, useEffect } from "react"

export interface Task {
  id: string
  title: string
  completed: boolean
  type: "mit" | "braindump"
}

interface UseTasksOptions {
  type?: "mit" | "braindump"
}

function createId(): string {
  return crypto.randomUUID()
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

  const [localTasks, setLocalTasks] = useLocalStorage<Task[]>("zenberry_tasks", [])

  const apiEnabled = true

  const { data: apiData, isLoading: isApiLoading, error: apiError } = useQuery({
    queryKey,
    queryFn: () => fetchTasks(type),
    enabled: apiEnabled,
    staleTime: 30 * 1000,
    retry: 1,
  })

  const apiTasks = apiEnabled && apiData && !apiError
    ? apiData.tasks.map((t) => ({
        id: String(t.id),
        title: t.title,
        completed: t.completed,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: ((t as any).isMIT ? "mit" : "braindump") as "mit" | "braindump",
      }))
    : []

  const localFiltered = localTasks.filter((t) => !type || t.type === type)

  const tasks = apiTasks.length > 0
    ? [...apiTasks, ...localFiltered.filter((lt) => !apiTasks.some((at) => at.id === lt.id))]
    : localFiltered

  const addTask = useCallback(async (task: Omit<Task, "id">) => {
    const newTask: Task = { ...task, id: createId() }

    if (apiEnabled) {
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
        return
      } catch (e) {
        console.warn("API failed, using localStorage:", e)
      }
    }

    setLocalTasks((prev) => [...prev, newTask])
  }, [apiEnabled, queryClient, setLocalTasks])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (apiEnabled) {
      try {
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...updates }),
        })
        if (!res.ok) throw new Error("Failed to update")
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
        return
      } catch (e) {
        console.warn("API failed, using localStorage:", e)
      }
    }

    setLocalTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [apiEnabled, queryClient, setLocalTasks])

  const deleteTask = useCallback(async (id: string) => {
    if (apiEnabled) {
      try {
        const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Failed to delete")
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
        return
      } catch (e) {
        console.warn("API failed, using localStorage:", e)
      }
    }

    setLocalTasks((prev) => prev.filter((t) => t.id !== id))
  }, [apiEnabled, queryClient, setLocalTasks])

  return {
    tasks,
    isLoading: apiEnabled ? isApiLoading : false,
    addTask,
    updateTask,
    deleteTask,
    isApiEnabled: apiEnabled,
  }
}

export function useMITApi() {
  const [localMits, setLocalMits] = useLocalStorage<{ id: string; title: string }[]>("zenberry_mit", [])
  const queryClient = useQueryClient()

  const apiEnabled = true

  const { data: apiData, isLoading: isApiLoading, error: apiError } = useQuery({
    queryKey: ["tasks", "mit"],
    queryFn: () => fetchTasks("mit"),
    enabled: apiEnabled,
    staleTime: 30 * 1000,
  })

  useEffect(() => {
    if (apiData && apiData.tasks && !apiError) {
      const apiIds = new Set(apiData.tasks.map((t) => String(t.id)))
      setLocalMits((prev) => {
        const unsynced = prev.filter((m) => !apiIds.has(m.id))
        return unsynced.length !== prev.length ? unsynced : prev
      })
    }
  }, [apiData, apiError, setLocalMits])

  const mits = apiEnabled && apiData && !apiError
    ? [
        ...apiData.tasks.map((t: { id: string | number; title: string }) => ({ id: String(t.id), title: t.title })),
        ...localMits.filter((lt) => !apiData.tasks.some((at: { id: string | number }) => String(at.id) === lt.id)),
      ]
    : localMits

  const addMIT = useCallback(async (title: string): Promise<{ success: boolean; error?: string }> => {
    if (!title.trim()) return { success: false, error: "Title cannot be empty" }

    const currentCount = mits.length
    if (currentCount >= 3) return { success: false, error: "You can only have 3 Most Important Tasks at a time." }

    const newMIT = { id: createId(), title: title.trim() }

    if (apiEnabled) {
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
        const errorMessage = e instanceof Error ? e.message : "Failed to add"
        if (errorMessage.includes("3 Most Important Tasks")) {
          return { success: false, error: errorMessage }
        }
        console.warn("API failed, using localStorage:", e)
      }
    }

    setLocalMits((prev) => [...prev, newMIT])
    return { success: true }
  }, [apiEnabled, mits.length, queryClient, setLocalMits])

  const markAsDone = useCallback(async (id: string) => {
    if (apiEnabled) {
      try {
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, completed: true }),
        })
        if (!res.ok) throw new Error("Failed to complete")
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
        return
      } catch (e) {
        console.warn("API failed, using localStorage:", e)
      }
    }

    setLocalMits((prev) => prev.filter((m) => m.id !== id))
  }, [apiEnabled, queryClient, setLocalMits])

  const updateTitle = useCallback(async (id: string, title: string) => {
    if (apiEnabled) {
      try {
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, title }),
        })
        if (!res.ok) throw new Error("Failed to update")
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
        return
      } catch (e) {
        console.warn("API failed, using localStorage:", e)
      }
    }

    setLocalMits((prev) => prev.map((m) => (m.id === id ? { ...m, title } : m)))
  }, [apiEnabled, queryClient, setLocalMits])

  return {
    mits,
    addMIT,
    markAsDone,
    updateTitle,
    remainingSlots: 3 - mits.length,
    isLoading: apiEnabled ? isApiLoading : false,
    isApiEnabled: apiEnabled,
  }
}