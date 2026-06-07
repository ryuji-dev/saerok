import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemePreference, type ThemePreference } from '@/components/theme-preference';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: '시스템' },
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
];

/** Segmented control to pick system / light / dark. Persists via the provider. */
export function ThemeToggle() {
  const { preference, setPreference } = useThemePreference();
  const theme = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: theme.backgroundSelected }]}>
      {OPTIONS.map((opt) => {
        const selected = preference === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => setPreference(opt.value)}
            style={[styles.segment, selected && { backgroundColor: theme.tint }]}>
            <ThemedText type="smallBold" style={{ color: selected ? theme.onTint : theme.text }}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two - 2,
  },
});
