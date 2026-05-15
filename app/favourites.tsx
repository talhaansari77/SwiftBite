import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native"
import { useState, useCallback } from "react"
import { router, useFocusEffect } from "expo-router"
import { ArrowLeft, Heart } from "lucide-react-native"
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
  image: string
}

export default function FavouritesScreen() {
  const { token, user, updateUser } = useAuthStore()
  const [favourites, setFavourites] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      fetchFavourites()
    }, [])
  )

  const fetchFavourites = async () => {
    try {
      if (!user?.favourites?.length) {
        setLoading(false)
        return
      }

      // Fetch all restaurants and filter favourites
      const response = await fetch(`${API_URL}/restaurants`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()

      const favRestaurants = data.restaurants.filter((r: Restaurant) =>
        user?.favourites?.includes(r._id)
      )
      setFavourites(favRestaurants)
    } catch (error) {
      console.error("Error fetching favourites:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavourite = async (restaurantId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/auth/favourites/${restaurantId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await response.json()

      if (response.ok) {
        setFavourites((prev) => prev.filter((r) => r._id !== restaurantId))
        updateUser({ favourites: data.favourites })
      }
    } catch (error) {
      console.error("Error removing favourite:", error)
    }
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
        <Text style={styles.headerTitle}>My Favourites</Text>
        <View style={{ width: 40 }} />
      </View>

      {favourites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>❤️</Text>
          <Text style={styles.emptyTitle}>No favourites yet</Text>
          <Text style={styles.emptySubtitle}>
            Save your favourite restaurants for quick access
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/(tabs)/home")}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.list}>
            {favourites.map((restaurant) => (
              <TouchableOpacity
                key={restaurant._id}
                style={styles.card}
                onPress={() => router.push(`/restaurant/${restaurant._id}`)}
              >
                {/* Image */}
                {restaurant.image ? (
                  <Image
                    source={{ uri: restaurant.image }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <Text style={styles.cardEmoji}>
                      {restaurant.cuisine === "American" ? "🍔" :
                       restaurant.cuisine === "Italian" ? "🍕" :
                       restaurant.cuisine === "Japanese" ? "🍣" : "🍽️"}
                    </Text>
                  </View>
                )}

                {/* Heart Button */}
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() => handleRemoveFavourite(restaurant._id)}
                >
                  <Heart size={18} color={Colors.error} fill={Colors.error} />
                </TouchableOpacity>

                {/* Info */}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{restaurant.name}</Text>
                  <Text style={styles.cardCuisine}>{restaurant.cuisine}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={styles.metaText}>
                      ⭐ {restaurant.rating || "New"}
                    </Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>
                      🕐 {restaurant.deliveryTime}
                    </Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>
                      {restaurant.deliveryFee === 0
                        ? "Free delivery"
                        : `$${restaurant.deliveryFee} delivery`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  list: {
    padding: 16,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 64,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    gap: 6,
    marginTop: 8,
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
})