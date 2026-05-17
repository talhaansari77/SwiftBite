import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { Search, X, Clock, TrendingUp } from "lucide-react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
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
  image: string
  isOpen: boolean
}

const TRENDING = [
  "Burgers", "Pizza", "Sushi",
  "Chicken", "Pasta", "Desserts",
]

export default function SearchScreen() {
  const { token } = useAuthStore()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    loadRecentSearches()
  }, [])

  useEffect(() => {
    if (query.length > 1) {
      const timeout = setTimeout(() => handleSearch(query), 500)
      return () => clearTimeout(timeout)
    } else {
      setResults([])
      setHasSearched(false)
    }
  }, [query])

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem("recentSearches")
      if (saved) setRecentSearches(JSON.parse(saved))
    } catch (error) {}
  }

  const saveRecentSearch = async (searchQuery: string) => {
    try {
      const updated = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, 5)
      setRecentSearches(updated)
      await AsyncStorage.setItem("recentSearches", JSON.stringify(updated))
    } catch (error) {}
  }

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/restaurants?search=${searchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()
      setResults(data.restaurants || [])
      setHasSearched(true)
      saveRecentSearch(searchQuery)
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearRecentSearches = async () => {
    setRecentSearches([])
    await AsyncStorage.removeItem("recentSearches")
  }

  const handleClearSearch = () => {
    setQuery("")
    setResults([])
    setHasSearched(false)
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <Text style={styles.headerSubtitle}>
          Find your favourite food & restaurants
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants, cuisines..."
          placeholderTextColor={Colors.gray}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(query)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <X size={18} color={Colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {results.length > 0
                ? `${results.length} Results for "${query}"`
                : `No results for "${query}"`}
            </Text>

            {results.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsEmoji}>🔍</Text>
                <Text style={styles.noResultsTitle}>No restaurants found</Text>
                <Text style={styles.noResultsSubtitle}>
                  Try searching for something else
                </Text>
              </View>
            ) : (
              results.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant._id}
                  style={styles.resultCard}
                  onPress={() => router.push(`/restaurant/${restaurant._id}`)}
                >
                  {restaurant.image ? (
                    <Image
                      source={{ uri: restaurant.image }}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.resultImagePlaceholder}>
                      <Text style={styles.resultEmoji}>
                        {restaurant.cuisine === "American" ? "🍔" :
                         restaurant.cuisine === "Italian" ? "🍕" :
                         restaurant.cuisine === "Japanese" ? "🍣" : "🍽️"}
                      </Text>
                    </View>
                  )}
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{restaurant.name}</Text>
                    <Text style={styles.resultCuisine}>{restaurant.cuisine}</Text>
                    <View style={styles.resultMeta}>
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
                          : `$${restaurant.deliveryFee}`}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: restaurant.isOpen ? "#E8F5E9" : "#FFE5E5" }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: restaurant.isOpen ? "#4CAF50" : Colors.error }
                    ]}>
                      {restaurant.isOpen ? "Open" : "Closed"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Recent Searches */}
        {!hasSearched && recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={clearRecentSearches}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => {
                  setQuery(search)
                  handleSearch(search)
                }}
              >
                <Clock size={16} color={Colors.gray} />
                <Text style={styles.recentText}>{search}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const updated = recentSearches.filter((_, i) => i !== index)
                    setRecentSearches(updated)
                    AsyncStorage.setItem("recentSearches", JSON.stringify(updated))
                  }}
                >
                  <X size={16} color={Colors.gray} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Trending Searches */}
        {!hasSearched && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending 🔥</Text>
            </View>
            <View style={styles.trendingGrid}>
              {TRENDING.map((trend, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.trendingChip}
                  onPress={() => {
                    setQuery(trend)
                    handleSearch(trend)
                  }}
                >
                  <TrendingUp size={14} color={Colors.primary} />
                  <Text style={styles.trendingText}>{trend}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
  header: {
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
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 12,
  },
  clearText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  trendingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  trendingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendingText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  noResultsTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  noResultsSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 4,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  resultImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  resultImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  resultEmoji: {
    fontSize: 32,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  resultCuisine: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  metaDot: {
    color: Colors.gray,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
  },
})