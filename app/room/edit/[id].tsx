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

export default function EditRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [name, setName] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [hostAddress, setHostAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    const rooms = await DataStore.getRooms();
    const found = rooms.find(r => r.id === id);
    if (found) {
      setRoom(found);
      setName(found.name);
      setMonthlyRent(found.monthlyRent?.toString() || '');
      setHostName(found.host?.name || '');
      setHostPhone(found.host?.phone || '');
      setHostAddress(found.host?.address || '');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    if (!hostName.trim()) {
      Alert.alert('Error', 'Please enter tenant name');
      return;
    }

    setIsLoading(true);
    try {
      await DataStore.updateRoom(id, {
        name: name.trim(),
        monthlyRent: parseFloat(monthlyRent) || 0,
        host: {
          name: hostName.trim(),
          phone: hostPhone.trim(),
          address: hostAddress.trim(),
        },
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update room');
    } finally {
      setIsLoading(false);
    }
  };

  if (!room) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={28} color={isDark ? '#FFFFFF' : '#11181C'} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Edit Room</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(100)}>
            <ThemedText style={styles.sectionTitle}>Room Details</ThemedText>
            <GlassInput
              label="Room Name/Number"
              placeholder="e.g., Room 101"
              value={name}
              onChangeText={setName}
              icon={<IconSymbol name="bed.double" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
            <GlassInput
              label="Monthly Rent ($)"
              placeholder="Enter monthly rent"
              value={monthlyRent}
              onChangeText={setMonthlyRent}
              keyboardType="decimal-pad"
              icon={<IconSymbol name="dollarsign.circle" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)}>
            <ThemedText style={styles.sectionTitle}>Tenant Information</ThemedText>
            <GlassInput
              label="Tenant Name"
              placeholder="Enter tenant name"
              value={hostName}
              onChangeText={setHostName}
              icon={<IconSymbol name="person" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
            <GlassInput
              label="Phone Number"
              placeholder="Enter phone number"
              value={hostPhone}
              onChangeText={setHostPhone}
              keyboardType="phone-pad"
              icon={<IconSymbol name="phone" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
            <GlassInput
              label="Address"
              placeholder="Enter tenant address"
              value={hostAddress}
              onChangeText={setHostAddress}
              multiline
              numberOfLines={2}
              icon={<IconSymbol name="mappin.and.ellipse" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)} style={styles.buttonContainer}>
            <GlassButton
              title="Cancel"
              onPress={() => router.back()}
              variant="secondary"
              style={styles.button}
            />
            <GlassButton
              title={isLoading ? "Saving..." : "Save Changes"}
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
