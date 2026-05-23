import { useLocalStorage } from '@/hooks/useLocalStorage'

export interface MIT {
  id: string   // change from number to string
  title: string
}

export function useMIT() {
  const [mits, setMits] = useLocalStorage<MIT[]>('zenberry_mit', [])

  const addMIT = (title: string): { success: boolean; error?: string } => {
    if (!title.trim()) return { success: false, error: 'Title cannot be empty' }
    if (mits.length >= 3) return { success: false, error: 'You can only have 3 Most Important Tasks at a time.' }
    const newMIT: MIT = {
      id: crypto.randomUUID(),   // or Date.now().toString()
      title: title.trim(),
    }
    setMits([...mits, newMIT])
    return { success: true }
  }

  const markAsDone = (id: string) => {
    setMits(mits.filter(mit => mit.id !== id))
  }

  const updateTitle = (id: string, title: string) => {
    setMits(mits.map(mit => mit.id === id ? { ...mit, title } : mit))
  }

  return { mits, addMIT, markAsDone, updateTitle, remainingSlots: 3 - mits.length }
}