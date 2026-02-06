import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import DataStore from '@/store/DataStore';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [stats, setStats] = useState({
    branches: 0,
    rooms: 0,
    paidRooms: 0,
    unpaidRooms: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const branches = await DataStore.getBranches();
    const rooms = await DataStore.getRooms();
    const payments = await DataStore.getPayments();
    
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();
    
    const paidRooms = payments.filter(
      p => p.month === currentMonth && p.year === currentYear && p.isPaid
    ).length;
    
    setStats({
      branches: branches.length,
      rooms: rooms.length,
      paidRooms,
      unpaidRooms: rooms.length - paidRooms,
    });
  };

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
            await DataStore.saveBranches([]);
            await DataStore.saveRooms([]);
            await DataStore.saveUtilities([]);
            await DataStore.savePayments([]);
            Alert.alert('Success', 'All data has been cleared');
            loadStats();
          }
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Settings</ThemedText>
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
                <IconSymbol name="building.2.fill" size={28} color="#0a7ea4" />
                <ThemedText style={styles.statNumber}>{stats.branches}</ThemedText>
                <ThemedText style={styles.statLabel}>Branches</ThemedText>
              </GlassCard>
              <GlassCard style={styles.statCard} intensity={isDark ? 30 : 50}>
                <IconSymbol name="bed.double.fill" size={28} color="#30D158" />
                <ThemedText style={styles.statNumber}>{stats.rooms}</ThemedText>
                <ThemedText style={styles.statLabel}>Rooms</ThemedText>
              </GlassCard>
            </View>
            
            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard} intensity={isDark ? 30 : 50}>
                <IconSymbol name="checkmark.circle.fill" size={28} color="#30D158" />
                <ThemedText style={[styles.statNumber, styles.paidText]}>{stats.paidRooms}</ThemedText>
                <ThemedText style={styles.statLabel}>Paid This Month</ThemedText>
              </GlassCard>
              <GlassCard style={styles.statCard} intensity={isDark ? 30 : 50}>
                <IconSymbol name="xmark.circle.fill" size={28} color="#FF453A" />
                <ThemedText style={[styles.statNumber, styles.unpaidText]}>{stats.unpaidRooms}</ThemedText>
                <ThemedText style={styles.statLabel}>Unpaid This Month</ThemedText>
              </GlassCard>
            </View>
          </View>

          {/* App Info */}
          <View>
            <ThemedText style={styles.sectionTitle}>About</ThemedText>
            <GlassCard style={styles.infoCard} intensity={isDark ? 20 : 40}>
              <View style={styles.infoRow}>
                <IconSymbol name="info.circle" size={20} color={isDark ? '#FFFFFF' : '#11181C'} />
                <ThemedText style={styles.infoText}>Room Management App</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <IconSymbol name="number" size={20} color={isDark ? '#FFFFFF' : '#11181C'} />
                <ThemedText style={styles.infoText}>Version 1.0.0</ThemedText>
              </View>
            </GlassCard>
          </View>

          {/* Danger Zone */}
          <View>
            <ThemedText style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</ThemedText>
            <GlassButton
              title="Clear All Data"
              onPress={handleClearAllData}
              variant="danger"
              style={styles.dangerButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
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
});
