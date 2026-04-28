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
import { Colors } from "@/constants/colors"

export default function RegisterScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
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
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🍔</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join SwiftBite today
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.gray}
            value={name}
            onChangeText={setName}
          />

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

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            placeholderTextColor={Colors.gray}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
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

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor={Colors.gray}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.back()}
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
    backgroundColor: Colors.background,
  },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
    marginBottom: 6,
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
  loginLink: {
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  loginBold: {
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
})