import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native"
import { useState } from "react"
import { router } from "expo-router"
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react-native"
import { Colors } from "@/constants/colors"

const FAQS = [
  {
    question: "How do I track my order?",
    answer: "You can track your order in real-time by going to Orders tab and tapping on your active order. You'll see a live map with the driver's location.",
  },
  {
    question: "How do I cancel my order?",
    answer: "You can cancel your order within 2 minutes of placing it. Go to Orders → tap your order → tap Cancel. After 2 minutes, please contact support.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We currently accept Cash on Delivery. Online payment options including credit/debit cards and digital wallets are coming soon!",
  },
  {
    question: "How do I apply a promo code?",
    answer: "Go to your cart, tap 'Add a promo code', enter your code and tap Apply. The discount will be automatically applied to your order total.",
  },
  {
    question: "What if my order is wrong or missing items?",
    answer: "We're sorry about that! Please contact our support team within 24 hours of delivery with your order number and we'll make it right.",
  },
  {
    question: "How do I earn Foodie Points?",
    answer: "You earn 10 Foodie Points for every delivered order. Points can be redeemed for wallet credits. 100 points = $1.00.",
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery times vary by restaurant and location. You can see the estimated delivery time on each restaurant's page before ordering.",
  },
  {
    question: "Can I schedule a delivery?",
    answer: "Scheduled delivery is coming soon! Currently all orders are delivered as soon as possible.",
  },
]

export default function SupportScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSubject("")
      setMessage("")
      Alert.alert(
        "✅ Message Sent!",
        "We've received your message and will get back to you within 24 hours."
      )
    }, 1500)
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={22} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎧</Text>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            We're here to help 24/7
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => Linking.openURL("tel:+1234567890")}
            >
              <View style={[styles.contactIcon, { backgroundColor: "#E8F5E9" }]}>
                <Phone size={22} color="#4CAF50" />
              </View>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactSubtitle}>Available 24/7</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => Linking.openURL("mailto:support@swiftbite.com")}
            >
              <View style={[styles.contactIcon, { backgroundColor: "#E3F2FD" }]}>
                <Mail size={22} color="#2196F3" />
              </View>
              <Text style={styles.contactTitle}>Email Us</Text>
              <Text style={styles.contactSubtitle}>Reply in 24hrs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => Linking.openURL("https://wa.me/1234567890")}
            >
              <View style={[styles.contactIcon, { backgroundColor: "#E8F5E9" }]}>
                <MessageCircle size={22} color="#25D366" />
              </View>
              <Text style={styles.contactTitle}>WhatsApp</Text>
              <Text style={styles.contactSubtitle}>Chat with us</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Frequently Asked Questions
          </Text>
          <View style={styles.faqList}>
            {FAQS.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => setExpandedFaq(
                  expandedFaq === index ? null : index
                )}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {expandedFaq === index ? (
                    <ChevronUp size={18} color={Colors.primary} />
                  ) : (
                    <ChevronDown size={18} color={Colors.gray} />
                  )}
                </View>
                {expandedFaq === index && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Send Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <View style={styles.messageCard}>
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="What's your issue about?"
              placeholderTextColor={Colors.gray}
            />

            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue in detail..."
              placeholderTextColor={Colors.gray}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Send size={18} color={Colors.white} />
                  <Text style={styles.sendButtonText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinksCard}>
            {[
              { title: "Terms & Conditions", emoji: "📄" },
              { title: "Privacy Policy", emoji: "🔒" },
              { title: "Refund Policy", emoji: "💰" },
              { title: "About SwiftBite", emoji: "ℹ️" },
            ].map((link, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickLink,
                  index < 3 && styles.quickLinkBorder,
                ]}
              >
                <Text style={styles.quickLinkEmoji}>{link.emoji}</Text>
                <Text style={styles.quickLinkText}>{link.title}</Text>
                <ChevronRight size={16} color={Colors.gray} />
              </TouchableOpacity>
            ))}
          </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  hero: {
    backgroundColor: Colors.primary,
    padding: 30,
    alignItems: "center",
    gap: 8,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.8)",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 14,
  },
  contactGrid: {
    flexDirection: "row",
    gap: 10,
  },
  contactCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  contactSubtitle: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 12,
    lineHeight: 20,
  },
  messageCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 13,
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
  messageInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sendButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 15,
  },
  quickLinksCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  quickLinkBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quickLinkEmoji: {
    fontSize: 20,
  },
  quickLinkText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
})