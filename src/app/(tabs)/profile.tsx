import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeToggle } from '@/components/theme-toggle';
import { Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ThemedText type="subtitle">프로필</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">탐조인</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Lv.1 · XP 0 · 지역 미설정 (로그인·온보딩 후 표시)
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">화면 테마</ThemedText>
          <ThemeToggle />
        </ThemedView>

        <Link href="/onboarding" asChild>
          <ThemedText type="linkPrimary">온보딩 다시 보기 →</ThemedText>
        </Link>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  card: { alignSelf: 'stretch', gap: Spacing.one, padding: Spacing.three, borderRadius: Spacing.three },
});
