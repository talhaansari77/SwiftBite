import { create } from "zustand"
import { User } from "@/types"

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User, token: string) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user, token) =>
    set({ user, token, isAuthenticated: true }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }),
}))