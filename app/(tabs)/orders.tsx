import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native"
import { useState, useCallback } from "react"
import { router, useFocusEffect } from "expo-router"
import { Search, Bell } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { useCartStore } from "@/store/cartStore"
import { API_URL } from "@/constants"

interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Order {
  _id: string
  restaurantId: string
  items: OrderItem[]
  totalAmount: number
  deliveryFee: number
  status: string
  address: string
  paymentMethod: string
  createdAt: string
}

const TABS = ["All Orders", "Ongoing", "Completed", "Cancelled"]

const ONGOING_STATUSES = ["pending", "confirmed", "preparing", "on_the_way"]
const COMPLETED_STATUSES = ["delivered"]
const CANCELLED_STATUSES = ["cancelled"]

const PROGRESS_STEPS = [
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "on_the_way", label: "On the way" },
  { key: "delivered", label: "Delivered" },
]

const STATUS_COLORS: Record<string, string> = {
  pending: "#FF9800",
  confirmed: "#2196F3",
  preparing: "#9C27B0",
  on_the_way: "#00BCD4",
  delivered: "#4CAF50",
  cancelled: "#F44336",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  preparing: "Preparing your order",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("All Orders")
  const { token } = useAuthStore()
  const { addItem, clearCart } = useCartStore()

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setOrders(data.orders || [])
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

  const getFilteredOrders = () => {
    switch (activeTab) {
      case "Ongoing":
        return orders.filter((o) => ONGOING_STATUSES.includes(o.status))
      case "Completed":
        return orders.filter((o) => COMPLETED_STATUSES.includes(o.status))
      case "Cancelled":
        return orders.filter((o) => CANCELLED_STATUSES.includes(o.status))
      default:
        return orders
    }
  }

  const getStepIndex = (status: string) => {
    return PROGRESS_STEPS.findIndex((s) => s.key === status)
  }

  const handleReorder = (order: Order) => {
    clearCart()
    order.items.forEach((item) => {
      addItem(
        {
          _id: item.menuItemId,
          name: item.name,
          price: item.price,
          description: "",
          image: item.image || "",
          category: "",
          restaurantId: order.restaurantId,
          isAvailable: true,
        },
        order.restaurantId
      )
    })
    router.push("/(tabs)/cart")
  }

  const filteredOrders = getFilteredOrders()

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
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={()=>router.push('/search')} style={styles.iconButton}>
            <Search size={20} color={Colors.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color={Colors.black} />
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.tabBorder} />
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
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🛵</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              Your order history will appear here
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(tabs)/home")}
            >
              <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {filteredOrders.map((order) => {
              const isOngoing = ONGOING_STATUSES.includes(order.status)
              const isCompleted = order.status === "delivered"
              const isCancelled = order.status === "cancelled"
              const stepIndex = getStepIndex(order.status)

              return (
                <TouchableOpacity
                  key={order._id}
                  style={styles.orderCard}
                  onPress={() => router.push(`/order/${order._id}`)}
                  activeOpacity={0.9}
                >
                  {/* Status Label */}
                  <View style={styles.cardHeader}>
                    <Text style={[
                      styles.statusLabel,
                      { color: STATUS_COLORS[order.status] }
                    ]}>
                      {isOngoing ? "Ongoing" :
                       isCompleted ? "Completed" : "Cancelled"}
                    </Text>
                    <Text style={styles.orderIdText}>
                      Order #{order._id.slice(-6).toUpperCase()} →
                    </Text>
                  </View>

                  {/* Restaurant Info */}
                  <View style={styles.restaurantRow}>
                    <View style={styles.restaurantImage}>
                      <Text style={styles.restaurantEmoji}>🍔</Text>
                    </View>

                    <View style={styles.orderInfo}>
                      <Text style={styles.restaurantName}>
                        Restaurant #{order.restaurantId.slice(-4).toUpperCase()}
                      </Text>
                      <Text style={styles.orderMeta}>
                        {order.items.length} {order.items.length === 1 ? "Item" : "Items"} • ${(order.totalAmount + order.deliveryFee).toFixed(2)}
                      </Text>
                      <Text style={[
                        styles.statusText,
                        { color: STATUS_COLORS[order.status] }
                      ]}>
                        {isCompleted ? "✅" : isCancelled ? "❌" : "🕐"}{" "}
                        {isCompleted
                          ? `Delivered on ${new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                          : isCancelled
                          ? `Cancelled on ${new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                          : STATUS_LABELS[order.status]}
                      </Text>
                      {isOngoing && (
                        <Text style={styles.arrivalText}>
                          ⏰ Arriving in 25-30 min
                        </Text>
                      )}
                    </View>

                    {/* Driver illustration for ongoing */}
                    {isOngoing && (
                      <Text style={styles.driverEmoji}>🛵</Text>
                    )}

                    {/* Reorder button for completed */}
                    {isCompleted && (
                      <TouchableOpacity
                        style={styles.reorderButton}
                        onPress={(e) => {
                          e.stopPropagation()
                          handleReorder(order)
                        }}
                      >
                        <Text style={styles.reorderText}>Reorder</Text>
                      </TouchableOpacity>
                    )}

                    {/* View Details for cancelled */}
                    {isCancelled && (
                      <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() => router.push(`/order/${order._id}`)}
                      >
                        <Text style={styles.viewDetailsText}>View Details</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Progress Tracker for ongoing */}
                  {isOngoing && (
                    <View style={styles.progressContainer}>
                      {PROGRESS_STEPS.map((step, index) => {
                        const isCompleted = index <= stepIndex
                        const isActive = index === stepIndex
                        return (
                          <View key={step.key} style={styles.progressStep}>
                            <View style={styles.progressStepTop}>
                              <View style={[
                                styles.progressDot,
                                isCompleted && styles.progressDotCompleted,
                                isActive && styles.progressDotActive,
                              ]}>
                                {isCompleted && !isActive && (
                                  <Text style={styles.progressCheck}>✓</Text>
                                )}
                                {isActive && (
                                  <View style={styles.progressDotInner} />
                                )}
                              </View>
                              {index < PROGRESS_STEPS.length - 1 && (
                                <View style={[
                                  styles.progressLine,
                                  index < stepIndex && styles.progressLineCompleted,
                                ]} />
                              )}
                            </View>
                            <Text style={[
                              styles.progressLabel,
                              isCompleted && styles.progressLabelCompleted,
                            ]}>
                              {step.label}
                            </Text>
                          </View>
                        )
                      })}
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
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
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  notifBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: "Poppins-Bold",
  },
  tabsContainer: {
    backgroundColor: Colors.white,
    position: "relative",
  },
  tabs: {
    paddingHorizontal: 20,
    gap: 24,
  },
  tab: {
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.gray,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  tabBorder: {
    height: 1,
    backgroundColor: Colors.border,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  browseButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
  },
  ordersList: {
    padding: 16,
    gap: 14,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
  },
  orderIdText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: Colors.gray,
  },
  restaurantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  restaurantImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  restaurantEmoji: {
    fontSize: 32,
  },
  orderInfo: {
    flex: 1,
    gap: 4,
  },
  restaurantName: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  orderMeta: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },
  arrivalText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  driverEmoji: {
    fontSize: 36,
  },
  reorderButton: {
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  reorderText: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#4CAF50",
  },
  viewDetailsButton: {
    backgroundColor: "#FFE5E5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  viewDetailsText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: Colors.error,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  progressStep: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  progressStepTop: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    zIndex: 1,
  },
  progressDotCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  progressDotActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  progressDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  progressCheck: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
  },
  progressLineCompleted: {
    backgroundColor: Colors.primary,
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    textAlign: "center",
  },
  progressLabelCompleted: {
    color: Colors.primary,
    fontFamily: "Poppins-SemiBold",
  },
})