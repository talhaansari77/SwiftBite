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
import { useEffect, useState } from "react"
import { router } from "expo-router"
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { setUser } = useAuthStore()
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Login failed")
        return
      }


      // Save or clear credentials based on remember me
      if (rememberMe) {
        await AsyncStorage.setItem("savedEmail", email)
        await AsyncStorage.setItem("savedPassword", password)
        await AsyncStorage.setItem("rememberMe", "true")
      } else {
        await AsyncStorage.removeItem("savedEmail")
        await AsyncStorage.removeItem("savedPassword")
        await AsyncStorage.removeItem("rememberMe")
      }

      setUser(data.user, data.token)

      if (data.user.role === "restaurant") {
        router.replace("/(owner)/dashboard" as any)
      } else {
        router.replace("/(tabs)/home")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSavedCredentials()
  }, [])

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("savedEmail")
      const savedPassword = await AsyncStorage.getItem("savedPassword")
      const savedRememberMe = await AsyncStorage.getItem("rememberMe")

      if (savedRememberMe === "true" && savedEmail && savedPassword) {
        setEmail(savedEmail)
        setPassword(savedPassword)
        setRememberMe(true)
      }
    } catch (error) {
      console.error("Error loading credentials:", error)
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
        {/* Food decoration */}
        <View style={styles.foodDecorationTop}>
          <Text style={styles.foodEmoji}>🍕</Text>
        </View>
        <View style={styles.foodDecorationBottom}>
          <Text style={styles.foodEmoji}>🍔</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🍔</Text>
          </View>
          <Text style={styles.logoTitle}>SwiftBite</Text>
          <Text style={styles.logoSubtitle}>
            Delicious food, delivered fast
          </Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back! 👋</Text>
          <Text style={styles.subtitle}>
            Sign in to continue ordering your favourite food
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
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

          {/* Remember Me & Forgot Password */}
<View style={styles.rememberForgotRow}>
  <TouchableOpacity
    style={styles.rememberRow}
    onPress={() => setRememberMe(!rememberMe)}
  >
    <View style={[
      styles.checkbox,
      rememberMe && styles.checkboxActive,
    ]}>
      {rememberMe && (
        <Text style={styles.checkboxCheck}>✓</Text>
      )}
    </View>
    <Text style={styles.rememberText}>Remember me</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => router.push("/(auth)/forgot-password")}
  >
    <Text style={styles.forgotText}>Forgot Password?</Text>
  </TouchableOpacity>
</View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Link */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.registerButtonText}>
              Create New Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.registerText}>
              Don't have an account?{" "}
              <Text style={styles.registerBold}>Sign up</Text>
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
  foodDecorationTop: {
    position: "absolute",
    top: 40,
    right: -10,
    opacity: 0.15,
  },
  foodDecorationBottom: {
    position: "absolute",
    bottom: 100,
    left: -10,
    opacity: 0.15,
  },
  foodEmoji: {
    fontSize: 120,
  },
  logoSection: {
    alignItems: "center",
    paddingTop: 80,
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
  },
  logoTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  logoSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 4,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    lineHeight: 22,
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
  forgotLink: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  registerButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  registerButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  registerLink: {
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  registerBold: {
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  rememberForgotRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: -4,
},
rememberRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},
checkbox: {
  width: 20,
  height: 20,
  borderRadius: 6,
  borderWidth: 1.5,
  borderColor: Colors.border,
  justifyContent: "center",
  alignItems: "center",
},
checkboxActive: {
  backgroundColor: Colors.primary,
  borderColor: Colors.primary,
},
checkboxCheck: {
  color: Colors.white,
  fontSize: 11,
  fontFamily: "Poppins-Bold",
},
rememberText: {
  fontSize: 13,
  fontFamily: "Poppins-Regular",
  color: Colors.gray,
},
forgotText: {
  fontSize: 13,
  fontFamily: "Poppins-SemiBold",
  color: Colors.primary,
},
})