import { create } from 'zustand'

type State = {
  chatOpen: string
}

type Actions = {
  setChatOpen: (open: string) => void
}

export const useChat = create<State & Actions>((set) => ({
  chatOpen: '',
  setChatOpen: (open: string) => set({ chatOpen: open }),
}))
