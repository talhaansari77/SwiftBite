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
import { useState } from "react"
import { router } from "expo-router"
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  ChevronRight,
  Edit3,
  Save,
} from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

export default function ProfileScreen() {
  const { user, logout, setUser, token } = useAuthStore()

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // Editable fields
  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [address, setAddress] = useState(user?.address || "")

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout()
          router.replace("/(auth)/login")
        },
      },
    ])
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, address }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser({ ...user!, name, phone, address }, token!)
        setEditing(false)
        Alert.alert("✅ Success", "Profile updated successfully")
      } else {
        Alert.alert("Error", data.message)
      }
    } catch (error) {
      setUser({ ...user!, name, phone, address }, token!)
      setEditing(false)
      Alert.alert("✅ Saved", "Profile saved locally")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset to original values
    setName(user?.name || "")
    setPhone(user?.phone || "")
    setAddress(user?.address || "")
    setEditing(false)
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editing ? handleCancelEdit() : setEditing(true)}
        >
          <Text style={styles.editButtonText}>
            {editing ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {editing ? (
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={Colors.gray}
            />
          ) : (
            <Text style={styles.userName}>{user?.name}</Text>
          )}
          <Text style={styles.userRole}>{user?.role}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>

          <View style={styles.infoCard}>

            {/* Email - not editable */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Mail size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Phone - editable */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Phone size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                {editing ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter phone number"
                    placeholderTextColor={Colors.gray}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text style={styles.infoValue}>
                    {user?.phone || "Not set"}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Address - editable */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <MapPin size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Delivery Address</Text>
                {editing ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter delivery address"
                    placeholderTextColor={Colors.gray}
                    multiline
                  />
                ) : (
                  <Text style={styles.infoValue}>
                    {user?.address || "Not set"}
                  </Text>
                )}
              </View>
            </View>

          </View>
        </View>

        {/* Save Button */}
        {editing && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Save size={18} color={Colors.white} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.infoCard}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => router.push("/(tabs)/orders")}
            >
              <Text style={styles.linkText}>My Orders</Text>
              <ChevronRight size={18} color={Colors.gray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  editButton: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: Colors.black,
  },
  avatarSection: {
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 30,
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  nameInput: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 4,
    textAlign: "center",
    minWidth: 200,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  userRole: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    textTransform: "capitalize",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFF0EB",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginTop: 2,
  },
  fieldInput: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingBottom: 4,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.error,
  },
})