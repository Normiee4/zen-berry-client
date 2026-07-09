import { create } from "zustand"

interface ProductTourStore {
  tourTriggered: boolean
  triggerTour: () => void
  clearTourTrigger: () => void
}

export const useProductTourStore = create<ProductTourStore>((set) => ({
  tourTriggered: false,
  triggerTour: () => set({ tourTriggered: true }),
  clearTourTrigger: () => set({ tourTriggered: false }),
}))
