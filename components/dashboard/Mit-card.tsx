"use client"

import { useState } from "react"
import { CircleCheck, Plus } from 'lucide-react'

interface MIT {
  id: number
  title: string
  completed: boolean
}

export function MITCard() {
  const [mits, setMits] = useState<MIT[]>([])
  const [newMit, setNewMit] = useState("")

  const toggleMit = (id: number) => {
    setMits(mits.map((mit) => 
      mit.id === id ? { ...mit, completed: !mit.completed } : mit
    ))
  }

  const updateMitTitle = (id: number, title: string) => {
    setMits(mits.map((mit) => 
      mit.id === id ? { ...mit, title } : mit
    ))
  }

  const addMit = () => {
    if (!newMit.trim()) return
    setMits([...mits, { id: Date.now(), title: newMit, completed: false }])
    setNewMit("")
  }

  const deleteMit = (id: number) => {
    setMits(mits.filter((mit) => mit.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addMit()
    }
  }

  return (
    <div className="flex h-full flex-col rounded-3xl bg-strawberry-light/30 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-base">&#x1F3AF;</span>
        <h3 className="text-lg font-semibold text-foreground">Top 3 MIT</h3>
        <span className="text-base">&#x1F331;</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Your most important tasks today — they stay until done!
      </p>

      {/* Add MIT Input */}
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-white/70 p-3">
        <input
          type="text"
          value={newMit}
          onChange={(e) => setNewMit(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add your top priority..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        />
        <button
          onClick={addMit}
          className="flex size-7 items-center justify-center rounded-full bg-matcha text-white hover:bg-matcha/90 transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* MITs List */}
      <div className="flex flex-1 flex-col gap-3">
        {mits.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-white/30 p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">📌</span>
              <p className="text-sm font-medium text-muted-foreground">
                Add or Drag a Task in as your Top Priority
              </p>
            </div>
          </div>
        ) : (
          mits.map((mit, index) => (
            <div
              key={mit.id}
              className="flex items-center gap-3 rounded-xl bg-white/70 p-4"
            >
              <span className="flex size-6 items-center justify-center text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
              <button
                onClick={() => toggleMit(mit.id)}
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  mit.completed
                    ? "border-matcha bg-matcha"
                    : "border-muted-foreground/30 bg-white"
                }`}
              >
                {mit.completed && (
                  <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            
              <input
                type="text"
                value={mit.title}
                onChange={(e) => updateMitTitle(mit.id, e.target.value)}
                placeholder="Add a task..."
                className={`flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 ${
                  mit.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              />
              <button 
                onClick={() => deleteMit(mit.id)}
                className="flex size-10 p-2 shrink-0 items-center justify-center rounded-full transition-colors text-matcha cursor-pointer hover:bg-gray-200"
              >
                <CircleCheck />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}