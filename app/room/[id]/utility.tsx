import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import DataStore from '@/store/DataStore';
import { Room } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function RecordUtilityScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [electricUsage, setElectricUsage] = useState('');
  const [waterUsage, setWaterUsage] = useState('');
  const [electricCost, setElectricCost] = useState('');
  const [waterCost, setWaterCost] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    const rooms = await DataStore.getRooms();
    const found = rooms.find(r => r.id === id);
    if (found) {
      setRoom(found);
    }
  };

  const handleSave = async () => {
    if (!electricUsage.trim() || !waterUsage.trim()) {
      Alert.alert('Error', 'Please enter utility usage values');
      return;
    }

    setIsLoading(true);
    try {
      await DataStore.createUtility({
        roomId: id,
        month: months[selectedMonth],
        year: selectedYear,
        electricUsage: parseFloat(electricUsage) || 0,
        waterUsage: parseFloat(waterUsage) || 0,
        electricCost: parseFloat(electricCost) || 0,
        waterCost: parseFloat(waterCost) || 0,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to record utility usage');
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
            <ThemedText style={styles.sectionTitle}>Electric Usage</ThemedText>
            <GlassInput
              label="Usage (kWh)"
              placeholder="Enter electric usage"
              value={electricUsage}
              onChangeText={setElectricUsage}
              keyboardType="decimal-pad"
              icon={<IconSymbol name="bolt" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
            <GlassInput
              label="Cost ($)"
              placeholder="Enter electric cost"
              value={electricCost}
              onChangeText={setElectricCost}
              keyboardType="decimal-pad"
              icon={<IconSymbol name="dollarsign.circle" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)}>
            <ThemedText style={styles.sectionTitle}>Water Usage</ThemedText>
            <GlassInput
              label="Usage (m³)"
              placeholder="Enter water usage"
              value={waterUsage}
              onChangeText={setWaterUsage}
              keyboardType="decimal-pad"
              icon={<IconSymbol name="drop" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
            <GlassInput
              label="Cost ($)"
              placeholder="Enter water cost"
              value={waterCost}
              onChangeText={setWaterCost}
              keyboardType="decimal-pad"
              icon={<IconSymbol name="dollarsign.circle" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.buttonContainer}>
            <GlassButton
              title="Cancel"
              onPress={() => router.back()}
              variant="secondary"
              style={styles.button}
            />
            <GlassButton
              title={isLoading ? "Saving..." : "Save Record"}
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
