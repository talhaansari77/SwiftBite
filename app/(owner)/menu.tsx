import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native"
import { useState, useCallback } from "react"
import { useFocusEffect } from "expo-router"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
}

export default function OwnerMenuScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [restaurantId, setRestaurantId] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const { token, user } = useAuthStore()

  // New item form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [adding, setAdding] = useState(false)

  const fetchMenu = async () => {
    try {
      const restRes = await fetch(
        `${API_URL}/restaurants?ownerId=${user?._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const restData = await restRes.json()

      if (!restData.restaurants?.length) {
        setLoading(false)
        setRefreshing(false)
        return
      }

      const id = restData.restaurants[0]._id
      setRestaurantId(id)

      const menuRes = await fetch(`${API_URL}/restaurants/${id}/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const menuData = await menuRes.json()
      setMenuItems(menuData.menuItems || [])
    } catch (error) {
      console.error("Error fetching menu:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchMenu()
    }, [])
  )

  const handleAddItem = async () => {
    if (!name || !description || !price || !category) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setAdding(true)
    try {
      const response = await fetch(
        `${API_URL}/restaurants/${restaurantId}/menu`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            price: parseFloat(price),
            category,
            image: "",
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setMenuItems((prev) => [...prev, data.menuItem])
        setName("")
        setDescription("")
        setPrice("")
        setCategory("")
        setShowAddForm(false)
        Alert.alert("✅ Success", "Menu item added successfully")
      } else {
        Alert.alert("Error", data.message)
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong")
    } finally {
      setAdding(false)
    }
  }

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch(
        `${API_URL}/restaurants/${restaurantId}/menu/${item._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isAvailable: !item.isAvailable }),
        }
      )

      if (response.ok) {
        setMenuItems((prev) =>
          prev.map((m) =>
            m._id === item._id
              ? { ...m, isAvailable: !m.isAvailable }
              : m
          )
        )
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update item")
    }
  }

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}/restaurants/${restaurantId}/menu/${itemId}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              )

              if (response.ok) {
                setMenuItems((prev) =>
                  prev.filter((m) => m._id !== itemId)
                )
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete item")
            }
          },
        },
      ]
    )
  }

  const categories = [...new Set(menuItems.map((item) => item.category))]

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
        <Text style={styles.headerTitle}>Menu Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              fetchMenu()
            }}
          />
        }
      >

        {/* Add Item Form */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>New Menu Item</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Item name"
              placeholderTextColor={Colors.gray}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Item description"
              placeholderTextColor={Colors.gray}
              multiline
            />

            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={Colors.gray}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Burgers, Sides, Drinks"
              placeholderTextColor={Colors.gray}
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelFormButton}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelFormText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveFormButton}
                onPress={handleAddItem}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.saveFormText}>Add Item</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Menu Items by Category */}
        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {menuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <View key={item._id} style={[
                  styles.menuItem,
                  !item.isAvailable && styles.menuItemUnavailable,
                ]}>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                    <Text style={styles.menuItemPrice}>
                      ${item.price.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.menuItemActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleToggleAvailability(item)}
                    >
                      {item.isAvailable ? (
                        <Eye size={18} color={Colors.success} />
                      ) : (
                        <EyeOff size={18} color={Colors.gray} />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDeleteItem(item._id)}
                    >
                      <Trash2 size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        ))}

        {menuItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>No menu items yet</Text>
            <Text style={styles.emptySubtext}>
              Tap "Add Item" to get started
            </Text>
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
  },
  addForm: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelFormButton: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  cancelFormText: {
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    fontSize: 14,
  },
  saveFormButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  saveFormText: {
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
    fontSize: 14,
  },
  categorySection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  categoryTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemUnavailable: {
    opacity: 0.5,
  },
  menuItemInfo: {
    flex: 1,
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
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
    marginTop: 4,
  },
  menuItemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 4,
  },
})