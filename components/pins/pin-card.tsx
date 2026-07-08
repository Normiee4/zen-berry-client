"use client"

import { Pencil, Trash2 } from "lucide-react"

interface PinCardProps {
  id: string
  heading: string
  content: string | null
  color: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const urlRegex = /(https?:\/\/[^\s]+)/g

function renderContent(text: string) {
  return text.split(urlRegex).map((part, i) =>
    urlRegex.test(part)
      ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all underline decoration-1 underline-offset-2 hover:opacity-80"
        >
          {part}
        </a>
      )
      : <span key={i}>{part}</span>
  )
}

export function PinCard({ id, heading, content, color, onEdit, onDelete }: PinCardProps) {
  return (
    <div
      className="group relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-black/5 p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{ backgroundColor: color }}
      onClick={() => onEdit(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onEdit(id) }}
    >
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(id) }}
          className="flex items-center justify-center rounded-lg bg-card/60 p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          aria-label="Edit pin"
        >
          <Pencil className="size-3.5" strokeWidth={1.5} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(id) }}
          className="flex items-center justify-center rounded-lg bg-card/60 p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-red-500"
          aria-label="Delete pin"
        >
          <Trash2 className="size-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <h3 className="pr-14 text-sm font-semibold text-foreground">{heading}</h3>

      {content && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {renderContent(content)}
        </p>
      )}
    </div>
  )
}
