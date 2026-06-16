import { ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * 보호종(멸종위기·민감종) 안내 카드. 서식지 보호를 위해 관측 위치를
 * 공개하지 않는다는 생태 윤리를 사용자에게 드러낸다. DB(catches_public 뷰)에서
 * 좌표가 마스킹되는 것과 짝을 이루는 UI.
 */
export function SensitiveNotice() {
  const theme = useTheme();
  return (
    <View style={[styles.notice, { backgroundColor: theme.tintSubtle }]}>
      <ShieldCheck size={20} color={theme.tint} strokeWidth={1.8} />
      <View style={styles.noticeBody}>
        <ThemedText type="smallBold" style={{ color: theme.tint }}>
          보호종 · 서식지를 지켜요
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          멸종위기·민감종이에요. 서식지 보호를 위해 관측 위치는 지도·공개 기록에 노출되지 않습니다.
        </ThemedText>
      </View>
    </View>
  );
}

/** 카드/행에 붙이는 작은 보호종 표식. */
export function SensitiveBadge({ size = 14 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: theme.tintSubtle }]}>
      <ShieldCheck size={size} color={theme.tint} strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { flexDirection: 'row', gap: Spacing.two, padding: Spacing.three, borderRadius: Spacing.three, alignItems: 'flex-start' },
  noticeBody: { flex: 1, gap: 2 },
  badge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
