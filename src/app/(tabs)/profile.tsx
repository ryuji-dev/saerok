import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeToggle } from '@/components/theme-toggle';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-provider';
import { useProfile } from '@/features/profile/use-profile';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const region = profile?.regionCode ? `서울 ${profile.regionCode}` : '지역 미설정';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ThemedText type="subtitle">프로필</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">{user?.email ?? '탐조인'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Lv.{profile?.level ?? 1} · XP {profile?.xp ?? 0} · {region}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">화면 테마</ThemedText>
          <ThemeToggle />
        </ThemedView>

        <Link href="/onboarding" asChild>
          <ThemedText type="linkPrimary">동네 변경 →</ThemedText>
        </Link>

        <Pressable onPress={signOut} style={styles.logout}>
          <ThemedText type="small" themeColor="textSecondary">
            로그아웃
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four, gap: Spacing.three },
  card: { alignSelf: 'stretch', gap: Spacing.one, padding: Spacing.three, borderRadius: Spacing.three },
  logout: { marginTop: Spacing.two },
});
