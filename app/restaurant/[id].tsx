import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native"
import { useState, useEffect } from "react"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { useCartStore } from "@/store/cartStore"
import { API_URL } from "@/constants"

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
}

interface Restaurant {
  _id: string
  name: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: number
  minimumOrder: number
  address: string
  isOpen: boolean
  image: string
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
  const { token } = useAuthStore()
  const { items, addItem, removeItem, getTotalItems, getTotalPrice } = useCartStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")

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

  const categories = ["All", ...new Set(menuItems.map((item) => item.category))]

  const filteredItems = selectedCategory === "All"
    ? menuItems
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

        {/* Header Image */}
        <View style={styles.heroImage}>
          {restaurant?.image ? (
            <Image
              source={{ uri: restaurant.image }}
              style={styles.heroImageFull}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.heroEmoji}>
              {restaurant?.cuisine === "American" ? "🍔" :
                restaurant?.cuisine === "Italian" ? "🍕" :
                  restaurant?.cuisine === "Japanese" ? "🍣" : "🍽️"}
            </Text>
          )}

          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={22} color={Colors.black} />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.restaurantName}>{restaurant?.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: restaurant?.isOpen ? Colors.success : Colors.error }
            ]}>
              <Text style={styles.statusText}>
                {restaurant?.isOpen ? "Open" : "Closed"}
              </Text>
            </View>
          </View>

          <Text style={styles.cuisine}>{restaurant?.cuisine}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>⭐ {restaurant?.rating || "New"}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaItem}>🕐 {restaurant?.deliveryTime}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaItem}>
              {restaurant?.deliveryFee === 0
                ? "Free delivery"
                : `$${restaurant?.deliveryFee} delivery`}
            </Text>
          </View>

          <View style={styles.minOrder}>
            <Text style={styles.minOrderText}>
              Minimum order: ${restaurant?.minimumOrder}
            </Text>
          </View>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryTab,
                selectedCategory === cat && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === cat && styles.categoryTabTextActive,
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {filteredItems.map((item) => {
            const quantity = getItemQuantity(item._id)
            return (
              <View key={item._id} style={styles.menuItem}>
                <View style={styles.menuItemImage}>
                  <Text style={styles.menuItemEmoji}>🍽️</Text>
                </View>

                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                </View>

                <View style={styles.quantityControl}>
                  {quantity === 0 ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => addItem(item as any, id as string)}
                    >
                      <Plus size={20} color={Colors.white} />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.counter}>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => removeItem(item._id)}
                      >
                        <Minus size={16} color={Colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.counterText}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => addItem(item as any, id as string)}
                      >
                        <Plus size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>
        {/* Reviews Section */}
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
          <View style={styles.reviewRating}>
            <Text style={styles.reviewRatingText}>⭐ {review.rating}</Text>
          </View>
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

      {/* Cart Button */}
      {getTotalItems() > 0 && (
        <View style={styles.cartBar}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
            </View>
            <ShoppingCart size={20} color={Colors.white} />
            <Text style={styles.cartButtonText}>View Cart</Text>
            <Text style={styles.cartTotal}>${getTotalPrice().toFixed(2)}</Text>
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
  heroImageFull: {
    width: "100%",
    height: "100%",
  },
  heroImage: {
    height: 220,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  heroEmoji: {
    fontSize: 80,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 8,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  restaurantName: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
  },
  cuisine: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  metaItem: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  metaDot: {
    color: Colors.gray,
  },
  minOrder: {
    marginTop: 10,
    backgroundColor: Colors.lightGray,
    padding: 8,
    borderRadius: 8,
  },
  minOrderText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  categories: {
    backgroundColor: Colors.white,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  categoryTabActive: {
    backgroundColor: Colors.primary,
  },
  categoryTabText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: Colors.gray,
  },
  categoryTabTextActive: {
    color: Colors.white,
  },
  menuSection: {
    padding: 16,
    gap: 12,
  },
  menuItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemEmoji: {
    fontSize: 32,
  },
  menuItemInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuItemName: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  menuItemDesc: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  menuItemPrice: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
    marginTop: 4,
  },
  quantityControl: {
    alignItems: "center",
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 8,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  counterButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 16,
    padding: 6,
  },
  counterText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    minWidth: 20,
    textAlign: "center",
  },
  cartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "transparent",
  },
  cartButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cartBadge: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  cartButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    flex: 1,
    textAlign: "center",
  },
  cartTotal: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  reviewsSection: {
  padding: 16,
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
  backgroundColor: Colors.lightGray,
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 20,
},
reviewRatingText: {
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
})