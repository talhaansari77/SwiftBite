import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useState } from "react"
import { router } from "expo-router"
import { ArrowLeft, Plus, Wallet } from "lucide-react-native"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

const QUICK_AMOUNTS = [10, 20, 50, 100]

const TRANSACTIONS = [
  {
    id: "1",
    type: "credit",
    title: "Wallet Top Up",
    amount: 50,
    date: "Today, 10:30 AM",
  },
  {
    id: "2",
    type: "debit",
    title: "Order Payment",
    amount: 18.45,
    date: "Yesterday, 7:15 PM",
  },
  {
    id: "3",
    type: "credit",
    title: "Cashback Reward",
    amount: 5,
    date: "May 12, 2:00 PM",
  },
]

export default function WalletScreen() {
  const { token, user, updateUser } = useAuthStore()
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAddMoney, setShowAddMoney] = useState(false)

  const handleAddMoney = async (addAmount: number) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/wallet/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: addAmount }),
      })

      const data = await response.json()

      if (response.ok) {
        updateUser({ walletBalance: data.walletBalance })
        setShowAddMoney(false)
        setAmount("")
        Alert.alert(
          "✅ Success",
          `$${addAmount} added to your wallet!`
        )
      } else {
        Alert.alert("Error", data.message)
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong")
    } finally {
      setLoading(false)
    }
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
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View style={styles.walletIconContainer}>
              <Wallet size={28} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                ${(user?.walletBalance || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Points */}
          <View style={styles.pointsRow}>
            <View style={styles.pointsItem}>
              <Text style={styles.pointsNumber}>{user?.foodiePoints || 0}</Text>
              <Text style={styles.pointsLabel}>⭐ Foodie Points</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsItem}>
              <Text style={styles.pointsNumber}>
                ${((user?.foodiePoints || 0) * 0.01).toFixed(2)}
              </Text>
              <Text style={styles.pointsLabel}>💰 Points Value</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addMoneyButton}
            onPress={() => setShowAddMoney(!showAddMoney)}
          >
            <Plus size={18} color={Colors.white} />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Add Money Form */}
        {showAddMoney && (
          <View style={styles.addMoneyCard}>
            <Text style={styles.addMoneyTitle}>Add Money to Wallet</Text>

            {/* Quick Amounts */}
            <Text style={styles.quickLabel}>Quick Add</Text>
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmount}
                  onPress={() => handleAddMoney(quickAmount)}
                  disabled={loading}
                >
                  <Text style={styles.quickAmountText}>${quickAmount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Amount */}
            <Text style={styles.quickLabel}>Custom Amount</Text>
            <View style={styles.customAmountRow}>
              <View style={styles.customAmountInput}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={Colors.gray}
                  keyboardType="decimal-pad"
                />
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  const parsedAmount = parseFloat(amount)
                  if (!parsedAmount || parsedAmount <= 0) {
                    Alert.alert("Error", "Please enter a valid amount")
                    return
                  }
                  handleAddMoney(parsedAmount)
                }}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Points Info */}
        <View style={styles.pointsInfoCard}>
          <Text style={styles.pointsInfoTitle}>⭐ How to earn points?</Text>
          <View style={styles.pointsInfoRow}>
            <Text style={styles.pointsInfoEmoji}>🛵</Text>
            <Text style={styles.pointsInfoText}>
              Earn 10 points for every delivered order
            </Text>
          </View>
          <View style={styles.pointsInfoRow}>
            <Text style={styles.pointsInfoEmoji}>⭐</Text>
            <Text style={styles.pointsInfoText}>
              Leave a review to earn bonus points
            </Text>
          </View>
          <View style={styles.pointsInfoRow}>
            <Text style={styles.pointsInfoEmoji}>💰</Text>
            <Text style={styles.pointsInfoText}>
              100 points = $1.00 wallet credit
            </Text>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.transactionsCard}>
          <Text style={styles.transactionsTitle}>Recent Transactions</Text>
          {TRANSACTIONS.map((transaction) => (
            <View key={transaction.id} style={styles.transactionRow}>
              <View style={[
                styles.transactionIcon,
                {
                  backgroundColor: transaction.type === "credit"
                    ? "#E8F5E9"
                    : "#FFE5E5"
                }
              ]}>
                <Text style={styles.transactionEmoji}>
                  {transaction.type === "credit" ? "⬆️" : "⬇️"}
                </Text>
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>
                  {transaction.title}
                </Text>
                <Text style={styles.transactionDate}>
                  {transaction.date}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                {
                  color: transaction.type === "credit"
                    ? Colors.success
                    : Colors.error
                }
              ]}>
                {transaction.type === "credit" ? "+" : "-"}
                ${transaction.amount.toFixed(2)}
              </Text>
            </View>
          ))}
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
  balanceCard: {
    backgroundColor: Colors.primary,
    margin: 16,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  balanceTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.8)",
  },
  balanceAmount: {
    fontSize: 32,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  pointsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
  },
  pointsItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  pointsNumber: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  pointsLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255,255,255,0.8)",
  },
  pointsDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 8,
  },
  addMoneyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  addMoneyText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 15,
  },
  addMoneyCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  addMoneyTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 16,
  },
  quickLabel: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: Colors.gray,
    marginBottom: 10,
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  quickAmount: {
    flex: 1,
    backgroundColor: "#FFF0EB",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.primary,
  },
  customAmountRow: {
    flexDirection: "row",
    gap: 10,
  },
  customAmountInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  dollarSign: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
    paddingVertical: 12,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
  pointsInfoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  pointsInfoTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 14,
  },
  pointsInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  pointsInfoEmoji: {
    fontSize: 20,
    width: 30,
  },
  pointsInfoText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    flex: 1,
  },
  transactionsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionsTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 14,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionEmoji: {
    fontSize: 18,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
  },
})