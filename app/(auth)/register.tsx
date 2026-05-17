import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { useState } from "react"
import { router } from "expo-router"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Store,
} from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { API_URL } from "@/constants"

export default function RegisterScreen() {
  const [role, setRole] = useState<"customer" | "restaurant">("customer")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
const [cuisine, setCuisine] = useState("")
const [restaurantAddress, setRestaurantAddress] = useState("")
const [restaurantPhone, setRestaurantPhone] = useState("")

  const handleRegister = async () => {
  if (!name || !email || !phone || !password || !confirmPassword) {
    setError("Please fill in all fields")
    return
  }

  if (role === "restaurant") {
    if (!restaurantName || !cuisine || !restaurantAddress || !restaurantPhone) {
      setError("Please fill in all restaurant details")
      return
    }
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match")
    return
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters")
    return
  }

  if (!agreedToTerms) {
    setError("Please agree to the Terms & Conditions")
    return
  }

  setLoading(true)
  setError("")

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        role,
        restaurantName,
        cuisine,
        restaurantAddress,
        restaurantPhone,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.message || "Registration failed")
      return
    }

    router.replace("/(auth)/login")
  } catch (err) {
    setError("Something went wrong. Please try again.")
  } finally {
    setLoading(false)
  }
}

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Food decoration top right */}
        <View style={styles.foodDecoration}>
          <Text style={styles.foodDecorationEmoji}>🍜</Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={Colors.black} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Join SwiftBite and enjoy amazing food!
          </Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              role === "customer" && styles.roleCardActive,
            ]}
            onPress={() => setRole("customer")}
          >
            {role === "customer" && (
              <View style={styles.roleCheckBadge}>
                <Text style={styles.roleCheckText}>✓</Text>
              </View>
            )}
            <View style={[
              styles.roleIconContainer,
              role === "customer" && styles.roleIconContainerActive,
            ]}>
              <User
                size={28}
                color={role === "customer" ? Colors.primary : Colors.gray}
              />
            </View>
            <Text style={[
              styles.roleTitle,
              role === "customer" && styles.roleTitleActive,
            ]}>
              I'm a Regular
            </Text>
            <Text style={styles.roleSubtitle}>
              Sign up to order food{"\n"}and more
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              role === "restaurant" && styles.roleCardActive,
            ]}
            onPress={() => setRole("restaurant")}
          >
            {role === "restaurant" && (
              <View style={styles.roleCheckBadge}>
                <Text style={styles.roleCheckText}>✓</Text>
              </View>
            )}
            <View style={[
              styles.roleIconContainer,
              role === "restaurant" && styles.roleIconContainerActive,
            ]}>
              <Store
                size={28}
                color={role === "restaurant" ? Colors.primary : Colors.gray}
              />
            </View>
            <Text style={[
              styles.roleTitle,
              role === "restaurant" && styles.roleTitleActive,
            ]}>
              I'm an Owner
            </Text>
            <Text style={styles.roleSubtitle}>
              Manage your restaurant{"\n"}and grow your business
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Restaurant Details - only show for owners */}
{role === "restaurant" && (
  <View style={styles.restaurantSection}>
    <Text style={styles.restaurantSectionTitle}>
      🏪 Restaurant Details
    </Text>

    <View style={styles.inputContainer}>
      <Store size={18} color={Colors.gray} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder="Restaurant Name"
        placeholderTextColor={Colors.gray}
        value={restaurantName}
        onChangeText={setRestaurantName}
      />
    </View>

    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Cuisine Type (e.g. Italian, American)"
        placeholderTextColor={Colors.gray}
        value={cuisine}
        onChangeText={setCuisine}
      />
    </View>

    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Restaurant Address"
        placeholderTextColor={Colors.gray}
        value={restaurantAddress}
        onChangeText={setRestaurantAddress}
      />
    </View>

    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Restaurant Phone"
        placeholderTextColor={Colors.gray}
        value={restaurantPhone}
        onChangeText={setRestaurantPhone}
        keyboardType="phone-pad"
      />
    </View>
  </View>
)}

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <User size={18} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.gray}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Mail size={18} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={Colors.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <Phone size={18} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor={Colors.gray}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Lock size={18} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={18} color={Colors.gray} />
              ) : (
                <Eye size={18} color={Colors.gray} />
              )}
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Lock size={18} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={Colors.gray}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              {showConfirmPassword ? (
                <EyeOff size={18} color={Colors.gray} />
              ) : (
                <Eye size={18} color={Colors.gray} />
              )}
            </TouchableOpacity>
          </View>

          {/* Terms & Conditions */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[
              styles.checkbox,
              agreedToTerms && styles.checkboxActive,
            ]}>
              {agreedToTerms && (
                <Text style={styles.checkboxCheck}>✓</Text>
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.termsLink}>Terms & Conditions</Text>
              {" "}and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  foodDecoration: {
    position: "absolute",
    top: 0,
    right: -10,
    opacity: 0.3,
  },
  foodDecorationEmoji: {
    fontSize: 120,
  },
  backButton: {
    marginTop: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 24,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    position: "relative",
    backgroundColor: Colors.white,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "#FFFAF8",
  },
  roleCheckBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  roleCheckText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  roleIconContainerActive: {
    backgroundColor: "#FFF0EB",
  },
  roleTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    textAlign: "center",
  },
  roleTitleActive: {
    color: Colors.primary,
  },
  roleSubtitle: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 18,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  errorBox: {
    backgroundColor: "#FFE5E5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontFamily: "Poppins-Regular",
    fontSize: 13,
  },
  form: {
    gap: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  eyeIcon: {
    padding: 4,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxCheck: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontFamily: "Poppins-SemiBold",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  loginBold: {
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  restaurantSection: {
  backgroundColor: "#FFF5F0",
  borderRadius: 16,
  padding: 16,
  gap: 14,
  borderWidth: 1,
  borderColor: "#FFD5C0",
},
restaurantSectionTitle: {
  fontSize: 15,
  fontFamily: "Poppins-Bold",
  color: Colors.primary,
  marginBottom: 4,
},
})