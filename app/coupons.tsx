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
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { ArrowLeft, Tag, Copy, Check } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

interface PromoCode {
  _id: string
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minimumOrder: number
  maxUses: number
  currentUses: number
  expiryDate: string
  isActive: boolean
}

export default function CouponsScreen() {
  const { token } = useAuthStore()
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState("")
  const [searchCode, setSearchCode] = useState("")
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)

  useEffect(() => {
    fetchPromos()
  }, [])

  const fetchPromos = async () => {
    try {
      const response = await fetch(`${API_URL}/promo`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setPromos(data.promos || [])
    } catch (error) {
      console.error("Error fetching promos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(""), 2000)
    Alert.alert("✅ Copied!", `Code "${code}" copied to clipboard`)
  }

  const handleValidateCode = async () => {
    if (!searchCode.trim()) {
      Alert.alert("Error", "Please enter a promo code")
      return
    }

    setValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch(`${API_URL}/promo/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: searchCode.toUpperCase(),
          orderTotal: 999,
        }),
      })

      const data = await response.json()
      setValidationResult({ success: response.ok, ...data })
    } catch (error) {
      setValidationResult({ success: false, message: "Something went wrong" })
    } finally {
      setValidating(false)
    }
  }

  const getDaysLeft = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    if (days < 0) return "Expired"
    if (days === 0) return "Expires today"
    if (days === 1) return "1 day left"
    return `${days} days left`
  }

  const getUsagePercentage = (promo: PromoCode) => {
    return (promo.currentUses / promo.maxUses) * 100
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coupons & Offers</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Search/Validate Code */}
        <View style={styles.searchCard}>
          <Text style={styles.searchTitle}>Have a promo code?</Text>
          <View style={styles.searchRow}>
            <View style={styles.searchInput}>
              <Tag size={16} color={Colors.primary} />
              <TextInput
                style={styles.searchTextInput}
                value={searchCode}
                onChangeText={(text) => {
                  setSearchCode(text.toUpperCase())
                  setValidationResult(null)
                }}
                placeholder="Enter promo code"
                placeholderTextColor={Colors.gray}
                autoCapitalize="characters"
              />
            </View>
            <TouchableOpacity
              style={styles.validateButton}
              onPress={handleValidateCode}
              disabled={validating}
            >
              {validating ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.validateText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Validation Result */}
          {validationResult && (
            <View style={[
              styles.validationResult,
              {
                backgroundColor: validationResult.success ? "#E8F5E9" : "#FFE5E5",
                borderColor: validationResult.success ? "#4CAF50" : Colors.error,
              }
            ]}>
              <Text style={[
                styles.validationText,
                { color: validationResult.success ? "#4CAF50" : Colors.error }
              ]}>
                {validationResult.success
                  ? `✅ ${validationResult.message} — Save $${validationResult.promo?.discountAmount}`
                  : `❌ ${validationResult.message}`}
              </Text>
            </View>
          )}
        </View>

        {/* Available Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Available Offers ({promos.length})
          </Text>

          {promos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎟️</Text>
              <Text style={styles.emptyTitle}>No offers available</Text>
              <Text style={styles.emptySubtitle}>
                Check back later for new deals!
              </Text>
            </View>
          ) : (
            promos.map((promo) => {
              const daysLeft = getDaysLeft(promo.expiryDate)
              const isExpired = daysLeft === "Expired"
              const usagePercent = getUsagePercentage(promo)

              return (
                <View
                  key={promo._id}
                  style={[
                    styles.couponCard,
                    isExpired && styles.couponCardExpired,
                  ]}
                >
                  {/* Left colored strip */}
                  <View style={[
                    styles.couponStrip,
                    { backgroundColor: isExpired ? Colors.gray : Colors.primary }
                  ]} />

                  {/* Coupon content */}
                  <View style={styles.couponContent}>
                    {/* Top row */}
                    <View style={styles.couponTop}>
                      <View style={styles.couponIconContainer}>
                        <Text style={styles.couponIcon}>🎟️</Text>
                      </View>
                      <View style={styles.couponInfo}>
                        <Text style={[
                          styles.couponDiscount,
                          isExpired && styles.textExpired,
                        ]}>
                          {promo.discountType === "percentage"
                            ? `${promo.discountValue}% OFF`
                            : `$${promo.discountValue} OFF`}
                        </Text>
                        <Text style={styles.couponMinOrder}>
                          Min order ${promo.minimumOrder}
                        </Text>
                      </View>

                      {/* Copy button */}
                      <TouchableOpacity
                        style={[
                          styles.copyButton,
                          isExpired && styles.copyButtonExpired,
                        ]}
                        onPress={() => !isExpired && handleCopyCode(promo.code)}
                        disabled={isExpired}
                      >
                        {copiedCode === promo.code ? (
                          <Check size={14} color={Colors.white} />
                        ) : (
                          <Copy size={14} color={Colors.white} />
                        )}
                        <Text style={styles.copyButtonText}>
                          {copiedCode === promo.code ? "Copied!" : promo.code}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Divider with circles */}
                    <View style={styles.couponDivider}>
                      <View style={styles.couponDividerCircleLeft} />
                      <View style={styles.couponDividerLine} />
                      <View style={styles.couponDividerCircleRight} />
                    </View>

                    {/* Bottom row */}
                    <View style={styles.couponBottom}>
                      <View style={styles.couponMeta}>
                        <Text style={[
                          styles.couponExpiry,
                          daysLeft === "Expires today" && { color: Colors.error },
                          isExpired && styles.textExpired,
                        ]}>
                          ⏰ {daysLeft}
                        </Text>
                        <Text style={styles.couponUses}>
                          {promo.maxUses - promo.currentUses} uses left
                        </Text>
                      </View>

                      {/* Usage bar */}
                      <View style={styles.usageBar}>
                        <View
                          style={[
                            styles.usageBarFill,
                            {
                              width: `${usagePercent}%`,
                              backgroundColor: isExpired
                                ? Colors.gray
                                : usagePercent > 80
                                ? Colors.error
                                : Colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </View>

        {/* How to use section */}
        <View style={styles.howToCard}>
          <Text style={styles.howToTitle}>💡 How to use coupons?</Text>
          <View style={styles.howToStep}>
            <View style={styles.howToStepNum}>
              <Text style={styles.howToStepNumText}>1</Text>
            </View>
            <Text style={styles.howToStepText}>
              Add items to your cart
            </Text>
          </View>
          <View style={styles.howToStep}>
            <View style={styles.howToStepNum}>
              <Text style={styles.howToStepNumText}>2</Text>
            </View>
            <Text style={styles.howToStepText}>
              Go to cart and tap "Add a promo code"
            </Text>
          </View>
          <View style={styles.howToStep}>
            <View style={styles.howToStepNum}>
              <Text style={styles.howToStepNumText}>3</Text>
            </View>
            <Text style={styles.howToStepText}>
              Enter the code and tap Apply
            </Text>
          </View>
          <View style={styles.howToStep}>
            <View style={styles.howToStepNum}>
              <Text style={styles.howToStepNumText}>4</Text>
            </View>
            <Text style={styles.howToStepText}>
              Discount will be applied to your order!
            </Text>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  searchCard: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    paddingVertical: 12,
    letterSpacing: 2,
  },
  validateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  validateText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
  validationResult: {
    marginTop: 12,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  validationText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 4,
  },
  couponCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  couponCardExpired: {
    opacity: 0.6,
  },
  couponStrip: {
    width: 6,
  },
  couponContent: {
    flex: 1,
    padding: 14,
  },
  couponTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  couponIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFF0EB",
    justifyContent: "center",
    alignItems: "center",
  },
  couponIcon: {
    fontSize: 22,
  },
  couponInfo: {
    flex: 1,
  },
  couponDiscount: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  couponMinOrder: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  copyButtonExpired: {
    backgroundColor: Colors.gray,
  },
  copyButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
  couponDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  couponDividerCircleLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginLeft: -22,
  },
  couponDividerLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.border,
    marginHorizontal: 8,
  },
  couponDividerCircleRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginRight: -22,
  },
  couponBottom: {
    gap: 8,
  },
  couponMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  couponExpiry: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
  couponUses: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  usageBar: {
    height: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 2,
    overflow: "hidden",
  },
  usageBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  textExpired: {
    color: Colors.gray,
  },
  howToCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  howToTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 16,
  },
  howToStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  howToStepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  howToStepNumText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 13,
  },
  howToStepText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    flex: 1,
  },
})