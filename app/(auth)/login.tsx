import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { useState } from "react"
import { router } from "expo-router"
import { useAuthStore } from "@/store/authStore"
import { Colors } from "@/constants/colors"
import { API_URL } from "@/constants"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { setUser } = useAuthStore()

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

      setUser(data.user, data.token)
      // Route based on role
      if (data.user.role === "restaurant") {
        router.replace("/(owner)/dashboard")
      } else {
        router.replace("/(tabs)/home")
      }
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
      <View style={styles.inner}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🍔</Text>
          <Text style={styles.title}>SwiftBite</Text>
          <Text style={styles.subtitle}>
            Delicious food, delivered fast
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Colors.gray}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={Colors.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

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
          <TouchableOpacity
            style={styles.forgotLink}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
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

      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  errorBox: {
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontFamily: "Poppins-Regular",
    fontSize: 13,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  registerLink: {
    alignItems: "center",
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  registerBold: {
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
  forgotLink: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
})