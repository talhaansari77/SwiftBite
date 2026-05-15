export interface IAddress {
  _id?: string
  label: string
  address: string
  isDefault: boolean
}

export interface User {
  _id: string
  name: string
  email: string
  phone: string
  addresses: IAddress[]
  avatar?: string
  role: string
  favourites: string[]
  walletBalance: number
  foodiePoints: number
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
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed"
  createdAt: string
}