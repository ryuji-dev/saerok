import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { isNaverMapConfigured } from '@/lib/env';

export default function MapScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ThemedView type="backgroundElement" style={styles.mapPlaceholder}>
          <ThemedText type="subtitle">🗺️ 지도</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            {isNaverMapConfigured
              ? '네이버 지도 client ID 감지됨 — dev client 빌드 후 지도가 여기에 표시됩니다.'
              : '네이버 클라우드 플랫폼 Maps client ID를 .env에 설정하면 지도가 여기에 마운트됩니다.'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            내 관측 등록 + 동네 현황이 핀으로 표시될 예정입니다. (Phase 2)
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.three },
  mapPlaceholder: {
    flex: 1,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  center: { textAlign: 'center' },
});
