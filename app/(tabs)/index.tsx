import { useFocusEffect, useRouter } from 'expo-router'
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
import { Branch } from '@/types'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

export default function BranchesScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [branches, setBranches] = useState<Branch[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const scrollY = useSharedValue(0)

  const loadBranches = useCallback(async () => {
    const data = await DataStore.getBranches()
    setBranches(data)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadBranches()
    }, [loadBranches]),
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadBranches()
    setRefreshing(false)
  }, [loadBranches])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const handleCreateBranch = () => {
    router.push('/branch/new')
  }

  const handleBranchPress = (branch: Branch) => {
    router.push(`/branch/${branch.id}`)
  }

  const handleEditBranch = (branch: Branch) => {
    router.push(`/branch/edit/${branch.id}`)
  }

  const handleDeleteBranch = (branch: Branch) => {
    Alert.alert(
      'Delete Branch',
      `Are you sure you want to delete "${branch.name}"? This will also delete all rooms in this branch.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await DataStore.deleteBranch(branch.id)
            loadBranches()
          },
        },
      ],
    )
  }

  const renderBranchItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
      <GlassCard
        onPress={() => handleBranchPress(item)}
        style={styles.branchCard}
        intensity={isDark ? 30 : 50}
      >
        <View style={styles.branchContent}>
          <View style={styles.branchIcon}>
            <IconSymbol
              name='building.2.fill'
              size={32}
              color={isDark ? '#64D2FF' : '#0a7ea4'}
            />
          </View>
          <View style={styles.branchInfo}>
            <ThemedText style={styles.branchName}>{item.name}</ThemedText>
            <ThemedText style={styles.branchAddress} numberOfLines={1}>
              {item.address}
            </ThemedText>
          </View>
          <View style={styles.branchActions}>
            <View
              style={styles.actionButton}
              onTouchEnd={(e) => {
                e.stopPropagation()
                handleEditBranch(item)
              }}
            >
              <IconSymbol
                name='pencil'
                size={20}
                color={isDark ? '#FFFFFF' : '#11181C'}
              />
            </View>
            <View
              style={styles.actionButton}
              onTouchEnd={(e) => {
                e.stopPropagation()
                handleDeleteBranch(item)
              }}
            >
              <IconSymbol name='trash' size={20} color='#FF453A' />
            </View>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  )

  const renderEmptyState = () => (
    <Animated.View entering={FadeIn} style={styles.emptyContainer}>
      <IconSymbol
        name='building.2'
        size={64}
        color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
      />
      <ThemedText style={styles.emptyTitle}>No Branches Yet</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Create your first branch to start managing rooms
      </ThemedText>
    </Animated.View>
  )

  return (
    <ThemedView style={styles.container}>
      <AnimatedHeader title='Branches' scrollY={scrollY} />

      <AnimatedFlatList
        data={branches}
        renderItem={renderBranchItem}
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
              Your Branches
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Manage your rental properties
            </ThemedText>
          </View>
        }
      />

      <View style={styles.fabContainer}>
        <FloatingActionButton onPress={handleCreateBranch} />
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
    fontSize: 34,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  branchCard: {
    marginBottom: 12,
    minHeight: 88,
  },
  branchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    flex: 1,
  },
  branchIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchInfo: {
    flex: 1,
    marginLeft: 16,
  },
  branchName: {
    fontSize: 17,
    fontWeight: '600',
  },
  branchAddress: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  branchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(120, 120, 120, 0.1)',
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
