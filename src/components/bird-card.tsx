import { Image as ImageIcon, Lock } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { RARITY_COLOR, type Rarity } from '@/data/birds';
import { useTheme } from '@/hooks/use-theme';

export type BirdCardData = {
  name: string;
  rarityLabel: string;
  /** 희귀도 — 뱃지 색상에 사용. 미지정 시 브랜드색으로 폴백. */
  rarity?: Rarity;
  /** Collected = show the bird; uncollected = locked silhouette. */
  collected: boolean;
  caption?: string;
};

type BirdCardProps = BirdCardData & {
  /** Card width; thumbnail stays square. Defaults to 120 (home rows). */
  width?: number;
  onPress?: () => void;
};

export function BirdCard({ name, rarityLabel, rarity, collected, caption, width = 120, onPress }: BirdCardProps) {
  const theme = useTheme();
  const rarityColor = rarity ? RARITY_COLOR[rarity] : theme.tint;

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
        <View style={[styles.badge, { backgroundColor: `${rarityColor}24` }]}>
          <ThemedText type="small" style={[styles.badgeText, { color: rarityColor }]}>
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
