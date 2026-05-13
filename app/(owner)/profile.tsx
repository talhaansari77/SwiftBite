import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native"
import { router } from "expo-router"
import { LogOut } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"

export default function OwnerProfileScreen() {
  const { user, logout } = useAuthStore()

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

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>Restaurant Owner</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    marginBottom: 16,
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
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
    marginTop: 4,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
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