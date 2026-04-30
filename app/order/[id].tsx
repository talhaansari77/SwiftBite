import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import { useState, useEffect } from "react"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", emoji: "📋" },
  { key: "confirmed", label: "Confirmed", emoji: "✅" },
  { key: "preparing", label: "Preparing", emoji: "👨‍🍳" },
  { key: "on_the_way", label: "On the way", emoji: "🛵" },
  { key: "delivered", label: "Delivered", emoji: "🎉" },
]

const STATUS_COLORS: Record<string, string> = {
  pending: "#FF9800",
  confirmed: "#2196F3",
  preparing: "#9C27B0",
  on_the_way: "#00BCD4",
  delivered: "#4CAF50",
  cancelled: "#F44336",
}

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
  paymentMethod: string
  createdAt: string
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams()
  const { token } = useAuthStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error("Error fetching order:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIndex = (status: string) => {
    return STATUS_STEPS.findIndex((s) => s.key === status)
  }

  if (loading || !order) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderText}>Loading order...</Text>
      </View>
    )
  }

  const statusIndex = getStatusIndex(order.status)

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Order ID & Status */}
        <View style={styles.statusCard}>
          <Text style={styles.orderId}>
            Order #{order._id.slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[order.status] || Colors.gray }
          ]}>
            <Text style={styles.statusText}>
              {order.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Progress Tracker */}
        {order.status !== "cancelled" && (
          <View style={styles.progressCard}>
            <Text style={styles.sectionTitle}>Order Progress</Text>
            {STATUS_STEPS.map((step, index) => (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepDot,
                    index <= statusIndex
                      ? { backgroundColor: Colors.primary }
                      : { backgroundColor: Colors.lightGray }
                  ]}>
                    <Text style={styles.stepEmoji}>{step.emoji}</Text>
                  </View>
                  {index < STATUS_STEPS.length - 1 && (
                    <View style={[
                      styles.stepLine,
                      index < statusIndex
                        ? { backgroundColor: Colors.primary }
                        : { backgroundColor: Colors.lightGray }
                    ]} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepLabel,
                    index <= statusIndex
                      ? { color: Colors.black }
                      : { color: Colors.gray }
                  ]}>
                    {step.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Order Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemQty}>
                <Text style={styles.itemQtyText}>{item.quantity}x</Text>
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${order.totalAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>${order.deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${(order.totalAmount + order.deliveryFee).toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Status</Text>
            <Text style={[
              styles.summaryValue,
              { color: order.paymentStatus === "paid" ? Colors.success : Colors.warning }
            ]}>
              {order.paymentStatus.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Payment Method</Text>
          <Text style={styles.summaryValue}>
            {order.paymentMethod === "cash" ? "💵 Cash on Delivery" : "💳 Online"}
          </Text>
        </View>

        {/* Delivery Address */}
        <View style={styles.addressCard}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>📍 {order.address}</Text>
        </View>

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
  loaderText: {
    fontFamily: "Poppins-SemiBold",
    color: Colors.gray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  backButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  statusCard: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 8,
    alignItems: "center",
  },
  orderId: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  orderDate: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 4,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  progressCard: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  stepLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  stepEmoji: {
    fontSize: 16,
  },
  stepLine: {
    width: 2,
    height: 24,
    marginTop: 4,
  },
  stepContent: {
    paddingTop: 8,
  },
  stepLabel: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  itemsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemQty: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  itemQtyText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  addressCard: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
})