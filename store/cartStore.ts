import { create } from "zustand"
import { CartItem, MenuItem } from "@/types"

interface CartStore {
  items: CartItem[]
  restaurantId: string | null
  addItem: (item: MenuItem, restaurantId: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,

  addItem: (menuItem, restaurantId) => {
    const { items, restaurantId: currentRestaurantId } = get()

    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      set({ items: [{ menuItem, quantity: 1 }], restaurantId })
      return
    }

    const existing = items.find((i) => i.menuItem._id === menuItem._id)
    if (existing) {
      set({
        items: items.map((i) =>
          i.menuItem._id === menuItem._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      })
    } else {
      set({ items: [...items, { menuItem, quantity: 1 }], restaurantId })
    }
  },

  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.menuItem._id !== itemId),
    })),

  updateQuantity: (itemId, quantity) =>
    set((state) => ({
      items:
        quantity === 0
          ? state.items.filter((i) => i.menuItem._id !== itemId)
          : state.items.map((i) =>
              i.menuItem._id === itemId ? { ...i, quantity } : i
            ),
    })),

  clearCart: () => set({ items: [], restaurantId: null }),

  getTotalPrice: () =>
    get().items.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    ),

  getTotalItems: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),
}))