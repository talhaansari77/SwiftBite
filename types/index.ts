export interface User {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  avatar?: string
  role: "customer" | "restaurant" | "driver"
}

export interface Restaurant {
  _id: string
  name: string
  description: string
  image: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: number
  minimumOrder: number
  isOpen: boolean
  address: string
}

export interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  restaurantId: string
  isAvailable: boolean
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
}

export interface Order {
  _id: string
  customerId: string
  restaurantId: string
  items: CartItem[]
  totalAmount: number
  deliveryFee: number
  status: "pending" | "confirmed" | "preparing" | "on_the_way" | "delivered" | "cancelled"
  address: string
  paymentStatus: "pending" | "paid" | "failed"
  createdAt: string
}