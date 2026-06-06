import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function OnboardingScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">새록에 오신 걸 환영해요</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          우리 동네(구)를 선택하고, 흔한 새부터 도감을 채워보세요. (동네 선택 + 튜토리얼은 Phase 2에서 구현)
        </ThemedText>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <ThemedText type="smallBold" style={styles.buttonText}>
            시작하기
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four, gap: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  button: {
    backgroundColor: '#208AEF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.three,
  },
  buttonText: { color: '#ffffff' },
});
