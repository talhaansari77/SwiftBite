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
} from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { Search, MapPin } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

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
  { id: "Chinese", label: "Chinese", emoji: "🥡" },
  { id: "Indian", label: "Indian", emoji: "🍛" },
]

export default function HomeScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
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

  const RestaurantCard = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/restaurant/${item._id}`)}
    >
      {/* Image placeholder */}
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardEmoji}>
            {item.cuisine === "American" ? "🍔" :
              item.cuisine === "Italian" ? "🍕" :
                item.cuisine === "Japanese" ? "🍣" : "🍽️"}
          </Text>
        </View>
      )}

      {/* Open/Closed badge */}
      <View style={[
        styles.badge,
        { backgroundColor: item.isOpen ? Colors.success : Colors.error }
      ]}>
        <Text style={styles.badgeText}>
          {item.isOpen ? "Open" : "Closed"}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardCuisine}>{item.cuisine}</Text>

        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>⭐ {item.rating || "New"}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>🕐 {item.deliveryTime}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>
            {item.deliveryFee === 0 ? "Free delivery" : `$${item.deliveryFee} delivery`}
          </Text>
        </View>

        <View style={styles.addressRow}>
          <MapPin size={12} color={Colors.gray} />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

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
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(" ")[0]} 👋
            </Text>
            <Text style={styles.subtitle}>
              What would you like to eat?
            </Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants..."
            placeholderTextColor={Colors.gray}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
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
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === cat.id && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "all"
              ? "All Restaurants"
              : `${selectedCategory} Restaurants`}
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={styles.loader}
            />
          ) : restaurants.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>No restaurants found</Text>
            </View>
          ) : (
            restaurants.map((item) => (
              <RestaurantCard key={item._id} item={item} />
            ))
          )}
        </View>
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
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "Poppins-Bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: Colors.black,
  },
  categories: {
    marginTop: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    color: Colors.black,
  },
  categoryLabelActive: {
    color: Colors.white,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 16,
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: Colors.gray,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  cardImage: {
  height: 160,
  width: "100%",
},
cardImagePlaceholder: {
  height: 160,
  backgroundColor: Colors.lightGray,
  justifyContent: "center",
  alignItems: "center",
},
  cardEmoji: {
    fontSize: 64,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
  },
  cardInfo: {
    padding: 14,
  },
  cardName: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  cardCuisine: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
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
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    flex: 1,
  },
})