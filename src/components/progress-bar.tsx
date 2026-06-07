import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Simple themed progress bar. `value` is 0–1. */
export function ProgressBar({ value, style }: { value: number; style?: ViewStyle }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value));

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }, style]}>
      <View style={{ flex: pct, backgroundColor: theme.tint }} />
      {pct < 1 ? <View style={{ flex: 1 - pct }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
  },
});
