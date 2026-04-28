import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { useState, useEffect, useCallback } from "react"
import { useFocusEffect } from "expo-router"
import { ShoppingBag } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  restaurantId: string
  items: OrderItem[]
  totalAmount: number
  deliveryFee: number
  status: string
  address: string
  paymentStatus: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#FF9800",
  confirmed: "#2196F3",
  preparing: "#9C27B0",
  on_the_way: "#00BCD4",
  delivered: "#4CAF50",
  cancelled: "#F44336",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "⏳ Pending",
  confirmed: "✅ Confirmed",
  preparing: "👨‍🍳 Preparing",
  on_the_way: "🛵 On the way",
  delivered: "🎉 Delivered",
  cancelled: "❌ Cancelled",
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { token } = useAuthStore()

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Refetch every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchOrders()
    }, [])
  )

  const onRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag size={80} color={Colors.lightGray} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Your order history will appear here
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <View key={order._id} style={styles.orderCard}>

                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[order.status] || Colors.gray }
                  ]}>
                    <Text style={styles.statusText}>
                      {STATUS_LABELS[order.status] || order.status}
                    </Text>
                  </View>
                </View>

                {/* Order Items */}
                <View style={styles.orderItems}>
                  {order.items.map((item, index) => (
                    <Text key={index} style={styles.orderItem}>
                      {item.quantity}x {item.name}
                    </Text>
                  ))}
                </View>

                {/* Order Footer */}
                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text style={styles.orderAddress} numberOfLines={1}>
                      📍 {order.address}
                    </Text>
                  </View>
                  <Text style={styles.orderTotal}>
                    ${(order.totalAmount + order.deliveryFee).toFixed(2)}
                  </Text>
                </View>

              </View>
            ))}
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    textAlign: "center",
    marginTop: 8,
  },
  ordersList: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 4,
  },
  orderItem: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  orderDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  orderAddress: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
    maxWidth: 220,
  },
  orderTotal: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
})