import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** 로딩 자리표시용 펄스 박스. opacity 만 애니메이션해 네이티브 드라이버로 동작. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[{ backgroundColor: theme.backgroundElement, opacity }, styles.base, style]} />;
}

/** 새 카드 모양 스켈레톤(정사각 썸네일 + 이름 줄). */
export function BirdCardSkeleton({ width = 120 }: { width?: number }) {
  return (
    <View style={[styles.card, { width }]}>
      <Skeleton style={styles.thumb} />
      <Skeleton style={styles.line} />
    </View>
  );
}

/** 그리드형 스켈레톤. 도감 로딩 시 카드 배치를 미리 보여준다. */
export function BirdGridSkeleton({ width, count = 9 }: { width?: number; count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <BirdCardSkeleton key={i} width={width} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Spacing.two },
  card: { gap: Spacing.one },
  thumb: { width: '100%', aspectRatio: 1, borderRadius: Spacing.three },
  line: { height: 14, width: '70%', borderRadius: Spacing.one },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
});
