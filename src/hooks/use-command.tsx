import { create } from 'zustand'

type State = {
  commandKOpen: boolean
}

type Actions = {
  setCommandKOpen: (open: boolean) => void
}

export const useCommandK = create<State & Actions>((set) => ({
  commandKOpen: false,
  setCommandKOpen: (open: boolean) => set({ commandKOpen: open }),
}))
