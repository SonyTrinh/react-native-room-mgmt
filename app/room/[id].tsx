import { useCallback, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedScrollHandler,
  useSharedValue,
  FadeIn,
  FadeInUp
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { AnimatedHeader } from '@/components/ui/AnimatedHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import DataStore from '@/store/DataStore';
import { RoomWithDetails, UtilityUsage, Payment } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { format } from 'date-fns';

export default function RoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [room, setRoom] = useState<RoomWithDetails | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);

  const loadRoom = useCallback(async () => {
    if (!id) return;
    const roomData = await DataStore.getRoomWithDetails(id);
    if (roomData) {
      setRoom(roomData);
    }
  }, [id]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleAddUtility = () => {
    router.push(`/room/${id}/utility`);
  };

  const handleRecordPayment = () => {
    router.push(`/room/${id}/payment`);
  };

  const handleEditRoom = () => {
    router.push(`/room/edit/${id}`);
  };

  const handleDeleteRoom = () => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete "${room?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            if (room) {
              await DataStore.deleteRoom(room.id);
              router.back();
            }
          }
        },
      ]
    );
  };

  const getCurrentMonthPayment = () => {
    if (!room) return null;
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();
    
    return room.payments?.find(
      (p: Payment) => p.month === currentMonth && p.year === currentYear
    );
  };

  const getCurrentMonthUtility = () => {
    if (!room) return null;
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();
    
    return room.utilities?.find(
      (u: UtilityUsage) => u.month === currentMonth && u.year === currentYear
    );
  };

  const currentPayment = getCurrentMonthPayment();
  const currentUtility = getCurrentMonthUtility();
  const isPaid = currentPayment?.isPaid || false;

  if (!room) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AnimatedHeader
        title={room.name}
        scrollY={scrollY}
        onBack={() => router.back()}
        rightAction={{
          icon: 'pencil',
          onPress: handleEditRoom,
        }}
      />
      
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Room Header */}
        <Animated.View entering={FadeInUp} style={styles.header}>
          <View style={styles.roomIcon}>
            <IconSymbol name="bed.double.fill" size={40} color={isDark ? '#64D2FF' : '#0a7ea4'} />
          </View>
          <ThemedText style={styles.roomName}>{room.name}</ThemedText>
          <ThemedText style={styles.rentText}>
            ${room.monthlyRent}/month
          </ThemedText>
          <View style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.unpaidBadge]}>
            <ThemedText style={[styles.statusText, isPaid ? styles.paidText : styles.unpaidText]}>
              {isPaid ? 'Paid This Month' : 'Payment Due'}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Tenant Information */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <ThemedText style={styles.sectionTitle}>Tenant Information</ThemedText>
          <GlassCard style={styles.infoCard} intensity={isDark ? 30 : 50}>
            <View style={styles.infoRow}>
              <IconSymbol name="person.fill" size={20} color={isDark ? '#FFFFFF' : '#11181C'} />
              <ThemedText style={styles.infoText}>{room.host.name}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <IconSymbol name="phone.fill" size={20} color={isDark ? '#FFFFFF' : '#11181C'} />
              <ThemedText style={styles.infoText}>{room.host.phone || 'No phone'}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <IconSymbol name="mappin.and.ellipse" size={20} color={isDark ? '#FFFFFF' : '#11181C'} />
              <ThemedText style={styles.infoText}>{room.host.address || 'No address'}</ThemedText>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Current Month Utilities */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <ThemedText style={styles.sectionTitle}>Current Month Utilities</ThemedText>
          {currentUtility ? (
            <GlassCard style={styles.utilityCard} intensity={isDark ? 30 : 50}>
              <View style={styles.utilityRow}>
                <View style={styles.utilityItem}>
                  <IconSymbol name="bolt.fill" size={24} color="#FFD60A" />
                  <ThemedText style={styles.utilityValue}>{currentUtility.electricUsage} kWh</ThemedText>
                  <ThemedText style={styles.utilityCost}>${currentUtility.electricCost}</ThemedText>
                </View>
                <View style={styles.utilityDivider} />
                <View style={styles.utilityItem}>
                  <IconSymbol name="drop.fill" size={24} color="#0A84FF" />
                  <ThemedText style={styles.utilityValue}>{currentUtility.waterUsage} m³</ThemedText>
                  <ThemedText style={styles.utilityCost}>${currentUtility.waterCost}</ThemedText>
                </View>
              </View>
            </GlassCard>
          ) : (
            <GlassCard style={styles.emptyCard} intensity={isDark ? 20 : 40}>
              <ThemedText style={styles.emptyText}>No utility data for this month</ThemedText>
            </GlassCard>
          )}
        </Animated.View>

        {/* Payment History */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <ThemedText style={styles.sectionTitle}>Payment History</ThemedText>
          {room.payments?.length > 0 ? (
            room.payments.map((payment: Payment, index: number) => (
              <GlassCard key={payment.id} style={styles.paymentCard} intensity={isDark ? 20 : 40}>
                <View style={styles.paymentRow}>
                  <View>
                    <ThemedText style={styles.paymentMonth}>
                      {payment.month} {payment.year}
                    </ThemedText>
                    <ThemedText style={styles.paymentDate}>
                      {payment.isPaid && payment.paidAt 
                        ? `Paid on ${format(new Date(payment.paidAt), 'MMM d, yyyy')}`
                        : 'Not paid'}
                    </ThemedText>
                  </View>
                  <View style={styles.paymentRight}>
                    <ThemedText style={styles.paymentAmount}>${payment.amount}</ThemedText>
                    <View style={[styles.paymentStatus, payment.isPaid ? styles.paidStatus : styles.unpaidStatus]}>
                      <ThemedText style={styles.paymentStatusText}>
                        {payment.isPaid ? 'Paid' : 'Pending'}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </GlassCard>
            ))
          ) : (
            <GlassCard style={styles.emptyCard} intensity={isDark ? 20 : 40}>
              <ThemedText style={styles.emptyText}>No payment history</ThemedText>
            </GlassCard>
          )}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.actionsContainer}>
          <GlassButton
            title="Record Payment"
            onPress={handleRecordPayment}
            variant="primary"
            style={styles.actionButton}
          />
          <GlassButton
            title="Delete Room"
            onPress={handleDeleteRoom}
            variant="danger"
            style={styles.actionButton}
          />
        </Animated.View>
      </Animated.ScrollView>

      <View style={styles.fabContainer}>
        <FloatingActionButton onPress={handleAddUtility} icon="bolt.badge.a" />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  roomIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roomName: {
    fontSize: 28,
    fontWeight: '700',
  },
  rentText: {
    fontSize: 18,
    opacity: 0.6,
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paidBadge: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  unpaidBadge: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paidText: {
    color: '#30D158',
  },
  unpaidText: {
    color: '#FF453A',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
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
  utilityCard: {
    marginBottom: 20,
    padding: 16,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  utilityItem: {
    flex: 1,
    alignItems: 'center',
  },
  utilityDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(120, 120, 120, 0.2)',
  },
  utilityValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  utilityCost: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  paymentCard: {
    marginBottom: 8,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMonth: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentDate: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentStatus: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paidStatus: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  unpaidStatus: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    marginBottom: 20,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
  },
  actionsContainer: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 100,
  },
});
