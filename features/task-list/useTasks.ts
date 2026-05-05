import { useLocalStorage } from '@/hooks/useLocalStorage'

export interface Task {
  id: string
  title: string
  completed: boolean
  type: 'mit' | 'braindump'
}

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('zenberry_tasks', [])

  // ✅ Now accepts a task without an id
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(), // or Date.now().toString()
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id))

  return { tasks, addTask, updateTask, deleteTask }
}