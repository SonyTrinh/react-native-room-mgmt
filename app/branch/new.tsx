import { useState } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import DataStore from '@/store/DataStore';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NewBranchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a branch name');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    setIsLoading(true);
    try {
      await DataStore.createBranch({
        name: name.trim(),
        address: address.trim(),
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create branch');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View 
            style={styles.backButton}
            onTouchEnd={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={28} color={isDark ? '#FFFFFF' : '#11181C'} />
          </View>
          <ThemedText style={styles.headerTitle}>New Branch</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(100)}>
            <GlassInput
              label="Branch Name"
              placeholder="Enter branch name"
              value={name}
              onChangeText={setName}
              icon={<IconSymbol name="building.2" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)}>
            <GlassInput
              label="Address"
              placeholder="Enter branch address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
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
              title={isLoading ? "Creating..." : "Create Branch"}
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});
