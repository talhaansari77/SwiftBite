import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { Search, SlidersHorizontal, MapPin, Bell, Clock, ChevronDown } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

const { width } = Dimensions.get("window")

interface Restaurant {
  _id: string
  name: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: number
  isOpen: boolean
  address: string
  image: string
}

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "American", label: "Burgers", emoji: "🍔" },
  { id: "Italian", label: "Pizza", emoji: "🍕" },
  { id: "Japanese", label: "Sushi", emoji: "🍣" },
  { id: "Asian", label: "Asian", emoji: "🍜" },
  { id: "Healthy", label: "Healthy", emoji: "🥗" },
  { id: "Desserts", label: "Desserts", emoji: "🍰" },
]

const PROMOS = [
  {
    id: "1",
    discount: "50% OFF",
    title: "Weekend\nSPECIAL 🔥",
    subtitle: "On orders above $20",
    code: "WELCOME20",
    bg: "#1A1A2E",
  },
  {
    id: "2",
    discount: "FREE DELIVERY",
    title: "First\nORDER 🎉",
    subtitle: "No minimum order",
    code: "SAVE5",
    bg: "#0F6E56",
  },
]

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function HomeScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activePromo, setActivePromo] = useState(0)
  const { user, token } = useAuthStore()

  const fetchRestaurants = async (cuisine?: string, searchQuery?: string) => {
    try {
      let url = `${API_URL}/restaurants?`
      if (cuisine && cuisine !== "all") url += `cuisine=${cuisine}&`
      if (searchQuery) url += `search=${searchQuery}`

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setRestaurants(data.restaurants)
    } catch (error) {
      console.error("Error fetching restaurants:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRestaurants(selectedCategory, search)
  }, [selectedCategory])

  const handleSearch = () => {
    fetchRestaurants(selectedCategory, search)
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchRestaurants(selectedCategory, search)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.locationRow}>
            <MapPin size={16} color={Colors.primary} />
            <View style={styles.locationText}>
              <Text style={styles.deliverTo}>Deliver to</Text>
              <View style={styles.locationNameRow}>
                <Text style={styles.locationName}>Home</Text>
                <ChevronDown size={16} color={Colors.black} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifButton}>
              <Bell size={22} color={Colors.black} />
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.name?.split(" ")[0]}! 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            What are you craving today?
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={18} color={Colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for food, restaurants..."
              placeholderTextColor={Colors.gray}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <SlidersHorizontal size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                selectedCategory === cat.id && styles.categoryItemActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <View style={[
                styles.categoryEmoji,
                selectedCategory === cat.id && styles.categoryEmojiActive,
              ]}>
                <Text style={styles.categoryEmojiText}>{cat.emoji}</Text>
              </View>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelActive,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo Banner */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.promoScroll}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / (width - 32))
            setActivePromo(index)
          }}
        >
          {PROMOS.map((promo) => (
            <View
              key={promo.id}
              style={[styles.promoBanner, { backgroundColor: promo.bg }]}
            >
              <View style={styles.promoContent}>
                <Text style={styles.promoDiscount}>{promo.discount}</Text>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <Text style={styles.promoSubtitle}>{promo.subtitle}</Text>
                <TouchableOpacity style={styles.promoButton}>
                  <Text style={styles.promoButtonText}>Order Now →</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.promoImagePlaceholder}>
                <Text style={styles.promoImageEmoji}>🍔</Text>
                <View style={styles.limitedBadge}>
                  <Text style={styles.limitedText}>LIMITED{"\n"}TIME</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Promo Dots */}
        <View style={styles.promoDots}>
          {PROMOS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activePromo === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Popular Near You */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Near You</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.loader}
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {restaurants.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.horizontalCard}
                onPress={() => router.push(`/restaurant/${item._id}`)}
              >
                {/* Image */}
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.horizontalCardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.horizontalCardImagePlaceholder}>
                    <Text style={styles.horizontalCardEmoji}>
                      {item.cuisine === "American" ? "🍔" :
                       item.cuisine === "Italian" ? "🍕" :
                       item.cuisine === "Japanese" ? "🍣" : "🍽️"}
                    </Text>
                  </View>
                )}

                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {item.rating || "New"}</Text>
                </View>

                {/* Restaurant Logo placeholder */}
                <View style={styles.restaurantLogo}>
                  <Text style={styles.restaurantLogoText}>
                    {item.cuisine === "American" ? "🍔" :
                     item.cuisine === "Italian" ? "🍕" :
                     item.cuisine === "Japanese" ? "🍣" : "🍽️"}
                  </Text>
                </View>

                {/* Info */}
                <View style={styles.horizontalCardInfo}>
                  <Text style={styles.horizontalCardName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.horizontalCardCuisine} numberOfLines={1}>
                    {item.cuisine} • Fast Food
                  </Text>
                  <View style={styles.horizontalCardMeta}>
                    <Clock size={12} color={Colors.primary} />
                    <Text style={styles.metaText}>{item.deliveryTime}</Text>
                  </View>
                  <Text style={styles.deliveryFeeText}>
                    {item.deliveryFee === 0
                      ? "Free Delivery"
                      : `$${item.deliveryFee} Delivery Fee`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Pro Banner */}
        <View style={styles.proBanner}>
          <View style={styles.proIconContainer}>
            <Text style={styles.proIcon}>👑</Text>
          </View>
          <View style={styles.proInfo}>
            <Text style={styles.proTitle}>Get FREE delivery & more</Text>
            <Text style={styles.proSubtitle}>Join SwiftBite Pro now!</Text>
          </View>
          <TouchableOpacity style={styles.proButton}>
            <Text style={styles.proButtonText}>Try for FREE</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended For You */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {/* Vertical Restaurant Cards */}
        <View style={styles.verticalList}>
          {restaurants.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.verticalCard}
              onPress={() => router.push(`/restaurant/${item._id}`)}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.verticalCardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.verticalCardImagePlaceholder}>
                  <Text style={styles.verticalCardEmoji}>
                    {item.cuisine === "American" ? "🍔" :
                     item.cuisine === "Italian" ? "🍕" :
                     item.cuisine === "Japanese" ? "🍣" : "🍽️"}
                  </Text>
                </View>
              )}

              <View style={styles.verticalRatingBadge}>
                <Text style={styles.ratingText}>⭐ {item.rating || "New"}</Text>
              </View>

              <View style={styles.verticalCardInfo}>
                <Text style={styles.verticalCardName}>{item.name}</Text>
                <Text style={styles.verticalCardCuisine}>{item.cuisine}</Text>
                <View style={styles.verticalCardMeta}>
                  <Clock size={12} color={Colors.primary} />
                  <Text style={styles.metaText}>{item.deliveryTime}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>
                    {item.deliveryFee === 0 ? "Free delivery" : `$${item.deliveryFee} delivery`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    gap: 2,
  },
  deliverTo: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  locationNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notifButton: {
    position: "relative",
    padding: 4,
  },
  notifBadge: {
    position: "absolute",
    top: 0,
    right: 0,
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
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  greetingSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: Colors.black,
  },
  filterButton: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  categories: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryItem: {
    alignItems: "center",
    gap: 6,
  },
  categoryEmoji: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryEmojiActive: {
    backgroundColor: "#FFF0EB",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  categoryEmojiText: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: Colors.gray,
  },
  categoryLabelActive: {
    color: Colors.primary,
  },
  promoScroll: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  promoBanner: {
    width: width - 40,
    height: 180,
    borderRadius: 20,
    flexDirection: "row",
    padding: 20,
    overflow: "hidden",
  },
  promoContent: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  promoDiscount: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  promoTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
    lineHeight: 28,
  },
  promoSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  promoButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  promoButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 13,
  },
  promoImagePlaceholder: {
    width: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  promoImageEmoji: {
    fontSize: 80,
  },
  limitedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  limitedText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  promoDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.lightGray,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  viewAll: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
  loader: {
    marginTop: 40,
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 4,
    marginBottom: 20,
  },
  horizontalCard: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  horizontalCardImage: {
    width: "100%",
    height: 130,
  },
  horizontalCardImagePlaceholder: {
    width: "100%",
    height: 130,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontalCardEmoji: {
    fontSize: 48,
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  restaurantLogo: {
    position: "absolute",
    top: 110,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantLogoText: {
    fontSize: 18,
  },
  horizontalCardInfo: {
    padding: 12,
    paddingTop: 16,
  },
  horizontalCardName: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  horizontalCardCuisine: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  horizontalCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  metaDot: {
    color: Colors.gray,
    fontSize: 12,
  },
  deliveryFeeText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  proBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  proIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  proIcon: {
    fontSize: 24,
  },
  proInfo: {
    flex: 1,
  },
  proTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  proSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  proButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  proButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
  verticalList: {
    paddingHorizontal: 20,
    gap: 14,
  },
  verticalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  verticalCardImage: {
    width: "100%",
    height: 160,
  },
  verticalCardImagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  verticalCardEmoji: {
    fontSize: 64,
  },
  verticalRatingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verticalCardInfo: {
    padding: 14,
  },
  verticalCardName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  verticalCardCuisine: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  verticalCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  categoryItemActive: {
  opacity: 1,
},
})