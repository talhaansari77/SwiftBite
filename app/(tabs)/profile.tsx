import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { router } from "expo-router"
import {
  ChevronRight,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react-native"
import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

export default function ProfileScreen() {
  const { user, logout, setUser, token } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [address, setAddress] = useState(user?.address || "")
  const [loading, setLoading] = useState(false)

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

  const handleSaveAddress = async () => {
  console.log(address)
    if (!address.trim()) {
      Alert.alert("Error", "Please enter a valid address")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ address }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setUser({ ...user!, address }, token!)
        setEditing(false)
        Alert.alert("✅ Success", "Address updated successfully")
      } else {
        Alert.alert("Error", data.message)
      }
    } catch (error) {
      // Save locally even if API fails
      setUser({ ...user!, address }, token!)
      setEditing(false)
      Alert.alert("✅ Saved", "Address saved locally")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.role}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Info</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <User size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{user?.name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

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

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Phone size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone || "Not set"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Edit3 size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <MapPin size={18} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                {editing ? (
                  <>
                    <TextInput
                      style={styles.addressInput}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Enter your delivery address"
                      placeholderTextColor={Colors.gray}
                      multiline
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSaveAddress}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save Address</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>
                      {user?.address || "Tap edit to add address"}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  addressInput: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
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