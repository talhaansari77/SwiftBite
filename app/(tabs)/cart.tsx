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
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

export default function CartScreen() {
    const { items, removeItem, updateQuantity, clearCart, getTotalPrice, restaurantId } = useCartStore()
    const { token, user } = useAuthStore()
    const address = user?.address || ""
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash")
    const [promoCode, setPromoCode] = useState("")
    const [promoApplied, setPromoApplied] = useState(false)
    const [promoDiscount, setPromoDiscount] = useState(0)
    const [promoLoading, setPromoLoading] = useState(false)
    const [promoError, setPromoError] = useState("")


    const deliveryFee = 2.5
    const subtotal = getTotalPrice()
    const total = subtotal + deliveryFee - promoDiscount


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
                body: JSON.stringify({
                    code: promoCode,
                    orderTotal: getTotalPrice(),
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setPromoApplied(true)
                setPromoDiscount(data.promo.discountAmount)
                setPromoError("")
            } else {
                setPromoError(data.message)
                setPromoApplied(false)
                setPromoDiscount(0)
            }
        } catch (error) {
            setPromoError("Something went wrong. Please try again.")
        } finally {
            setPromoLoading(false)
        }
    }

    const handleRemovePromo = () => {
        setPromoCode("")
        setPromoApplied(false)
        setPromoDiscount(0)
        setPromoError("")
    }

    const handlePlaceOrder = async () => {

        if (!address || address.trim() === "") {
            Alert.alert(
                "Address Required",
                "Please add a delivery address in your profile first.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Go to Profile", onPress: () => router.push("/(tabs)/profile") },
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

            console.log("Placing order with:", {
                restaurantId,
                items: orderItems,
                address,
            })

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
            console.log("Order response:", data)

            if (!response.ok) {
                Alert.alert("Error", data.message || "Failed to place order")
                return
            }

            clearCart()
            Alert.alert("🎉 Order Placed!", "Your order has been placed successfully.", [
                { text: "OK", onPress: () => router.replace("/(tabs)/orders") }
            ])
            // Apply promo code usage
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
        } catch (error: any) {
            console.error("Order error:", error)
            Alert.alert("Error", "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Empty cart
    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <ShoppingBag size={80} color={Colors.lightGray} />
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
                <Text style={styles.headerTitle}>Your Cart</Text>
                <TouchableOpacity onPress={() => {
                    Alert.alert("Clear Cart", "Are you sure you want to clear your cart?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Clear", style: "destructive", onPress: clearCart },
                    ])
                }}>
                    <Trash2 size={22} color={Colors.error} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Cart Items */}
                <View style={styles.itemsSection}>
                    {items.map((item) => (
                        <View key={item.menuItem._id} style={styles.cartItem}>
                            <View style={styles.cartItemImage}>
                                <Text style={styles.cartItemEmoji}>🍽️</Text>
                            </View>

                            <View style={styles.cartItemInfo}>
                                <Text style={styles.cartItemName}>{item.menuItem.name}</Text>
                                <Text style={styles.cartItemPrice}>
                                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.quantityControl}>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => updateQuantity(item.menuItem._id, item.quantity - 1)}
                                >
                                    <Minus size={14} color={Colors.primary} />
                                </TouchableOpacity>
                                <Text style={styles.counterText}>{item.quantity}</Text>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={() => updateQuantity(item.menuItem._id, item.quantity + 1)}
                                >
                                    <Plus size={14} color={Colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Order Summary */}
                <View style={styles.summary}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Fee</Text>
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
                    style={styles.addressCard}
                    onPress={() => router.push("/(tabs)/profile")}
                >
                    <Text style={styles.addressTitle}>📍 Delivery Address</Text>
                    <Text style={styles.addressText}>
                        {user?.address || "Tap to add delivery address"}
                    </Text>
                </TouchableOpacity>
                {/* Payment Method */}
                <View style={styles.paymentCard}>
                    <Text style={styles.paymentTitle}>💳 Payment Method</Text>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === "cash" && styles.paymentOptionActive,
                        ]}
                        onPress={() => setPaymentMethod("cash")}
                    >
                        <Text style={styles.paymentOptionEmoji}>💵</Text>
                        <View style={styles.paymentOptionInfo}>
                            <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
                            <Text style={styles.paymentOptionDesc}>Pay when your order arrives</Text>
                        </View>
                        <View style={[
                            styles.paymentRadio,
                            paymentMethod === "cash" && styles.paymentRadioActive,
                        ]}>
                            {paymentMethod === "cash" && (
                                <View style={styles.paymentRadioDot} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === "online" && styles.paymentOptionActive,
                        ]}
                        onPress={() => setPaymentMethod("online")}
                    >
                        <Text style={styles.paymentOptionEmoji}>💳</Text>
                        <View style={styles.paymentOptionInfo}>
                            <Text style={styles.paymentOptionTitle}>Online Payment</Text>
                            <Text style={styles.paymentOptionDesc}>Coming soon</Text>
                        </View>
                        <View style={[
                            styles.paymentRadio,
                            paymentMethod === "online" && styles.paymentRadioActive,
                        ]}>
                            {paymentMethod === "online" && (
                                <View style={styles.paymentRadioDot} />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Promo Code */}
                <View style={styles.promoCard}>
                    <Text style={styles.promoTitle}>🎟️ Promo Code</Text>

                    {!promoApplied ? (
                        <>
                            <View style={styles.promoInputRow}>
                                <TextInput
                                    style={styles.promoInput}
                                    placeholder="Enter promo code"
                                    placeholderTextColor={Colors.gray}
                                    value={promoCode}
                                    onChangeText={(text) => {
                                        setPromoCode(text.toUpperCase())
                                        setPromoError("")
                                    }}
                                    autoCapitalize="characters"
                                />
                                <TouchableOpacity
                                    style={styles.promoButton}
                                    onPress={handleApplyPromo}
                                    disabled={promoLoading}
                                >
                                    {promoLoading ? (
                                        <ActivityIndicator color={Colors.white} size="small" />
                                    ) : (
                                        <Text style={styles.promoButtonText}>Apply</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            {promoError ? (
                                <Text style={styles.promoError}>{promoError}</Text>
                            ) : null}
                        </>
                    ) : (
                        <View style={styles.promoApplied}>
                            <View style={styles.promoAppliedLeft}>
                                <Text style={styles.promoAppliedCode}>✅ {promoCode}</Text>
                                <Text style={styles.promoAppliedSaving}>
                                    You save ${promoDiscount.toFixed(2)}!
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleRemovePromo}>
                                <Text style={styles.promoRemove}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.orderButton}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <>
                            <Text style={styles.orderButtonText}>Place Order</Text>
                            <Text style={styles.orderButtonPrice}>${total.toFixed(2)}</Text>
                        </>
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
    browseButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 14,
        marginTop: 24,
    },
    browseButtonText: {
        color: Colors.white,
        fontFamily: "Poppins-SemiBold",
        fontSize: 15,
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
        fontSize: 22,
        fontFamily: "Poppins-Bold",
        color: Colors.black,
    },
    itemsSection: {
        backgroundColor: Colors.white,
        marginTop: 8,
        padding: 16,
        gap: 12,
    },
    cartItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    cartItemImage: {
        width: 56,
        height: 56,
        borderRadius: 10,
        backgroundColor: Colors.lightGray,
        justifyContent: "center",
        alignItems: "center",
    },
    cartItemEmoji: {
        fontSize: 26,
    },
    cartItemInfo: {
        flex: 1,
        paddingHorizontal: 12,
    },
    cartItemName: {
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
        color: Colors.black,
    },
    cartItemPrice: {
        fontSize: 14,
        fontFamily: "Poppins-Bold",
        color: Colors.primary,
        marginTop: 4,
    },
    quantityControl: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    counterButton: {
        backgroundColor: Colors.lightGray,
        borderRadius: 16,
        padding: 6,
    },
    counterText: {
        fontSize: 15,
        fontFamily: "Poppins-Bold",
        color: Colors.black,
        minWidth: 20,
        textAlign: "center",
    },
    summary: {
        backgroundColor: Colors.white,
        marginTop: 8,
        padding: 20,
    },
    summaryTitle: {
        fontSize: 16,
        fontFamily: "Poppins-Bold",
        color: Colors.black,
        marginBottom: 16,
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
        marginTop: 8,
        padding: 20,
    },
    addressTitle: {
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
        color: Colors.black,
        marginBottom: 6,
    },
    addressText: {
        fontSize: 13,
        fontFamily: "Poppins-Regular",
        color: Colors.gray,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    orderButton: {
        backgroundColor: Colors.primary,
        borderRadius: 14,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    orderButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: "Poppins-Bold",
    },
    orderButtonPrice: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: "Poppins-Bold",
    },
    paymentCard: {
        backgroundColor: Colors.white,
        marginTop: 8,
        padding: 20,
    },
    paymentTitle: {
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
        color: Colors.black,
        marginBottom: 12,
    },
    paymentOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.border,
        marginBottom: 10,
        gap: 12,
    },
    paymentOptionActive: {
        borderColor: Colors.primary,
        backgroundColor: "#FFF5F2",
    },
    paymentOptionEmoji: {
        fontSize: 24,
    },
    paymentOptionInfo: {
        flex: 1,
    },
    paymentOptionTitle: {
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
        color: Colors.black,
    },
    paymentOptionDesc: {
        fontSize: 12,
        fontFamily: "Poppins-Regular",
        color: Colors.gray,
        marginTop: 2,
    },
    paymentRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.border,
        justifyContent: "center",
        alignItems: "center",
    },
    paymentRadioActive: {
        borderColor: Colors.primary,
    },
    paymentRadioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    promoCard: {
        backgroundColor: Colors.white,
        marginTop: 8,
        padding: 20,
    },
    promoTitle: {
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
        color: Colors.black,
        marginBottom: 12,
    },
    promoInputRow: {
        flexDirection: "row",
        gap: 10,
    },
    promoInput: {
        flex: 1,
        backgroundColor: Colors.lightGray,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: Colors.black,
        letterSpacing: 2,
    },
    promoButton: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    promoButtonText: {
        color: Colors.white,
        fontFamily: "Poppins-SemiBold",
        fontSize: 14,
    },
    promoError: {
        color: Colors.error,
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        marginTop: 6,
    },
    promoApplied: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#E8F5E9",
        borderRadius: 10,
        padding: 12,
    },
    promoAppliedLeft: {
        gap: 2,
    },
    promoAppliedCode: {
        fontSize: 14,
        fontFamily: "Poppins-Bold",
        color: Colors.success,
    },
    promoAppliedSaving: {
        fontSize: 12,
        fontFamily: "Poppins-Regular",
        color: Colors.success,
    },
    promoRemove: {
        fontSize: 13,
        fontFamily: "Poppins-SemiBold",
        color: Colors.error,
    },
})