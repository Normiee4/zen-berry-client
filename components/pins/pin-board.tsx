"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { PinCard } from "@/components/pins/pin-card"
import { PinDialog } from "@/components/pins/pin-dialog"
import type { FormattedPin } from "@/app/api/pins/service"

export function PinBoard() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editPin, setEditPin] = useState<FormattedPin | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["pins"],
    queryFn: async () => {
      const res = await fetch("/api/pins")
      if (!res.ok) throw new Error("Failed to fetch pins")
      const json = await res.json()
      return json.pins as FormattedPin[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (pinData: { heading: string; content: string; color: string }) => {
      const res = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pinData),
      })
      if (!res.ok) throw new Error("Failed to create pin")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins"] })
      toast.success("Pin added!")
    },
    onError: () => toast.error("Failed to add pin"),
  })

  const updateMutation = useMutation({
    mutationFn: async (pinData: { id: string; heading: string; content: string; color: string }) => {
      const res = await fetch("/api/pins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pinData),
      })
      if (!res.ok) throw new Error("Failed to update pin")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins"] })
      toast.success("Pin updated!")
    },
    onError: () => toast.error("Failed to update pin"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pins?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete pin")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins"] })
      toast.success("Pin deleted")
    },
    onError: () => toast.error("Failed to delete pin"),
  })

  const handleSave = (data: { heading: string; content: string; color: string }) => {
    if (editPin) {
      updateMutation.mutate({ ...data, id: editPin.id })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (id: string) => {
    const pin = data?.find((p) => p.id === id)
    if (pin) {
      setEditPin(pin)
      setDialogOpen(true)
    }
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const openCreate = () => {
    setEditPin(null)
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-4 border-strawberry/30 border-t-matcha" />
      </div>
    )
  }

  const pins = data ?? []
  const isEmpty = pins.length === 0

  return (
    <>
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="rounded-full bg-strawberry/20 p-6">
            <Plus className="size-10 text-strawberry" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-muted-foreground">No pins yet</p>
          <button
            onClick={openCreate}
            className="rounded-xl bg-matcha px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-matcha/25 transition-colors hover:bg-matcha-dark"
          >
            Add your first pin
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pins.map((pin) => (
            <PinCard
              key={pin.id}
              id={pin.id}
              heading={pin.heading}
              content={pin.content}
              color={pin.color}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <button
        onClick={openCreate}
        className="fixed bottom-8 right-8 z-20 flex size-14 items-center justify-center rounded-full bg-matcha text-white shadow-lg shadow-matcha/30 transition-all hover:scale-105 hover:bg-matcha-dark"
      >
        <Plus className="size-6" strokeWidth={2} />
      </button>

      <PinDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditPin(null)
        }}
        onSave={handleSave}
        onDelete={handleDelete}
        editPin={editPin ? { id: editPin.id, heading: editPin.heading, content: editPin.content, color: editPin.color } : null}
      />
    </>
  )
}
