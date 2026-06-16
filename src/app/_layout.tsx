import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';

import { ThemePreferenceProvider, useThemePreference } from '@/components/theme-preference';
import { AuthProvider, useAuth } from '@/features/auth/auth-provider';
import { useProfile } from '@/features/profile/use-profile';
import { queryClient } from '@/lib/query-client';

/**
 * 라우트 게이트: 미로그인 → 로그인, 로그인했지만 동네 미설정 → 온보딩, 그 외 → 앱.
 */
function AuthRedirector() {
  const { session, isLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === 'login';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session) {
      if (!inAuth) router.replace('/login');
      return;
    }
    // 로그인됨 — 동네(region_code) 로딩 대기 후 분기.
    if (profileLoading) return;
    const needsOnboarding = !profile?.regionCode;
    if (needsOnboarding) {
      // 동네 미설정 → 온보딩 강제. (설정 후엔 온보딩 화면이 직접 이동시킨다.)
      if (!inOnboarding) router.replace('/onboarding');
      return;
    }
    // 동네 설정됨 — 로그인 화면에 남아있다면 앱으로. 온보딩 재방문(동네 변경)은 허용.
    if (inAuth) router.replace('/');
  }, [session, isLoading, profile, profileLoading, segments, router]);

  return null;
}

function ThemedNavigation() {
  const { colorScheme } = useThemePreference();
  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="dex" options={{ headerShown: true, title: '도감' }} />
        <Stack.Screen name="bird/[id]" options={{ headerShown: true, title: '' }} />
      </Stack>
      <AuthRedirector />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemePreferenceProvider>
          <AuthProvider>
            <ThemedNavigation />
          </AuthProvider>
        </ThemePreferenceProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
