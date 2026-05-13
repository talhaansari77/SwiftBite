import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useState } from "react"
import { router } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { API_URL } from "@/constants"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendCode = async () => {
  if (!email) {
    Alert.alert("Error", "Please enter your email")
    return
  }

  setLoading(true)
  try {
    // Add timeout to prevent infinite loading
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds

    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await response.json()

    if (response.ok) {
      Alert.alert(
        "✅ Code Sent!",
        "Check your email for the reset code.",
        [{ text: "OK", onPress: () => router.push(`/(auth)/reset-password?email=${email}`) }]
      )
    } else {
      Alert.alert("Error", data.message)
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      Alert.alert("Timeout", "Request took too long. Please try again.")
    } else {
      Alert.alert("Error", "Something went wrong. Please try again.")
    }
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

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={Colors.black} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a reset code
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Colors.gray}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Send Reset Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <Text style={styles.backLinkText}>
              Back to <Text style={styles.backLinkBold}>Login</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    padding: 8,
    alignSelf: "flex-start",
    marginBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
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
    textAlign: "center",
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
  backLink: {
    alignItems: "center",
    marginTop: 20,
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  backLinkBold: {
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
  },
})