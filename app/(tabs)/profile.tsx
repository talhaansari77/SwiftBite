import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native"
import { router } from "expo-router"
import {
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Crown,
  Headphones,
  ChevronRight,
  Settings,
  Bell,
  LogOut,
} from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"

export default function ProfileScreen() {
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

  const menuItems = [
    {
      icon: <ShoppingBag size={18} color="#FF6B35" />,
      bg: "#FFF0EB",
      title: "My Orders",
      subtitle: "Track, reorder or rate your orders",
      onPress: () => router.push("/(tabs)/orders"),
    },
    {
      icon: <Heart size={18} color="#FF4B6E" />,
      bg: "#FFF0F3",
      title: "Favourites",
      subtitle: "Your saved restaurants & dishes",
      onPress: () => router.push("/favourites" as any),
    },
    {
      icon: <MapPin size={18} color="#00B26A" />,
      bg: "#EDFAF3",
      title: "Addresses",
      subtitle: "Saved delivery addresses",
      onPress: () => router.push("/addresses"),
    },
    {
      icon: <CreditCard size={18} color="#4B7BFF" />,
      bg: "#EEF2FF",
      title: "Payment Methods",
      subtitle: "Cards, wallets & more",
      onPress: () => { },
    },
    {
      icon: <Crown size={18} color="#9B59B6" />,
      bg: "#F5EEFF",
      title: "SwiftBite Pro",
      subtitle: "Your membership & benefits",
      onPress: () => router.push("/coupons" as any),
    },
    {
      icon: <Headphones size={18} color="#FF9500" />,
      bg: "#FFF5E5",
      title: "Help & Support",
      subtitle: "FAQs, refunds & more",
      onPress: () => router.push("/support" as any),
    },
  ]

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Good food, good mood! 🍕</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color={Colors.black} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Settings size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name}</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeIcon}>👑</Text>
                <Text style={styles.proBadgeText}>Pro Member</Text>
              </View>
            </View>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.phoneRow}>
              <Text style={styles.phoneIcon}>📞</Text>
              <Text style={styles.userPhone}>
                {user?.phone || "Add phone number"}
              </Text>
            </View>
          </View>
        </View>

        {/* Pro Banner */}
        <TouchableOpacity style={styles.proBanner}>
          <View style={styles.proIconContainer}>
            <Text style={styles.proIconEmoji}>👑</Text>
          </View>
          <View style={styles.proInfo}>
            <Text style={styles.proTitle}>
              You're saving more with SwiftBite Pro!
            </Text>
            <Text style={styles.proSubtitle}>
              Free delivery, exclusive offers & more.
            </Text>
          </View>
          <TouchableOpacity style={styles.proViewButton}>
            <Text style={styles.proViewText}>View Benefits</Text>
            <ChevronRight size={14} color={Colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <Text style={styles.walletTitle}>My Wallet</Text>
            <TouchableOpacity
              style={styles.viewWalletButton}
              onPress={() => router.push("/wallet" as any)}
            >
              <Text style={styles.viewWalletText}>View wallet</Text>
              <ChevronRight size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.walletContent}>
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceAmount}>
                ${(user?.walletBalance || 0).toFixed(2)}
              </Text>
              <TouchableOpacity style={styles.addMoneyButton}>
                <Text style={styles.addMoneyText}>+ Add Money</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.walletDivider} />

            <View style={styles.walletStats}>
              <View style={styles.walletStat}>
                <View style={[styles.walletStatIcon, { backgroundColor: "#FFF0EB" }]}>
                  <Text style={styles.walletStatEmoji}>🎟️</Text>
                </View>
                <Text style={styles.walletStatNumber}>3</Text>
                <Text style={styles.walletStatLabel}>Coupons</Text>
              </View>
              <View style={styles.walletStat}>
                <View style={[styles.walletStatIcon, { backgroundColor: "#FFF0F3" }]}>
                  <Text style={styles.walletStatEmoji}>❤️</Text>
                </View>
                <Text style={styles.walletStatNumber}>
                  {user?.favourites?.length || 0}
                </Text>
                <Text style={styles.walletStatLabel}>Favourites</Text>
              </View>
              <View style={styles.walletStat}>
                <View style={[styles.walletStatIcon, { backgroundColor: "#FFF5E5" }]}>
                  <Text style={styles.walletStatEmoji}>⭐</Text>
                </View>
                <Text style={styles.walletStatNumber}>
                  {user?.foodiePoints || 0}
                </Text>
                <Text style={styles.walletStatLabel}>Points</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuRow,
                index < menuItems.length - 1 && styles.menuRowBorder,
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                {item.icon}
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={18} color={Colors.gray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Edit Profile Button */}
        <View style={styles.section}>
          <TouchableOpacity
  style={styles.editProfileButton}
  onPress={() => router.push("/edit-profile" as any)}
>
  <Text style={styles.editProfileText}>✏️ Edit Profile</Text>
</TouchableOpacity>
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
    alignItems: "flex-start",
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
  headerIcons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cameraIcon: {
    fontSize: 12,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  userName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0EB",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  proBadgeIcon: {
    fontSize: 11,
  },
  proBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  phoneIcon: {
    fontSize: 13,
  },
  userPhone: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  proBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F0",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FFD5C0",
  },
  proIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  proIconEmoji: {
    fontSize: 20,
  },
  proInfo: {
    flex: 1,
  },
  proTitle: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  proSubtitle: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  proViewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  proViewText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  walletCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  walletTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  viewWalletButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewWalletText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
  walletContent: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 90,
  },
  balanceSection: {
    flex: 1,
    gap: 4,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  balanceAmount: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  addMoneyButton: {
    backgroundColor: "#FFF0EB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addMoneyText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  walletDivider: {
    width: 1,
    height: 80,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  walletStats: {
    flexDirection: "row",
    gap: 16,
  },
  walletStat: {
    alignItems: "center",
    gap: 4,
  },
  walletStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  walletStatEmoji: {
    fontSize: 16,
  },
  walletStatNumber: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  walletStatLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  menuCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  editProfileButton: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  editProfileText: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    borderRadius: 14,
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