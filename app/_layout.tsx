import { useEffect } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import * as SplashScreen from "expo-splash-screen"
import { useFonts } from "expo-font"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) return null

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(owner)" />
        <Stack.Screen name="restaurant/[id]" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="addresses" />
        <Stack.Screen name="favourites" />
        <Stack.Screen name="wallet" />
        <Stack.Screen name="coupons" />
        <Stack.Screen name="support" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </>
  )
}