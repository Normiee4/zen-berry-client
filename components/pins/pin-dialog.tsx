"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const PASTEL_COLORS = [
  { name: "Strawberry Cream", hex: "#FFD1D1" },
  { name: "Matcha Mist", hex: "#C1E1C1" },
  { name: "Lavender Cloud", hex: "#E8D1F0" },
  { name: "Peach Sorbet", hex: "#FFE4B5" },
  { name: "Sky Frost", hex: "#B5D8E8" },
  { name: "Creamy Vanilla", hex: "#FFF1C1" },
]

interface PinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { heading: string; content: string; color: string }) => void
  onDelete?: (id: string) => void
  editPin?: {
    id: string
    heading: string
    content: string | null
    color: string
  } | null
}

export function PinDialog({ open, onOpenChange, onSave, onDelete, editPin }: PinDialogProps) {
  const [heading, setHeading] = useState(editPin?.heading ?? "")
  const [content, setContent] = useState(editPin?.content ?? "")
  const [color, setColor] = useState(editPin?.color ?? PASTEL_COLORS[0].hex)
  const [headingError, setHeadingError] = useState(false)

  const handleSave = () => {
    if (!heading.trim()) {
      setHeadingError(true)
      return
    }
    onSave({ heading: heading.trim(), content: content.trim(), color })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={editPin?.id ?? 'new'} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editPin ? "Edit Pin" : "New Pin"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Heading
            </label>
            <input
              value={heading}
              onChange={(e) => {
                setHeading(e.target.value)
                setHeadingError(false)
              }}
              placeholder="e.g. React Resources"
              className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/40 ${
                headingError
                  ? "border-red-400 focus:border-red-400"
                  : "border-border focus:border-matcha"
              }`}
              autoFocus
            />
            {headingError && (
              <p className="mt-1 text-xs text-red-400">Heading is required</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Content <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste links, notes, or anything..."
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-matcha"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PASTEL_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c.hex
                      ? "scale-110 border-foreground shadow-sm"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editPin && (
              <button
                onClick={() => {
                  onDelete?.(editPin.id)
                  onOpenChange(false)
                }}
                className="mr-auto rounded-xl px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-matcha px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-matcha-dark"
            >
              {editPin ? "Save" : "Add Pin"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
