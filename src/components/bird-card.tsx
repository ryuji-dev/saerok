import { Image as ImageIcon, Lock } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BirdCardData = {
  name: string;
  rarityLabel: string;
  /** Collected = show the bird; uncollected = locked silhouette. */
  collected: boolean;
  caption?: string;
};

export function BirdCard({ name, rarityLabel, collected, caption }: BirdCardData) {
  const theme = useTheme();

  return (
    <View style={styles.card}>
      <View style={[styles.thumb, { backgroundColor: theme.backgroundSelected }]}>
        {collected ? (
          <ImageIcon size={30} color={theme.tint} />
        ) : (
          <Lock size={30} color={theme.textSecondary} />
        )}
        <View style={[styles.badge, { backgroundColor: collected ? theme.tintSubtle : theme.background }]}>
          <ThemedText type="small" style={[styles.badgeText, { color: collected ? theme.tint : theme.textSecondary }]}>
            {rarityLabel}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="smallBold" numberOfLines={1}>
        {collected ? name : '???'}
      </ThemedText>
      {caption ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {caption}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: 120, gap: Spacing.one },
  thumb: {
    width: 120,
    height: 120,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, lineHeight: 16 },
});
