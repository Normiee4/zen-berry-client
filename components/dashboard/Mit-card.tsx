"use client";

import { useState } from "react";
import { CircleCheck, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner"
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { DnDWrapper } from "@/components/DnDWrapper";

interface MIT {
  id: string;
  title: string;
}

interface MITCardProps {
  mits: MIT[];
  droppableId: string;
  onAdd: (title: string) => { success?: boolean; error?: string } | void | Promise<{ success?: boolean; error?: string }>;
  onUpdateTitle: (id: string, title: string) => void;
  onMarkDone: (id: string) => void;
  remainingSlots: number;
}

function StaticMITList({
  mits,
  onUpdateTitle,
  onMarkDone,
}: {
  mits: MIT[]
  onUpdateTitle: (id: string, title: string) => void
  onMarkDone: (id: string) => void
}) {
  if (mits.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-card/30 p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-3xl">📌</span>
          <p className="text-sm font-medium text-muted-foreground">
            Add your top priorities here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {mits.map((mit, index) => (
        <div
          key={mit.id}
          className="flex items-center gap-3 rounded-xl p-4 bg-card/70"
        >
          <span className="flex size-6 items-center justify-center text-sm font-medium text-muted-foreground">
            {index + 1}
          </span>
          <input
            type="text"
            value={mit.title}
            onChange={(e) => onUpdateTitle(mit.id, e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-foreground"
          />
                      <button
                        onClick={() => { onMarkDone(mit.id); toast.success("MIT completed!") }}
                        className="flex size-10 p-2 shrink-0 items-center justify-center rounded-full transition-colors text-matcha cursor-pointer hover:bg-gray-200"
                        title="Mark as done"
                      >
                        <CircleCheck />
                      </button>
        </div>
      ))}
    </div>
  )
}

export function MITCard({
  mits,
  droppableId,
  onAdd,
  onUpdateTitle,
  onMarkDone,
  remainingSlots,
}: MITCardProps) {
  const [newMit, setNewMit] = useState("");
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newMit.trim() || isAdding) return;
    setIsAdding(true);
    const result = onAdd(newMit);
    const resolved = result instanceof Promise ? await result : result;
    setIsAdding(false);
    if (resolved && !resolved.success) {
      setError(resolved.error || "Failed to add");
      toast.error(resolved.error || "Failed to add");
    } else {
      setNewMit("");
      setError("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="flex h-full flex-col rounded-3xl bg-strawberry-light/30 p-6 border border-matcha-dark/20">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-base">🎯</span>
        <h3 className="text-lg font-semibold text-foreground">Top 3 MIT</h3>
        <span className="text-base">🌱</span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Your most important tasks today — they stay until done! ({remainingSlots} slot{remainingSlots !== 1 ? "s" : ""} left)
      </p>

      {/* Add MIT Input */}
      <div className="mb-4">
        <div className="flex items-center gap-2 rounded-xl bg-card/70 p-3">
          <input
            type="text"
            value={newMit}
            onChange={(e) => setNewMit(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Add your top priority..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="flex size-7 items-center justify-center rounded-full bg-matcha text-white hover:bg-matcha/90 disabled:opacity-50 transition-colors"
          >
            {isAdding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      {/* MIT List */}
      <DnDWrapper
        fallback={
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            <StaticMITList
              mits={mits}
              onUpdateTitle={onUpdateTitle}
              onMarkDone={onMarkDone}
            />
          </div>
        }
      >
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-1 flex-col gap-3 overflow-y-auto"
            >
              {mits.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-card/30 p-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-3xl">📌</span>
                    <p className="text-sm font-medium text-muted-foreground">
                      Add your top priorities here.
                    </p>
                  </div>
                </div>
              ) : (
                mits.map((mit, index) => (
                  <Draggable key={mit.id} draggableId={mit.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center gap-3 rounded-xl p-4 ${
                          snapshot.isDragging ? "bg-matcha-light/80 shadow-lg" : "bg-card/70"
                        }`}
                      >
                        <span className="flex size-6 items-center justify-center text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={mit.title}
                          onChange={(e) => onUpdateTitle(mit.id, e.target.value)}
                          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 text-foreground"
                        />
          <button
            onClick={() => { onMarkDone(mit.id); toast.success("MIT completed!") }}
            className="flex size-10 p-2 shrink-0 items-center justify-center rounded-full transition-colors text-matcha cursor-pointer hover:bg-gray-200"
            title="Mark as done"
          >
            <CircleCheck />
          </button>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DnDWrapper>
    </div>
  );
}