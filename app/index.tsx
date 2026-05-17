import { useEffect } from "react"
import { router } from "expo-router"
import { useAuthStore } from "@/store/authStore"
import { View, ActivityIndicator, Image } from "react-native"
import { Colors } from "@/constants/colors"

export default function Index() {
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    setTimeout(() => {
      if (isAuthenticated) {
        // Route based on role
        if (user?.role === "restaurant") {
          router.replace("/(owner)/dashboard")
        } else {
          router.replace("/(tabs)/home")
        }
      } else {
        router.replace("/(auth)/login")
      }
    }, 500)
  }, [])

  return (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors.background
    }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  )
}