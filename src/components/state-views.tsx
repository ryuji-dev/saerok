import { CircleAlert, RotateCw, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** 데이터 로딩 실패 상태. 다시 시도 버튼(refetch) 제공. */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <CircleAlert size={32} color={theme.textSecondary} strokeWidth={1.6} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
        {message ?? '데이터를 불러오지 못했어요.'}
      </ThemedText>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.retry, { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.85 : 1 }]}>
          <RotateCw size={16} color={theme.tint} />
          <ThemedText type="smallBold" style={{ color: theme.tint }}>
            다시 시도
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

/** 결과 없음/비어 있음 상태. 아이콘 + 안내 문구. */
export function EmptyState({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <Icon size={30} color={theme.textSecondary} strokeWidth={1.6} />
      <ThemedText type="smallBold" style={styles.text}>
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingVertical: Spacing.six, paddingHorizontal: Spacing.four },
  text: { textAlign: 'center' },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
});
