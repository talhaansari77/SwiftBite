import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native"
import { useState } from "react"
import { router } from "expo-router"
import { ArrowLeft, Heart, Trash2, Plus, Minus, Tag, MapPin, Clock, ChevronRight } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

const FREE_DELIVERY_THRESHOLD = 25

export default function CartScreen() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, restaurantId } = useCartStore()
  const { token, user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash")
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState("")
  const [showPromoInput, setShowPromoInput] = useState(false)

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0]
  const address = defaultAddress?.address || ""

  const deliveryFee = 2.5
  const subtotal = getTotalPrice()
  const total = subtotal + deliveryFee - promoDiscount
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
  const freeDeliveryProgress = Math.min(subtotal / FREE_DELIVERY_THRESHOLD, 1)

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code")
      return
    }
    setPromoLoading(true)
    setPromoError("")
    try {
      const response = await fetch(`${API_URL}/promo/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: promoCode, orderTotal: getTotalPrice() }),
      })
      const data = await response.json()
      if (response.ok) {
        setPromoApplied(true)
        setPromoDiscount(data.promo.discountAmount)
        setShowPromoInput(false)
        setPromoError("")
      } else {
        setPromoError(data.message)
      }
    } catch (error) {
      setPromoError("Something went wrong")
    } finally {
      setPromoLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!address) {
      Alert.alert(
        "Address Required",
        "Please add a delivery address first.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Address", onPress: () => router.push("/addresses" as any) },
        ]
      )
      return
    }

    if (items.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first.")
      return
    }

    setLoading(true)
    try {
      const orderItems = items.map((item) => ({
        menuItemId: item.menuItem._id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        image: item.menuItem.image || "",
      }))

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId,
          items: orderItems,
          address,
          paymentMethod,
          promoCode: promoApplied ? promoCode : null,
          discount: promoDiscount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to place order")
        return
      }

      if (promoApplied) {
        await fetch(`${API_URL}/promo/apply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code: promoCode }),
        })
      }

      clearCart()
      Alert.alert("🎉 Order Placed!", "Your order has been placed successfully.", [
        { text: "Track Order", onPress: () => router.replace("/(tabs)/orders") },
      ])
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add items from a restaurant to get started
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push("/(tabs)/home")}
        >
          <Text style={styles.browseButtonText}>Browse Restaurants</Text>
        </TouchableOpacity>
      </View>
    )
  }

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
        <Text style={styles.headerTitle}>Your Cart</Text>
        <TouchableOpacity style={styles.heartButton}>
          <Heart size={22} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Free Delivery Progress */}
        <View style={styles.freeDeliveryCard}>
          <View style={styles.freeDeliveryTop}>
            <Text style={styles.freeDeliveryEmoji}>🛵</Text>
            <View style={styles.freeDeliveryInfo}>
              {amountToFreeDelivery > 0 ? (
                <Text style={styles.freeDeliveryText}>
                  You're{" "}
                  <Text style={styles.freeDeliveryAmount}>
                    ${amountToFreeDelivery.toFixed(2)} away
                  </Text>
                  {" "}from{"\n"}
                  <Text style={styles.freeDeliveryGreen}>FREE DELIVERY!</Text>
                </Text>
              ) : (
                <Text style={styles.freeDeliveryText}>
                  🎉 You've unlocked{" "}
                  <Text style={styles.freeDeliveryGreen}>FREE DELIVERY!</Text>
                </Text>
              )}
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${freeDeliveryProgress * 100}%` },
              ]}
            />
          </View>
          <View style={styles.progressBarLabels}>
            <Text style={styles.progressBarLabel}>$0</Text>
            <Text style={styles.progressBarLabel}>${FREE_DELIVERY_THRESHOLD}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items in Cart</Text>
          {items.map((item) => (
            <View key={item.menuItem._id} style={styles.cartItem}>
              <View style={styles.checkbox}>
                <Text style={styles.checkboxCheck}>✓</Text>
              </View>

              <View style={styles.itemImage}>
                <Text style={styles.itemEmoji}>🍽️</Text>
              </View>

              <View style={styles.itemInfo}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.menuItem.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItem(item.menuItem._id)}
                  >
                    <Trash2 size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemCategory}>
                  {item.menuItem.category || "Food item"}
                </Text>
                <View style={styles.itemBottomRow}>
                  <Text style={styles.itemPrice}>
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </Text>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                    >
                      <Minus size={14} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                    >
                      <Plus size={14} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Promo Code */}
        <TouchableOpacity
          style={styles.promoRow}
          onPress={() => setShowPromoInput(!showPromoInput)}
        >
          <Tag size={18} color={Colors.primary} />
          {promoApplied ? (
            <Text style={styles.promoAppliedText}>
              ✅ {promoCode} — Saved ${promoDiscount.toFixed(2)}
            </Text>
          ) : (
            <Text style={styles.promoText}>Add a promo code</Text>
          )}
          <ChevronRight size={18} color={Colors.gray} />
        </TouchableOpacity>

        {showPromoInput && !promoApplied && (
          <View style={styles.promoInputContainer}>
            <TextInput
              style={styles.promoInput}
              value={promoCode}
              onChangeText={(text) => {
                setPromoCode(text.toUpperCase())
                setPromoError("")
              }}
              placeholder="Enter promo code"
              placeholderTextColor={Colors.gray}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.promoApplyButton}
              onPress={handleApplyPromo}
              disabled={promoLoading}
            >
              {promoLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.promoApplyText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        {promoError ? (
          <Text style={styles.promoError}>{promoError}</Text>
        ) : null}

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>ⓘ</Text>
              </View>
            </View>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>
          {promoApplied && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>
                Promo Discount
              </Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                -${promoDiscount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => router.push("/addresses" as any)}
        >
          <View style={[styles.infoIconContainer, { backgroundColor: "#FFF0EB" }]}>
            <MapPin size={18} color={Colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Delivering to</Text>
            <Text style={styles.infoSubtitle} numberOfLines={1}>
              {address || "Add delivery address"}
            </Text>
          </View>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>

        {/* Schedule Delivery */}
        <View style={styles.infoRow}>
          <View style={[styles.infoIconContainer, { backgroundColor: "#EEF2FF" }]}>
            <Clock size={18} color="#4B7BFF" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Schedule delivery</Text>
            <Text style={styles.infoSubtitle}>As soon as possible</Text>
          </View>
          <Text style={styles.changeText}>Change</Text>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "cash" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod("cash")}
          >
            <Text style={styles.paymentEmoji}>💵</Text>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
              <Text style={styles.paymentSubtitle}>Pay when your order arrives</Text>
            </View>
            <View style={[
              styles.radio,
              paymentMethod === "cash" && styles.radioActive,
            ]}>
              {paymentMethod === "cash" && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === "online" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod("online")}
          >
            <Text style={styles.paymentEmoji}>💳</Text>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Online Payment</Text>
              <Text style={styles.paymentSubtitle}>Coming soon</Text>
            </View>
            <View style={[
              styles.radio,
              paymentMethod === "online" && styles.radioActive,
            ]}>
              {paymentMethod === "online" && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerTotal}>${total.toFixed(2)}</Text>
          {promoApplied && (
            <Text style={styles.footerSaving}>
              You saved ${promoDiscount.toFixed(2)} on this order
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.checkoutText}>Checkout →</Text>
          )}
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 40,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  freeDeliveryCard: {
    backgroundColor: "#F0FFF4",
    margin: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#C3E6CB",
  },
  freeDeliveryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  freeDeliveryEmoji: {
    fontSize: 28,
  },
  freeDeliveryInfo: {
    flex: 1,
  },
  freeDeliveryText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    lineHeight: 20,
  },
  freeDeliveryAmount: {
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  freeDeliveryGreen: {
    fontFamily: "Poppins-Bold",
    color: "#4CAF50",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#C3E6CB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  progressBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  progressBarLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 14,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCheck: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    flex: 1,
    marginRight: 8,
  },
  itemCategory: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  itemBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyButton: {
    padding: 4,
  },
  qtyText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    minWidth: 20,
    textAlign: "center",
  },
  promoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  promoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  promoAppliedText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: Colors.success,
  },
  promoInputContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  promoInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.border,
    letterSpacing: 2,
  },
  promoApplyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  promoApplyText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
  promoError: {
    color: Colors.error,
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  summarySection: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  infoIcon: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  infoIconText: {
    fontSize: 14,
    color: Colors.gray,
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
    color: Colors.black,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  infoSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  changeText: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  paymentSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
  },
  paymentOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: "#FFF0EB",
  },
  paymentEmoji: {
    fontSize: 24,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  paymentSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  footerLeft: {
    gap: 2,
  },
  footerLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  footerTotal: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  footerSaving: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: Colors.success,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  checkoutText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 16,
  },
})