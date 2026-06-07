import { Image as ImageIcon, Lock } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

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

type BirdCardProps = BirdCardData & {
  /** Card width; thumbnail stays square. Defaults to 120 (home rows). */
  width?: number;
  onPress?: () => void;
};

export function BirdCard({ name, rarityLabel, collected, caption, width = 120, onPress }: BirdCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, { width, opacity: pressed && onPress ? 0.85 : 1 }]}>
      <View style={[styles.thumb, { backgroundColor: theme.backgroundSelected }]}>
        {collected ? (
          <ImageIcon size={30} color={theme.tint} />
        ) : (
          <Lock size={28} color={theme.textSecondary} />
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.one },
  thumb: {
    width: '100%',
    aspectRatio: 1,
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
