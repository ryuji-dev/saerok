import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function CameraScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ThemedText type="subtitle">📷 촬영</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          실시간 촬영 → AI 식별(후보 + 신뢰도) → 위치와 함께 도감 등록 흐름이 여기에 구현됩니다. (Phase 2)
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.note}>
          <ThemedText type="small" themeColor="textSecondary">
            치팅 방지를 위해 온디바이스 실시간 촬영만 허용하고, 갤러리 업로드는 차단할 예정입니다. EXIF·촬영시각 검증과 AI
            신뢰도 임계값도 이 화면 흐름에 포함됩니다.
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four, gap: Spacing.three, alignItems: 'center' },
  center: { textAlign: 'center' },
  note: { alignSelf: 'stretch', padding: Spacing.three, borderRadius: Spacing.three },
});
