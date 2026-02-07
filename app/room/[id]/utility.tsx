import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassInput } from '@/components/ui/GlassInput'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useColorScheme } from '@/hooks/use-color-scheme'
import DataStore from '@/store/DataStore'
import { AppSettings, Room } from '@/types'

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function RecordUtilityScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const [room, setRoom] = useState<Room | null>(null)
  const [settings, setSettings] = useState<AppSettings>({
    waterPrice: 0,
    electricPrice: 0,
  })
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [electricUsage, setElectricUsage] = useState('')
  const [waterUsage, setWaterUsage] = useState('')
  const [electricCost, setElectricCost] = useState('')
  const [waterCost, setWaterCost] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadRoom()
    loadSettings()
  }, [id])

  const loadRoom = async () => {
    const rooms = await DataStore.getRooms()
    const found = rooms.find((r) => r.id === id)
    if (found) {
      setRoom(found)
    }
  }

  const loadSettings = async () => {
    const loadedSettings = await DataStore.getSettings()
    setSettings(loadedSettings)
  }

  // Auto-calculate electric cost when usage changes
  const handleElectricUsageChange = useCallback(
    (value: string) => {
      setElectricUsage(value)
      const usage = parseFloat(value) || 0
      const cost = usage * settings.electricPrice
      setElectricCost(cost > 0 ? cost.toFixed(2) : '')
    },
    [settings.electricPrice],
  )

  // Auto-calculate water cost when usage changes
  const handleWaterUsageChange = useCallback(
    (value: string) => {
      setWaterUsage(value)
      const usage = parseFloat(value) || 0
      const cost = usage * settings.waterPrice
      setWaterCost(cost > 0 ? cost.toFixed(2) : '')
    },
    [settings.waterPrice],
  )

  // Allow manual override of costs
  const handleElectricCostChange = (value: string) => {
    setElectricCost(value)
  }

  const handleWaterCostChange = (value: string) => {
    setWaterCost(value)
  }

  const handleSave = async () => {
    if (!electricUsage.trim() || !waterUsage.trim()) {
      Alert.alert('Error', 'Please enter utility usage values')
      return
    }

    setIsLoading(true)
    try {
      await DataStore.createUtility({
        roomId: id,
        month: months[selectedMonth],
        year: selectedYear,
        electricUsage: parseFloat(electricUsage) || 0,
        waterUsage: parseFloat(waterUsage) || 0,
        electricCost: parseFloat(electricCost) || 0,
        waterCost: parseFloat(waterCost) || 0,
      })
      router.back()
    } catch (error) {
      Alert.alert('Error', 'Failed to record utility usage')
    } finally {
      setIsLoading(false)
    }
  }

  const totalCost =
    (parseFloat(electricCost) || 0) + (parseFloat(waterCost) || 0)

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol
              name='chevron.left'
              size={28}
              color={isDark ? '#FFFFFF' : '#11181C'}
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Record Utilities</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(100)}>
            <ThemedText style={styles.sectionTitle}>Period</ThemedText>
            <View style={styles.periodContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    onPress={() => setSelectedMonth(index)}
                    style={[
                      styles.monthButton,
                      selectedMonth === index && styles.selectedMonth,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.monthText,
                        selectedMonth === index && styles.selectedMonthText,
                      ]}
                    >
                      {month.substring(0, 3)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.yearContainer}>
                <TouchableOpacity
                  onPress={() => setSelectedYear(selectedYear - 1)}
                >
                  <IconSymbol
                    name='chevron.left'
                    size={24}
                    color={isDark ? '#FFFFFF' : '#11181C'}
                  />
                </TouchableOpacity>
                <ThemedText style={styles.yearText}>{selectedYear}</ThemedText>
                <TouchableOpacity
                  onPress={() => setSelectedYear(selectedYear + 1)}
                >
                  <IconSymbol
                    name='chevron.right'
                    size={24}
                    color={isDark ? '#FFFFFF' : '#11181C'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)}>
            <View style={styles.priceInfoContainer}>
              <ThemedText style={styles.sectionTitle}>
                Electric Usage
              </ThemedText>
              {settings.electricPrice > 0 && (
                <ThemedText style={styles.priceInfo}>
                  ${settings.electricPrice.toFixed(2)}/kWh
                </ThemedText>
              )}
            </View>
            <GlassInput
              label='Usage (kWh)'
              placeholder='Enter electric usage'
              value={electricUsage}
              onChangeText={handleElectricUsageChange}
              keyboardType='decimal-pad'
              icon={
                <IconSymbol
                  name='bolt.fill'
                  size={20}
                  color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                />
              }
            />
            <GlassInput
              label='Cost ($)'
              placeholder='Auto-calculated from usage'
              value={electricCost}
              onChangeText={handleElectricCostChange}
              keyboardType='decimal-pad'
              icon={
                <IconSymbol
                  name='dollarsign.circle'
                  size={20}
                  color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                />
              }
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)}>
            <View style={styles.priceInfoContainer}>
              <ThemedText style={styles.sectionTitle}>Water Usage</ThemedText>
              {settings.waterPrice > 0 && (
                <ThemedText style={styles.priceInfo}>
                  ${settings.waterPrice.toFixed(2)}/m³
                </ThemedText>
              )}
            </View>
            <GlassInput
              label='Usage (m³)'
              placeholder='Enter water usage'
              value={waterUsage}
              onChangeText={handleWaterUsageChange}
              keyboardType='decimal-pad'
              icon={
                <IconSymbol
                  name='drop.fill'
                  size={20}
                  color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                />
              }
            />
            <GlassInput
              label='Cost ($)'
              placeholder='Auto-calculated from usage'
              value={waterCost}
              onChangeText={handleWaterCostChange}
              keyboardType='decimal-pad'
              icon={
                <IconSymbol
                  name='dollarsign.circle'
                  size={20}
                  color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                />
              }
            />
          </Animated.View>

          {totalCost > 0 && (
            <Animated.View
              entering={FadeInUp.delay(350)}
              style={styles.totalContainer}
            >
              <GlassCard style={styles.totalCard} intensity={isDark ? 30 : 50}>
                <ThemedText style={styles.totalLabel}>
                  Total Utility Cost
                </ThemedText>
                <ThemedText type='title' style={styles.totalAmount}>
                  ${totalCost.toFixed(2)}
                </ThemedText>
              </GlassCard>
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInUp.delay(400)}
            style={styles.buttonContainer}
          >
            <GlassButton
              title='Cancel'
              onPress={() => router.back()}
              variant='secondary'
              style={styles.button}
            />
            <GlassButton
              title={isLoading ? 'Saving...' : 'Save Record'}
              onPress={handleSave}
              variant='primary'
              style={styles.button}
              disabled={isLoading}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  periodContainer: {
    marginBottom: 20,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(120, 120, 120, 0.1)',
  },
  selectedMonth: {
    backgroundColor: 'rgba(10, 126, 164, 0.3)',
  },
  monthText: {
    fontSize: 14,
  },
  selectedMonthText: {
    fontWeight: '600',
    color: '#0a7ea4',
  },
  yearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 20,
  },
  yearText: {
    fontSize: 20,
    fontWeight: '600',
  },
  priceInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  totalContainer: {
    marginTop: 20,
  },
  totalCard: {
    padding: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    opacity: 0.6,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
    color: '#30D158',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
  },
})
