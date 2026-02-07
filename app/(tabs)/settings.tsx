import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassInput } from '@/components/ui/GlassInput'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { useColorScheme } from '@/hooks/use-color-scheme'
import DataStore from '@/store/DataStore'
import { AppSettings } from '@/types'

export default function SettingsScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [stats, setStats] = useState({
    branches: 0,
    rooms: 0,
    paidRooms: 0,
    unpaidRooms: 0,
  })
  const [settings, setSettings] = useState<AppSettings>({
    waterPrice: 0,
    electricPrice: 0,
  })
  const [waterPriceInput, setWaterPriceInput] = useState('')
  const [electricPriceInput, setElectricPriceInput] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const loadStats = useCallback(async () => {
    const branches = await DataStore.getBranches()
    const rooms = await DataStore.getRooms()
    const payments = await DataStore.getPayments()

    const now = new Date()
    const currentMonth = now.toLocaleString('default', { month: 'long' })
    const currentYear = now.getFullYear()

    const paidRooms = payments.filter(
      (p: { month: string; year: number; isPaid: boolean }) =>
        p.month === currentMonth && p.year === currentYear && p.isPaid,
    ).length

    setStats({
      branches: branches.length,
      rooms: rooms.length,
      paidRooms,
      unpaidRooms: rooms.length - paidRooms,
    })
  }, [])

  const loadSettings = useCallback(async () => {
    const loadedSettings = await DataStore.getSettings()
    setSettings(loadedSettings)
    setWaterPriceInput(loadedSettings.waterPrice > 0 ? loadedSettings.waterPrice.toString() : '')
    setElectricPriceInput(loadedSettings.electricPrice > 0 ? loadedSettings.electricPrice.toString() : '')
    setHasChanges(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadStats()
      loadSettings()
    }, [loadStats, loadSettings]),
  )

  const handleWaterPriceChange = (value: string) => {
    setWaterPriceInput(value)
    setHasChanges(true)
  }

  const handleElectricPriceChange = (value: string) => {
    setElectricPriceInput(value)
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    const newSettings: AppSettings = {
      waterPrice: parseFloat(waterPriceInput) || 0,
      electricPrice: parseFloat(electricPriceInput) || 0,
    }

    await DataStore.saveSettings(newSettings)
    setSettings(newSettings)
    setHasChanges(false)
    Alert.alert('Success', 'Settings saved successfully')
  }

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await DataStore.saveBranches([])
            await DataStore.saveRooms([])
            await DataStore.saveUtilities([])
            await DataStore.savePayments([])
            Alert.alert('Success', 'All data has been cleared')
            loadStats()
          },
        },
      ],
    )
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type='title' style={styles.headerTitle}>
            Settings
          </ThemedText>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Section */}
          <View>
            <ThemedText style={styles.sectionTitle}>Overview</ThemedText>
            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard} intensity={isDark ? 30 : 50}>
                <IconSymbol name='building.2.fill' size={28} color='#0a7ea4' />
                <ThemedText type='subtitle' style={styles.statNumber}>
                  {stats.branches}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Branches</ThemedText>
              </GlassCard>
              <GlassCard style={styles.statCard} intensity={isDark ? 30 : 50}>
                <IconSymbol name='bed.double.fill' size={28} color='#30D158' />
                <ThemedText type='subtitle' style={styles.statNumber}>
                  {stats.rooms}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Rooms</ThemedText>
              </GlassCard>
            </View>

            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard} intensity={isDark ? 30 : 50}>
                <IconSymbol
                  name='checkmark.circle.fill'
                  size={28}
                  color='#30D158'
                />
                <ThemedText
                  type='title'
                  style={[styles.statNumber, styles.paidText]}
                >
                  {stats.paidRooms}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Paid This Month
                </ThemedText>
              </GlassCard>
              <GlassCard style={styles.statCard} intensity={isDark ? 30 : 50}>
                <IconSymbol
                  name='xmark.circle.fill'
                  size={28}
                  color='#FF453A'
                />
                <ThemedText
                  type='title'
                  style={[styles.statNumber, styles.unpaidText]}
                >
                  {stats.unpaidRooms}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Unpaid This Month
                </ThemedText>
              </GlassCard>
            </View>
          </View>

          {/* Utility Prices Section */}
          <View>
            <ThemedText style={styles.sectionTitle}>Utility Prices</ThemedText>
            <GlassCard style={styles.pricesCard} intensity={isDark ? 20 : 40}>
              <GlassInput
                label='Water Price ($/m³)'
                placeholder='Enter price per cubic meter'
                value={waterPriceInput}
                onChangeText={handleWaterPriceChange}
                keyboardType='decimal-pad'
                icon={
                  <IconSymbol
                    name='drop.fill'
                    size={20}
                    color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  />
                }
              />
              <View style={styles.priceSpacer} />
              <GlassInput
                label='Electric Price ($/kWh)'
                placeholder='Enter price per kWh'
                value={electricPriceInput}
                onChangeText={handleElectricPriceChange}
                keyboardType='decimal-pad'
                icon={
                  <IconSymbol
                    name='bolt.fill'
                    size={20}
                    color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  />
                }
              />
              {hasChanges && (
                <GlassButton
                  title='Save Prices'
                  onPress={handleSaveSettings}
                  variant='primary'
                  style={styles.saveButton}
                />
              )}
            </GlassCard>
          </View>

          {/* App Info */}
          <View>
            <ThemedText style={styles.sectionTitle}>About</ThemedText>
            <GlassCard style={styles.infoCard} intensity={isDark ? 20 : 40}>
              <View style={styles.infoRow}>
                <IconSymbol
                  name='info.circle'
                  size={20}
                  color={isDark ? '#FFFFFF' : '#11181C'}
                />
                <ThemedText style={styles.infoText}>
                  Room Management App
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol
                  name='number'
                  size={20}
                  color={isDark ? '#FFFFFF' : '#11181C'}
                />
                <ThemedText style={styles.infoText}>Version 1.0.0</ThemedText>
              </View>
            </GlassCard>
          </View>

          {/* Danger Zone */}
          <View>
            <ThemedText style={[styles.sectionTitle, styles.dangerTitle]}>
              Danger Zone
            </ThemedText>
            <GlassButton
              title='Clear All Data'
              onPress={handleClearAllData}
              variant='danger'
              style={styles.dangerButton}
            />
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  paidText: {
    color: '#30D158',
  },
  unpaidText: {
    color: '#FF453A',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  pricesCard: {
    marginBottom: 20,
    padding: 16,
  },
  priceSpacer: {
    height: 12,
  },
  saveButton: {
    marginTop: 16,
  },
  infoCard: {
    marginBottom: 20,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120, 120, 120, 0.1)',
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  dangerTitle: {
    color: '#FF453A',
  },
  dangerButton: {
    marginTop: 8,
  },
})
