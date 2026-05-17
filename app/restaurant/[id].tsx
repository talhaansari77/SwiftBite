import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Share,
} from "react-native"
import { useState, useEffect } from "react"
import { router, useLocalSearchParams } from "expo-router"
import {
  ArrowLeft,
  Heart,
  Share2,
  Clock,
  MapPin,
  DollarSign,
  ShoppingBag,
  Plus,
  Minus,
  ChevronRight,
} from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { useCartStore } from "@/store/cartStore"
import { API_URL } from "@/constants"

const { width } = Dimensions.get("window")

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
  image?: string
}

interface Restaurant {
  _id: string
  name: string
  cuisine: string
  rating: number
  totalRatings: number
  deliveryTime: string
  deliveryFee: number
  minimumOrder: number
  address: string
  isOpen: boolean
  image: string
  description: string
}

interface Review {
  _id: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams()
  const { token, user, updateUser } = useAuthStore()
  const { items, addItem, removeItem, getTotalItems, getTotalPrice } = useCartStore()

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Popular")
  const [isFavourite, setIsFavourite] = useState(
    user?.favourites?.includes(id as string) || false
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [restRes, menuRes, reviewRes] = await Promise.all([
        fetch(`${API_URL}/restaurants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/restaurants/${id}/menu`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/reviews/restaurant/${id}`),
      ])

      const restData = await restRes.json()
      const menuData = await menuRes.json()
      const reviewData = await reviewRes.json()

      setRestaurant(restData.restaurant)
      setMenuItems(menuData.menuItems)
      setReviews(reviewData.reviews || [])
    } catch (error) {
      console.error("Error fetching restaurant:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavourite = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/favourites/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (response.ok) {
        setIsFavourite(data.isFavourite)
        updateUser({ favourites: data.favourites })
      }
    } catch (error) {
      console.error("Error toggling favourite:", error)
    }
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${restaurant?.name} on SwiftBite! 🍔`,
      })
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const categories = ["Popular", ...new Set(menuItems.map((item) => item.category))]

  const filteredItems = selectedCategory === "Popular"
    ? menuItems.slice(0, 5)
    : menuItems.filter((item) => item.category === selectedCategory)

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find((i) => i.menuItem._id === itemId)
    return cartItem ? cartItem.quantity : 0
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
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {restaurant?.image ? (
            <Image
              source={{ uri: restaurant.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroEmoji}>
                {restaurant?.cuisine === "American" ? "🍔" :
                 restaurant?.cuisine === "Italian" ? "🍕" :
                 restaurant?.cuisine === "Japanese" ? "🍣" : "🍽️"}
              </Text>
            </View>
          )}

          {/* Gradient overlay */}
          <View style={styles.heroOverlay} />

          {/* Action Buttons */}
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color={Colors.black} />
            </TouchableOpacity>
            <View style={styles.heroBtnsRight}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={handleToggleFavourite}
              >
                <Heart
                  size={20}
                  color={isFavourite ? Colors.error : Colors.black}
                  fill={isFavourite ? Colors.error : "transparent"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={handleShare}
              >
                <Share2 size={20} color={Colors.black} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Restaurant Info Card */}
        <View style={styles.infoCard}>

          {/* Logo + Name Row */}
          <View style={styles.logoNameRow}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>
                {restaurant?.cuisine === "American" ? "🍔" :
                 restaurant?.cuisine === "Italian" ? "🍕" :
                 restaurant?.cuisine === "Japanese" ? "🍣" : "🍽️"}
              </Text>
            </View>
            <View style={styles.nameContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.restaurantName}>{restaurant?.name}</Text>
                <Text style={styles.verifiedBadge}>✅</Text>
              </View>
              <Text style={styles.cuisineText}>
                {restaurant?.cuisine} • Fast Food • Casual
              </Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingText}>
                  ⭐ {restaurant?.rating || "New"}
                </Text>
                {restaurant?.totalRatings ? (
                  <Text style={styles.ratingCount}>
                    ({restaurant.totalRatings}+)
                  </Text>
                ) : null}
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{restaurant?.deliveryTime}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>
                  ${restaurant?.deliveryFee} Delivery
                </Text>
              </View>
            </View>
          </View>

          {/* Free delivery banner */}
          <View style={styles.freeDeliveryBanner}>
            <Text style={styles.freeDeliveryText}>
              🛵 Free delivery on orders over ${restaurant?.minimumOrder || 20}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Clock size={20} color={Colors.gray} />
              <Text style={styles.statValue}>{restaurant?.deliveryTime}</Text>
              <Text style={styles.statLabel}>Delivery Time</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MapPin size={20} color={Colors.gray} />
              <Text style={styles.statValue}>1.8 km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <DollarSign size={20} color={Colors.gray} />
              <Text style={styles.statValue}>$$</Text>
              <Text style={styles.statLabel}>Delivery Fee</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ShoppingBag size={20} color={Colors.gray} />
              <Text style={styles.statValue}>10K+</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
          </View>

          {/* Promo Banner */}
          <TouchableOpacity style={styles.promoBanner}>
            <View style={styles.promoIconContainer}>
              <Text style={styles.promoIcon}>%</Text>
            </View>
            <View style={styles.promoInfo}>
              <Text style={styles.promoTitle}>50% OFF up to $10</Text>
              <Text style={styles.promoSubtitle}>
                Use code WELCOME20 | On orders over $20
              </Text>
            </View>
            <View style={styles.promoSeeDetails}>
              <Text style={styles.promoSeeDetailsText}>See details</Text>
              <ChevronRight size={14} color="#4CAF50" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.tab}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.tabText,
                  selectedCategory === cat && styles.tabTextActive,
                ]}>
                  {cat}
                </Text>
                {selectedCategory === cat && (
                  <View style={styles.tabIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.tabBorder} />
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <View style={styles.menuSectionHeader}>
            <Text style={styles.menuSectionTitle}>
              {selectedCategory} Items
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {filteredItems.map((item) => {
            const quantity = getItemQuantity(item._id)
            return (
              <View key={item._id} style={styles.menuItem}>
                {/* Item Image */}
                <View style={styles.menuItemImageContainer}>
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.menuItemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.menuItemImagePlaceholder}>
                      <Text style={styles.menuItemEmoji}>🍽️</Text>
                    </View>
                  )}
                </View>

                {/* Item Info */}
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.menuItemRating}>
                    <Text style={styles.menuItemRatingText}>
                      ⭐ 4.5 | 1.2k+ orders
                    </Text>
                  </View>
                  <View style={styles.menuItemBottom}>
                    <Text style={styles.menuItemPrice}>
                      ${item.price.toFixed(2)}
                    </Text>

                    {quantity === 0 ? (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addItem(item as any, id as string)}
                      >
                        <Plus size={18} color={Colors.primary} />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => removeItem(item._id)}
                        >
                          <Minus size={14} color={Colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => addItem(item as any, id as string)}
                        >
                          <Plus size={14} color={Colors.white} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )
          })}
        </View>

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsTitle}>
              Customer Reviews ({reviews.length})
            </Text>
            {reviews.map((review) => (
              <View key={review._id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {review.customerName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewName}>{review.customerName}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Cart Footer */}
      {getTotalItems() > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartFooterLeft}>
            <View style={styles.cartBagIcon}>
              <ShoppingBag size={20} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.cartFooterItems}>
                {getTotalItems()} Items • ${getTotalPrice().toFixed(2)}
              </Text>
              <Text style={styles.cartFooterLabel}>Your cart</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Text style={styles.viewCartText}>View Cart 🛒</Text>
          </TouchableOpacity>
        </View>
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
  heroContainer: {
    width: "100%",
    height: 280,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  heroEmoji: {
    fontSize: 80,
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  heroButtons: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  heroBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  heroBtnsRight: {
    flexDirection: "row",
    gap: 10,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
    paddingBottom: 0,
  },
  logoNameRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 12,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.black,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: {
    fontSize: 36,
  },
  nameContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  restaurantName: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  verifiedBadge: {
    fontSize: 16,
  },
  cuisineText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  ratingText: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  ratingCount: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  metaDot: {
    color: Colors.gray,
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  freeDeliveryBanner: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  freeDeliveryText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#4CAF50",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  promoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FFF4",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: "#C3E6CB",
  },
  promoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  promoIcon: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  promoInfo: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  promoSubtitle: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  promoSeeDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  promoSeeDetailsText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: "#4CAF50",
  },
  tabsContainer: {
    backgroundColor: Colors.white,
    marginTop: 8,
  },
  tabs: {
    paddingHorizontal: 20,
    gap: 24,
  },
  tab: {
    paddingVertical: 14,
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
  menuSection: {
    padding: 16,
  },
  menuSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  menuSectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  viewAll: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
  menuItem: {
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
  menuItemImageContainer: {
    width: 120,
    height: 120,
  },
  menuItemImage: {
    width: "100%",
    height: "100%",
  },
  menuItemImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemEmoji: {
    fontSize: 40,
  },
  menuItemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  menuItemName: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  menuItemDesc: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 4,
    lineHeight: 18,
  },
  menuItemRating: {
    marginTop: 4,
  },
  menuItemRatingText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  menuItemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 4,
    gap: 8,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    minWidth: 16,
    textAlign: "center",
  },
  reviewsSection: {
    padding: 16,
    paddingTop: 0,
  },
  reviewsTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewAvatarText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  reviewRating: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  reviewComment: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    lineHeight: 20,
  },
  cartFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  cartFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cartBagIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  cartFooterItems: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  cartFooterLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  viewCartButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  viewCartText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
})