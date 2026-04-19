"use client"


import { useState } from "react"
import { CircleCheck } from 'lucide-react';


interface MIT {
  id: number
  title: string
  completed: boolean
}

export function MITCard() {
  const [mits, setMits] = useState<MIT[]>([
    { id: 1, title: "Finish project proposal", completed: false },
    { id: 2, title: "Review design mockups", completed: false },
    { id: 3, title: "", completed: false },
  ])

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

      {/* Tasks */}
      <div className="flex flex-1 flex-col gap-3">
        {mits.map((mit, index) => (
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
            <button className="flex size-10 p-2 shrink-0 items-center justify-center rounded-full transition-colors text-matcha cursor-pointer hover:bg-gray-200">
              <CircleCheck/>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
