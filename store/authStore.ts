import { create } from "zustand"
import { User } from "@/types"

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user, token) =>
    set({ user, token, isAuthenticated: true }),

  logout: () =>
    set({ user: null, token: null, isAuthenticated: false }),
}))