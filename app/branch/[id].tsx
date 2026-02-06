import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { AnimatedHeader } from '@/components/ui/AnimatedHeader'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useColorScheme } from '@/hooks/use-color-scheme'
import DataStore from '@/store/DataStore'
import { Branch, Room } from '@/types'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

export default function BranchDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [branch, setBranch] = useState<Branch | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const scrollY = useSharedValue(0)

  const loadData = useCallback(async () => {
    if (!id) return
    const branchData = await DataStore.getBranchWithRooms(id)
    if (branchData) {
      setBranch(branchData)
      setRooms(branchData.rooms)
    }
  }, [id])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [loadData]),
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const handleCreateRoom = () => {
    router.push(`/room/new?branchId=${id}`)
  }

  const handleRoomPress = (room: Room) => {
    router.push(`/room/${room.id}`)
  }

  const handleEditRoom = (room: Room) => {
    router.push(`/room/edit/${room.id}`)
  }

  const handleDeleteRoom = (room: Room) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${room.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await DataStore.deleteRoom(room.id)
            loadData()
          },
        },
      ],
    )
  }

  const getPaymentStatus = (room: Room) => {
    const now = new Date()
    const currentMonth = now.toLocaleString('default', { month: 'long' })
    const currentYear = now.getFullYear()

    const payment = room.payments?.find(
      (p) => p.month === currentMonth && p.year === currentYear,
    )

    return payment?.isPaid || false
  }

  const renderRoomItem = ({ item, index }: { item: any; index: number }) => {
    const isPaid = getPaymentStatus(item)

    return (
      <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
        <GlassCard
          onPress={() => handleRoomPress(item)}
          style={styles.roomCard}
          intensity={isDark ? 30 : 50}
        >
          <View style={styles.roomContent}>
            <View style={styles.roomHeader}>
              <View style={styles.roomIcon}>
                <IconSymbol
                  name='bed.double.fill'
                  size={28}
                  color={isDark ? '#64D2FF' : '#0a7ea4'}
                />
              </View>
              <View style={styles.roomInfo}>
                <ThemedText style={styles.roomName}>{item.name}</ThemedText>
                <ThemedText style={styles.roomHost} numberOfLines={1}>
                  {item.host?.name || 'No tenant'}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  isPaid ? styles.paidBadge : styles.unpaidBadge,
                ]}
              >
                <ThemedText
                  style={[
                    styles.statusText,
                    isPaid ? styles.paidText : styles.unpaidText,
                  ]}
                >
                  {isPaid ? 'Paid' : 'Unpaid'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.roomDetails}>
              <View style={styles.detailItem}>
                <IconSymbol
                  name='bolt.fill'
                  size={16}
                  color={isDark ? '#FFD60A' : '#FF9500'}
                />
                <ThemedText style={styles.detailText}>
                  ${item.monthlyRent || 0}/month
                </ThemedText>
              </View>
              <View style={styles.detailItem}>
                <IconSymbol
                  name='phone.fill'
                  size={16}
                  color={isDark ? '#30D158' : '#34C759'}
                />
                <ThemedText style={styles.detailText}>
                  {item.host?.phone || 'No phone'}
                </ThemedText>
              </View>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    )
  }

  const renderEmptyState = () => (
    <Animated.View entering={FadeIn} style={styles.emptyContainer}>
      <IconSymbol
        name='bed.double'
        size={64}
        color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
      />
      <ThemedText style={styles.emptyTitle}>No Rooms Yet</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Add your first room to this branch
      </ThemedText>
    </Animated.View>
  )

  if (!branch) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <AnimatedHeader
        title={branch.name}
        scrollY={scrollY}
        onBack={() => router.back()}
      />

      <AnimatedFlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#FFFFFF' : '#11181C'}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type='title' style={styles.headerTitle}>
              {branch.name}
            </ThemedText>
            <ThemedText style={styles.headerAddress}>
              {branch.address}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}
            </ThemedText>
          </View>
        }
      />

      <View style={styles.fabContainer}>
        <FloatingActionButton onPress={handleCreateRoom} />
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerAddress: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.5,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  roomCard: {
    marginBottom: 12,
  },
  roomContent: {
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '600',
  },
  roomHost: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  unpaidBadge: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paidText: {
    color: '#30D158',
  },
  unpaidText: {
    color: '#FF453A',
  },
  roomDetails: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(120, 120, 120, 0.1)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    opacity: 0.7,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 8,
    textAlign: 'center',
  },
})
