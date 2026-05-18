import { create } from "zustand"
import { User } from "@/types"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User, token: string) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  loadStoredAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: async (user, token) => {
    // Persist to AsyncStorage whenever user logs in
    await AsyncStorage.setItem("authToken", token)
    await AsyncStorage.setItem("authUser", JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  logout: async () => {
    // Clear AsyncStorage on logout
    await AsyncStorage.removeItem("authToken")
    await AsyncStorage.removeItem("authUser")
    set({ user: null, token: null, isAuthenticated: false })
  },

  loadStoredAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("authToken")
      const userStr = await AsyncStorage.getItem("authUser")

      if (token && userStr) {
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true })
      }
    } catch (error) {
      console.error("Failed to load stored auth:", error)
    }
  },
}))