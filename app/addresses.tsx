import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useState, useEffect } from "react"
import { router } from "expo-router"
import { ArrowLeft, Plus, Trash2, MapPin, Check } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"
import { IAddress } from "@/types"

export default function AddressesScreen() {
  const { token, user, updateUser } = useAuthStore()
  const [addresses, setAddresses] = useState<IAddress[]>(user?.addresses || [])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [label, setLabel] = useState("Home")
  const [address, setAddress] = useState("")
  const [isDefault, setIsDefault] = useState(false)

  const handleAddAddress = async () => {
    if (!label || !address) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ label, address, isDefault }),
      })

      const data = await response.json()

      if (response.ok) {
        setAddresses(data.addresses)
        updateUser({ addresses: data.addresses })
        setShowForm(false)
        setLabel("Home")
        setAddress("")
        setIsDefault(false)
        Alert.alert("✅ Success", "Address added successfully")
      } else {
        Alert.alert("Error", data.message)
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert("Delete Address", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(
              `${API_URL}/auth/addresses/${addressId}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            const data = await response.json()
            if (response.ok) {
              setAddresses(data.addresses)
              updateUser({ addresses: data.addresses })
            }
          } catch (error) {
            Alert.alert("Error", "Something went wrong")
          }
        },
      },
    ])
  }

  const LABEL_OPTIONS = ["Home", "Work", "Other"]

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
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Add Address Form */}
        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Add New Address</Text>

            {/* Label Options */}
            <Text style={styles.label}>Label</Text>
            <View style={styles.labelOptions}>
              {LABEL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.labelOption,
                    label === option && styles.labelOptionActive,
                  ]}
                  onPress={() => setLabel(option)}
                >
                  <Text style={[
                    styles.labelOptionText,
                    label === option && styles.labelOptionTextActive,
                  ]}>
                    {option === "Home" ? "🏠" : option === "Work" ? "💼" : "📍"} {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter full address"
              placeholderTextColor={Colors.gray}
              multiline
            />

            {/* Set as Default */}
            <TouchableOpacity
              style={styles.defaultRow}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={[
                styles.checkbox,
                isDefault && styles.checkboxActive,
              ]}>
                {isDefault && <Check size={14} color={Colors.white} />}
              </View>
              <Text style={styles.defaultText}>Set as default address</Text>
            </TouchableOpacity>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddAddress}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyTitle}>No addresses yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your delivery addresses
            </Text>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((addr) => (
              <View key={addr._id} style={styles.addressCard}>
                <View style={styles.addressIcon}>
                  <MapPin size={20} color={Colors.primary} />
                </View>
                <View style={styles.addressInfo}>
                  <View style={styles.addressLabelRow}>
                    <Text style={styles.addressLabel}>
                      {addr.label === "Home" ? "🏠" :
                       addr.label === "Work" ? "💼" : "📍"} {addr.label}
                    </Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText}>{addr.address}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAddress(addr._id!)}
                >
                  <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
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
    marginBottom: 8,
  },
  labelOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  labelOption: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
  },
  labelOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: "#FFF0EB",
  },
  labelOptionText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: Colors.gray,
  },
  labelOptionTextActive: {
    color: Colors.primary,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  defaultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  defaultText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  formButtons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    fontSize: 14,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  saveButtonText: {
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
    fontSize: 14,
  },
  addressList: {
    padding: 16,
    gap: 12,
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFF0EB",
    justifyContent: "center",
    alignItems: "center",
  },
  addressInfo: {
    flex: 1,
  },
  addressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  defaultBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontFamily: "Poppins-SemiBold",
    color: "#4CAF50",
  },
  addressText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
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
})