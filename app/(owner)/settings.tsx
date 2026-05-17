import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native"
import { useState, useEffect, useCallback } from "react"
import { useFocusEffect } from "expo-router"
import {
  Store,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  FileText,
  Save,
} from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

export default function RestaurantSettingsScreen() {
  const { token, user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [restaurantId, setRestaurantId] = useState("")

  // Restaurant fields
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [cuisine, setCuisine] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [deliveryFee, setDeliveryFee] = useState("")
  const [minimumOrder, setMinimumOrder] = useState("")
  const [isOpen, setIsOpen] = useState(true)

  useFocusEffect(
    useCallback(() => {
      fetchRestaurant()
    }, [])
  )

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(
        `${API_URL}/restaurants?ownerId=${user?._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()

      if (data.restaurants?.length > 0) {
        const restaurant = data.restaurants[0]
        setRestaurantId(restaurant._id)
        setName(restaurant.name || "")
        setDescription(restaurant.description || "")
        setCuisine(restaurant.cuisine || "")
        setAddress(restaurant.address || "")
        setPhone(restaurant.phone || "")
        setDeliveryTime(restaurant.deliveryTime || "")
        setDeliveryFee(restaurant.deliveryFee?.toString() || "")
        setMinimumOrder(restaurant.minimumOrder?.toString() || "")
        setIsOpen(restaurant.isOpen ?? true)
      }
    } catch (error) {
      console.error("Error fetching restaurant:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name || !cuisine || !address) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(
        `${API_URL}/restaurants/${restaurantId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            description,
            cuisine,
            address,
            phone,
            deliveryTime,
            deliveryFee: parseFloat(deliveryFee) || 0,
            minimumOrder: parseFloat(minimumOrder) || 0,
            isOpen,
          }),
        }
      )

      if (response.ok) {
        Alert.alert("✅ Success", "Restaurant updated successfully!")
      } else {
        Alert.alert("Error", "Failed to update restaurant")
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong")
    } finally {
      setSaving(false)
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
        <Text style={styles.headerTitle}>Restaurant Settings</Text>
        <TouchableOpacity
          style={styles.saveHeaderButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Text style={styles.saveHeaderText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Open/Closed Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={[
              styles.toggleIcon,
              { backgroundColor: isOpen ? "#E8F5E9" : "#FFE5E5" }
            ]}>
              <Text style={styles.toggleEmoji}>
                {isOpen ? "🟢" : "🔴"}
              </Text>
            </View>
            <View>
              <Text style={styles.toggleTitle}>
                {isOpen ? "Restaurant is Open" : "Restaurant is Closed"}
              </Text>
              <Text style={styles.toggleSubtitle}>
                {isOpen
                  ? "Customers can place orders"
                  : "No orders will be accepted"}
              </Text>
            </View>
          </View>
          <Switch
            value={isOpen}
            onValueChange={setIsOpen}
            trackColor={{ false: Colors.lightGray, true: "#C8E6C9" }}
            thumbColor={isOpen ? "#4CAF50" : Colors.gray}
          />
        </View>

        {/* Basic Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Restaurant Name *</Text>
            <View style={styles.inputContainer}>
              <Store size={16} color={Colors.gray} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Restaurant name"
                placeholderTextColor={Colors.gray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Tell customers about your restaurant..."
              placeholderTextColor={Colors.gray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cuisine Type *</Text>
            <View style={styles.inputContainer}>
              <FileText size={16} color={Colors.gray} />
              <TextInput
                style={styles.input}
                value={cuisine}
                onChangeText={setCuisine}
                placeholder="e.g. Italian, American, Japanese"
                placeholderTextColor={Colors.gray}
              />
            </View>
          </View>
        </View>

        {/* Contact & Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact & Location</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address *</Text>
            <View style={styles.inputContainer}>
              <MapPin size={16} color={Colors.gray} />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Restaurant address"
                placeholderTextColor={Colors.gray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Phone size={16} color={Colors.gray} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Restaurant phone"
                placeholderTextColor={Colors.gray}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Delivery Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Settings</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Delivery Time</Text>
            <View style={styles.inputContainer}>
              <Clock size={16} color={Colors.gray} />
              <TextInput
                style={styles.input}
                value={deliveryTime}
                onChangeText={setDeliveryTime}
                placeholder="e.g. 30-45 min"
                placeholderTextColor={Colors.gray}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Delivery Fee ($)</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={16} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  value={deliveryFee}
                  onChangeText={setDeliveryFee}
                  placeholder="0.00"
                  placeholderTextColor={Colors.gray}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.rowSpacer} />

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Min Order ($)</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={16} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  value={minimumOrder}
                  onChangeText={setMinimumOrder}
                  placeholder="0.00"
                  placeholderTextColor={Colors.gray}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Save size={18} color={Colors.white} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
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
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  saveHeaderButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveHeaderText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
  toggleCard: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  toggleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleEmoji: {
    fontSize: 20,
  },
  toggleTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  toggleSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    minHeight: 80,
  },
  row: {
    flexDirection: "row",
  },
  rowSpacer: {
    width: 12,
  },
  saveSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 16,
  },
})