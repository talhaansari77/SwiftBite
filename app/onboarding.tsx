import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from "react-native"
import { useState, useRef } from "react"
import { router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Colors } from "@/constants/colors"

const { width, height } = Dimensions.get("window")

const SLIDES = [
  {
    id: 1,
    emoji: "🍔",
    foodEmojis: ["🍔", "🥤", "🍜"],
    title: "Delicious Food,\nDelivered Fast",
    subtitle:
      "Order from your favorite restaurants and get it delivered to your door.",
    bg: "#FFF8F5",
    decorations: ["🍕", "⭐", "🍟"],
  },
  {
    id: 2,
    emoji: "📱",
    foodEmojis: ["🍕", "🍔", "🍱", "🧁"],
    title: "Explore. Choose.\nEnjoy.",
    subtitle:
      "Explore a wide variety of cuisines and pick what makes you happy.",
    bg: "#FFF8F5",
    decorations: ["🌮", "✨", "🍣"],
  },
  {
    id: 3,
    emoji: "🛵",
    foodEmojis: ["🛵", "📍", "⚡"],
    title: "Live Tracking,\nOn-Time Delivery",
    subtitle:
      "Track your order in real-time and get it hot & fresh on time.",
    bg: "#FFF8F5",
    decorations: ["🏠", "💨", "✅"],
  },
]

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)
  const fadeAnim = useRef(new Animated.Value(1)).current

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true })
    } else {
      await handleGetStarted()
    }
  }

  const handleSkip = async () => {
    await handleGetStarted()
  }

  const handleGetStarted = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true")
    router.replace("/(auth)/login")
  }

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width)
    setCurrentIndex(index)
  }

  const isLast = currentIndex === SLIDES.length - 1

  return (
    <View style={styles.container}>

      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View
            key={slide.id}
            style={[styles.slide, { backgroundColor: slide.bg }]}
          >
            {/* Decorative circles */}
            <View style={styles.circleDecoration1} />
            <View style={styles.circleDecoration2} />

            {/* Decorations scattered */}
            <Text style={styles.decoration1}>{slide.decorations[0]}</Text>
            <Text style={styles.decoration2}>{slide.decorations[1]}</Text>
            <Text style={styles.decoration3}>{slide.decorations[2]}</Text>

            {/* Main illustration */}
            <View style={styles.illustrationContainer}>
              {index === 0 && (
                <View style={styles.illustration}>
                  <View style={styles.illustrationCircle}>
                    <Text style={styles.mainEmoji}>🍔</Text>
                  </View>
                  <Text style={styles.sideEmoji1}>🥤</Text>
                  <Text style={styles.sideEmoji2}>🍜</Text>
                </View>
              )}
              {index === 1 && (
                <View style={styles.illustration}>
                  {/* Phone mockup */}
                  <View style={styles.phoneMockup}>
                    <View style={styles.phoneScreen}>
                      <Text style={styles.phoneHeader}>Hi, Alex 👋</Text>
                      <Text style={styles.phoneSubHeader}>
                        What would you like to order?
                      </Text>
                      <View style={styles.phoneSearch}>
                        <Text style={styles.phoneSearchText}>
                          🔍 Search for food...
                        </Text>
                      </View>
                      <Text style={styles.phoneCategories}>
                        🍕 🍔 🍱 🧁
                      </Text>
                      <View style={styles.phoneCard}>
                        <Text style={styles.phoneCardText}>🍔 Burger Hub</Text>
                        <Text style={styles.phoneCardMeta}>
                          ⭐ 4.5 • 30-40 min
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.sideEmoji1}>🍕</Text>
                  <Text style={styles.sideEmoji2}>🍜</Text>
                </View>
              )}
              {index === 2 && (
                <View style={styles.illustration}>
                  <View style={styles.illustrationCircle}>
                    <Text style={styles.mainEmoji}>🛵</Text>
                  </View>
                  <Text style={styles.sideEmoji1}>📍</Text>
                  <Text style={styles.sideEmoji2}>⚡</Text>
                  {/* Dotted path */}
                  <View style={styles.dottedPath}>
                    {[...Array(6)].map((_, i) => (
                      <View key={i} style={styles.pathDot} />
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Branding on first slide */}
            {index === 0 && (
              <View style={styles.brandingRow}>
                <Text style={styles.brandingEmoji}>🍽️</Text>
                <Text style={styles.brandingText}>
                  <Text style={styles.brandingSwift}>Swift</Text>
                  <Text style={styles.brandingBite}>bite</Text>
                </Text>
              </View>
            )}

          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>

        {/* Text Content */}
        <Animated.View style={[styles.textContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
          <Text style={styles.subtitle}>{SLIDES[currentIndex].subtitle}</Text>
        </Animated.View>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setCurrentIndex(index)
                scrollRef.current?.scrollTo({ x: index * width, animated: true })
              }}
            >
              <View style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {isLast ? "Get Started" : "Next"}
          </Text>
          <Text style={styles.buttonArrow}>→</Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F5",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.gray,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  circleDecoration1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,107,53,0.08)",
    top: -80,
    right: -80,
  },
  circleDecoration2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,107,53,0.06)",
    bottom: 20,
    left: -60,
  },
  decoration1: {
    position: "absolute",
    top: 100,
    left: 20,
    fontSize: 28,
    opacity: 0.4,
  },
  decoration2: {
    position: "absolute",
    top: 80,
    right: 30,
    fontSize: 20,
    opacity: 0.5,
  },
  decoration3: {
    position: "absolute",
    bottom: 60,
    right: 20,
    fontSize: 24,
    opacity: 0.4,
  },
  illustrationContainer: {
    width: width * 0.8,
    height: height * 0.35,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  illustration: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  illustrationCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,107,53,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,107,53,0.15)",
    borderStyle: "dashed",
  },
  mainEmoji: {
    fontSize: 80,
  },
  sideEmoji1: {
    position: "absolute",
    top: 20,
    right: 10,
    fontSize: 48,
  },
  sideEmoji2: {
    position: "absolute",
    bottom: 20,
    left: 10,
    fontSize: 44,
  },
  phoneMockup: {
    width: 180,
    height: 280,
    backgroundColor: Colors.black,
    borderRadius: 24,
    padding: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    overflow: "hidden",
  },
  phoneHeader: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  phoneSubHeader: {
    fontSize: 9,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  phoneSearch: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 6,
    marginTop: 8,
  },
  phoneSearchText: {
    fontSize: 8,
    color: Colors.gray,
    fontFamily: "Poppins-Regular",
  },
  phoneCategories: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    letterSpacing: 4,
  },
  phoneCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  phoneCardText: {
    fontSize: 9,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  phoneCardMeta: {
    fontSize: 8,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  dottedPath: {
    position: "absolute",
    top: 30,
    right: 20,
    flexDirection: "row",
    gap: 6,
    transform: [{ rotate: "20deg" }],
  },
  pathDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    opacity: 0.5,
  },
  brandingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  brandingEmoji: {
    fontSize: 32,
  },
  brandingText: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
  },
  brandingSwift: {
    color: Colors.black,
    fontFamily: "Poppins-Bold",
  },
  brandingBite: {
    color: Colors.primary,
    fontFamily: "Poppins-Bold",
  },
  bottomSection: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  textContent: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: "Poppins-Bold",
  },
  buttonArrow: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: "Poppins-Bold",
  },
})