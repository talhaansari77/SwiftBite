import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { useState, useCallback } from "react"
import { useFocusEffect } from "expo-router"
import { Colors } from "@/constants/colors"
import { useAuthStore } from "@/store/authStore"
import { API_URL } from "@/constants"

interface Analytics {
  totalOrders: number
  totalRevenue: number
  ordersByStatus: Record<string, number>
  popularItems: { name: string; count: number; revenue: number }[]
  revenueByDay: { day: string; revenue: number; orders: number }[]
}

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { token, user } = useAuthStore()

  const fetchAnalytics = async () => {
    try {
      // Get restaurant
      const restRes = await fetch(
        `${API_URL}/restaurants?ownerId=${user?._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const restData = await restRes.json()

      if (!restData.restaurants?.length) {
        setLoading(false)
        return
      }

      const restaurantId = restData.restaurants[0]._id

      // Get analytics
      const res = await fetch(
        `${API_URL}/orders/restaurant/${restaurantId}/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics()
    }, [])
  )

  // Find max revenue for chart scaling
  const maxRevenue = Math.max(
    ...(analytics?.revenueByDay.map((d) => d.revenue) || [1])
  )

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics 📊</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              fetchAnalytics()
            }}
          />
        }
      >

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.primary }]}>
            <Text style={styles.statNumber}>
              ${analytics?.totalRevenue.toFixed(2) || "0.00"}
            </Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#2196F3" }]}>
            <Text style={styles.statNumber}>
              {analytics?.totalOrders || 0}
            </Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#4CAF50" }]}>
            <Text style={styles.statNumber}>
              {analytics?.ordersByStatus.delivered || 0}
            </Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#F44336" }]}>
            <Text style={styles.statNumber}>
              {analytics?.ordersByStatus.cancelled || 0}
            </Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenue Last 7 Days</Text>
          <View style={styles.chart}>
            {analytics?.revenueByDay.map((day, index) => (
              <View key={index} style={styles.chartBar}>
                <Text style={styles.chartValue}>
                  {day.revenue > 0 ? `$${day.revenue}` : ""}
                </Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: maxRevenue > 0
                          ? Math.max((day.revenue / maxRevenue) * 120, 4)
                          : 4,
                        backgroundColor: day.revenue > 0
                          ? Colors.primary
                          : Colors.lightGray,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartDay}>{day.day}</Text>
                <Text style={styles.chartOrders}>
                  {day.orders > 0 ? `${day.orders}` : ""}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order Status Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Status Breakdown</Text>
          {Object.entries(analytics?.ordersByStatus || {}).map(([status, count]) => (
            <View key={status} style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      status === "delivered" ? "#4CAF50" :
                      status === "cancelled" ? "#F44336" :
                      status === "pending" ? "#FF9800" :
                      status === "preparing" ? "#9C27B0" :
                      status === "on_the_way" ? "#00BCD4" : "#2196F3"
                  }
                ]} />
                <Text style={styles.statusName}>
                  {status.replace("_", " ").charAt(0).toUpperCase() +
                   status.replace("_", " ").slice(1)}
                </Text>
              </View>
              <Text style={styles.statusCount}>{count}</Text>
            </View>
          ))}
        </View>

        {/* Popular Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔥 Popular Items</Text>
          {analytics?.popularItems.length === 0 ? (
            <Text style={styles.emptyText}>No data yet</Text>
          ) : (
            analytics?.popularItems.map((item, index) => (
              <View key={index} style={styles.popularItem}>
                <View style={styles.popularRank}>
                  <Text style={styles.popularRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.popularInfo}>
                  <Text style={styles.popularName}>{item.name}</Text>
                  <Text style={styles.popularStats}>
                    {item.count} orders · ${item.revenue.toFixed(2)} revenue
                  </Text>
                </View>
              </View>
            ))
          )}
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  statsRow: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    paddingBottom: 0,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: Colors.white,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    marginTop: 4,
    opacity: 0.9,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 0,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
    marginBottom: 16,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 180,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  chartValue: {
    fontSize: 9,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary,
    textAlign: "center",
  },
  barContainer: {
    height: 120,
    justifyContent: "flex-end",
    width: "70%",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  chartDay: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: Colors.gray,
  },
  chartOrders: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusName: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.black,
  },
  statusCount: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: Colors.black,
  },
  popularItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  popularRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  popularRankText: {
    color: Colors.white,
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
  popularInfo: {
    flex: 1,
  },
  popularName: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  popularStats: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.gray,
    textAlign: "center",
    paddingVertical: 20,
  },
})