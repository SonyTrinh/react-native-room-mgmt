import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { GlassView } from './GlassView';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '../themed-text';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function GlassInput({
  label,
  error,
  icon,
  style,
  ...props
}: GlassInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={styles.label}>{label}</ThemedText>
      )}
      <GlassView
        intensity={40}
        borderRadius={12}
        style={[styles.inputContainer, error ? styles.errorBorder : null]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: isDark ? '#FFFFFF' : '#11181C' },
            icon ? styles.inputWithIcon : null,
            style,
          ]}
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
          {...props}
        />
      </GlassView>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  inputWithIcon: {
    marginLeft: 12,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: '#FF453A',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 12,
    marginTop: 4,
  },
});
