import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native"
import { useState, useCallback } from "react"
import { useFocusEffect } from "expo-router"
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
  customerId: string
  items: OrderItem[]
  totalAmount: number
  deliveryFee: number
  status: string
  address: string
  paymentMethod: string
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

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "on_the_way",
  on_the_way: "delivered",
}

const NEXT_STATUS_LABEL: Record<string, string> = {
  pending: "✅ Confirm Order",
  confirmed: "👨‍🍳 Start Preparing",
  preparing: "🛵 Out for Delivery",
  on_the_way: "🎉 Mark Delivered",
}

export default function OwnerDashboardScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const { token, user } = useAuthStore()

  const fetchOrders = async () => {
    try {
      // Get restaurant owned by this user
      const restRes = await fetch(`${API_URL}/restaurants?ownerId=${user?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const restData = await restRes.json()

      if (!restData.restaurants?.length) {
        setLoading(false)
        setRefreshing(false)
        return
      }

      const restaurantId = restData.restaurants[0]._id

      // Get orders for this restaurant
      const orderRes = await fetch(
        `${API_URL}/orders/restaurant/${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const orderData = await orderRes.json()
      setOrders(orderData.orders || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchOrders()
    }, [])
  )

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId)
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? { ...order, status: newStatus }
              : order
          )
        )
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update order status")
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes Cancel",
          style: "destructive",
          onPress: () => handleUpdateStatus(orderId, "cancelled"),
        },
      ]
    )
  }

  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  )
  const completedOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status)
  )

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
        <View>
          <Text style={styles.headerTitle}>Dashboard 🍔</Text>
          <Text style={styles.headerSubtitle}>
            {activeOrders.length} active orders
          </Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true)
            fetchOrders()
          }} />
        }
      >

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🔥 Active Orders ({activeOrders.length})
            </Text>
            {activeOrders.map((order) => (
              <View key={order._id} style={styles.orderCard}>

                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>
                    #{order._id.slice(-6).toUpperCase()}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[order.status] }
                  ]}>
                    <Text style={styles.statusText}>
                      {order.status.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Order Time */}
                <Text style={styles.orderTime}>
                  🕐 {new Date(order.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>

                {/* Order Items */}
                <View style={styles.itemsList}>
                  {order.items.map((item, index) => (
                    <Text key={index} style={styles.itemText}>
                      {item.quantity}x {item.name}
                    </Text>
                  ))}
                </View>

                {/* Address */}
                <Text style={styles.addressText} numberOfLines={1}>
                  📍 {order.address}
                </Text>

                {/* Payment */}
                <Text style={styles.paymentText}>
                  💵 {order.paymentMethod === "cash" ? "Cash on Delivery" : "Online"} —
                  ${(order.totalAmount + order.deliveryFee).toFixed(2)}
                </Text>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {NEXT_STATUS[order.status] && (
                    <TouchableOpacity
                      style={styles.nextStatusButton}
                      onPress={() => handleUpdateStatus(
                        order._id,
                        NEXT_STATUS[order.status]
                      )}
                      disabled={updatingOrder === order._id}
                    >
                      {updatingOrder === order._id ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                      ) : (
                        <Text style={styles.nextStatusText}>
                          {NEXT_STATUS_LABEL[order.status]}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {order.status === "pending" && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelOrder(order._id)}
                    >
                      <Text style={styles.cancelButtonText}>❌ Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>

              </View>
            ))}
          </View>
        )}

        {/* Empty active orders */}
        {activeOrders.length === 0 && (
          <View style={styles.emptyActive}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyText}>No active orders right now</Text>
            <Text style={styles.emptySubtext}>
              Pull down to refresh
            </Text>
          </View>
        )}

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ✅ Completed Orders ({completedOrders.length})
            </Text>
            {completedOrders.map((order) => (
              <View key={order._id} style={[styles.orderCard, styles.completedCard]}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>
                    #{order._id.slice(-6).toUpperCase()}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[order.status] }
                  ]}>
                    <Text style={styles.statusText}>
                      {order.status.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemText}>
                  {order.items.length} items — $
                  {(order.totalAmount + order.deliveryFee).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  headerStats: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  completedCard: {
    borderLeftColor: Colors.gray,
    opacity: 0.8,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
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
  orderTime: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginBottom: 8,
  },
  itemsList: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 4,
  },
  itemText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  addressText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  nextStatusButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  nextStatusText: {
    color: Colors.white,
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
  },
  cancelButton: {
    backgroundColor: "#FFE5E5",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: Colors.error,
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
  },
  emptyActive: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 4,
  },
})