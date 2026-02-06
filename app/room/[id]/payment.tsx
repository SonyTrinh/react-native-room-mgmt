import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert, TouchableOpacity, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import DataStore from '@/store/DataStore';
import { Room, Payment } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function RecordPaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [existingPayment, setExistingPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [id]);

  useEffect(() => {
    checkExistingPayment();
  }, [selectedMonth, selectedYear]);

  const loadRoom = async () => {
    const rooms = await DataStore.getRooms();
    const found = rooms.find(r => r.id === id);
    if (found) {
      setRoom(found);
      setAmount(found.monthlyRent?.toString() || '');
    }
  };

  const checkExistingPayment = async () => {
    if (!id) return;
    const payment = await DataStore.getPaymentForMonth(
      id,
      months[selectedMonth],
      selectedYear
    );
    if (payment) {
      setExistingPayment(payment);
      setAmount(payment.amount.toString());
      setIsPaid(payment.isPaid);
    } else {
      setExistingPayment(null);
      setIsPaid(false);
      if (room) {
        setAmount(room.monthlyRent?.toString() || '');
      }
    }
  };

  const handleSave = async () => {
    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter payment amount');
      return;
    }

    setIsLoading(true);
    try {
      if (existingPayment) {
        await DataStore.updatePayment(existingPayment.id, {
          amount: parseFloat(amount) || 0,
          isPaid,
          paidAt: isPaid ? new Date().toISOString() : undefined,
        });
      } else {
        await DataStore.createPayment({
          roomId: id,
          month: months[selectedMonth],
          year: selectedYear,
          amount: parseFloat(amount) || 0,
          isPaid,
          paidAt: isPaid ? new Date().toISOString() : undefined,
        });
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={28} color={isDark ? '#FFFFFF' : '#11181C'} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Record Payment</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(100)}>
            <ThemedText style={styles.sectionTitle}>Payment Period</ThemedText>
            <View style={styles.periodContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    onPress={() => setSelectedMonth(index)}
                    style={[
                      styles.monthButton,
                      selectedMonth === index && styles.selectedMonth
                    ]}
                  >
                    <ThemedText style={[
                      styles.monthText,
                      selectedMonth === index && styles.selectedMonthText
                    ]}>
                      {month.substring(0, 3)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.yearContainer}>
                <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
                  <IconSymbol name="chevron.left" size={24} color={isDark ? '#FFFFFF' : '#11181C'} />
                </TouchableOpacity>
                <ThemedText style={styles.yearText}>{selectedYear}</ThemedText>
                <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
                  <IconSymbol name="chevron.right" size={24} color={isDark ? '#FFFFFF' : '#11181C'} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)}>
            <ThemedText style={styles.sectionTitle}>Payment Details</ThemedText>
            <GlassInput
              label="Amount ($)"
              placeholder="Enter payment amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              icon={<IconSymbol name="dollarsign.circle" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)}>
            <GlassCard style={styles.switchCard} intensity={isDark ? 30 : 50}>
              <View style={styles.switchRow}>
                <View style={styles.switchInfo}>
                  <IconSymbol 
                    name={isPaid ? "checkmark.circle.fill" : "xmark.circle.fill"} 
                    size={24} 
                    color={isPaid ? '#30D158' : '#FF453A'} 
                  />
                  <ThemedText style={styles.switchLabel}>
                    {isPaid ? 'Payment Received' : 'Payment Pending'}
                  </ThemedText>
                </View>
                <Switch
                  value={isPaid}
                  onValueChange={setIsPaid}
                  trackColor={{ false: '#FF453A30', true: '#30D15830' }}
                  thumbColor={isPaid ? '#30D158' : '#FF453A'}
                />
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.buttonContainer}>
            <GlassButton
              title="Cancel"
              onPress={() => router.back()}
              variant="secondary"
              style={styles.button}
            />
            <GlassButton
              title={isLoading ? "Saving..." : (existingPayment ? "Update" : "Record")}
              onPress={handleSave}
              variant="primary"
              style={styles.button}
              disabled={isLoading}
            />
          </Animated.View>
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
  switchCard: {
    marginBottom: 20,
    padding: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
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
});
