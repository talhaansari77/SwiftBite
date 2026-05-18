import { useEffect } from "react"
import { router } from "expo-router"
import { useAuthStore } from "@/store/authStore"
import { View, ActivityIndicator } from "react-native"
import { Colors } from "@/constants/colors"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Index() {
  const { isAuthenticated, user, loadStoredAuth } = useAuthStore()

  useEffect(() => {
    initApp()
  }, [])

  const initApp = async () => {
  await loadStoredAuth() // now this works and hydrates the store

  const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding")

  if (!hasSeenOnboarding) {
    router.replace("/onboarding" as any)
    return
  }

  // Read from the store instead of AsyncStorage again
  const { token, user } = useAuthStore.getState()

  if (token && user) {
    if (user.role === "restaurant") {
      router.replace("/(owner)/dashboard" as any)
    } else {
      router.replace("/(tabs)/home")
    }
  } else {
    router.replace("/(auth)/login")
  }
}

  return (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.background,
    }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  )
}