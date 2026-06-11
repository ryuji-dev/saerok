import { Bird } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-provider';
import { useTheme } from '@/hooks/use-theme';

type Mode = 'login' | 'signup';

/** Google 브랜드 'G' 마크 (공식 4색). */
function GoogleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <Path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <Path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <Path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onGoogle = async () => {
    setGoogleBusy(true);
    setMessage(null);
    const { error } = await signInWithGoogle();
    if (error) setMessage(error);
    setGoogleBusy(false);
    // 성공 시 세션이 생기면 AuthRedirector가 홈으로 이동시킵니다.
  };

  const submit = async () => {
    if (!email.trim() || !password) {
      setMessage('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    setBusy(true);
    setMessage(null);
    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password);
      if (error) setMessage(error);
    } else {
      const { error, needsConfirm } = await signUp(email.trim(), password);
      if (error) setMessage(error);
      else if (needsConfirm) setMessage('확인 메일을 보냈어요. 메일 인증 후 로그인해 주세요.');
      // 세션이 바로 생기면 AuthRedirector가 홈으로 이동시킵니다.
    }
    setBusy(false);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          <View style={styles.brand}>
            <Bird color={theme.tint} size={48} />
            <ThemedText style={styles.title}>새록</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">동네 새 도감을 시작해요</ThemedText>
          </View>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
              placeholder="이메일"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              inputMode="email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
              placeholder="비밀번호"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {message ? (
              <ThemedText type="small" themeColor="textSecondary">
                {message}
              </ThemedText>
            ) : null}

            <Pressable
              disabled={busy}
              onPress={submit}
              style={({ pressed }) => [styles.button, { backgroundColor: theme.tint, opacity: pressed || busy ? 0.85 : 1 }]}>
              {busy ? (
                <ActivityIndicator color={theme.onTint} />
              ) : (
                <ThemedText type="smallBold" style={{ color: theme.onTint }}>
                  {mode === 'login' ? '로그인' : '회원가입'}
                </ThemedText>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setMessage(null);
              }}
              style={styles.toggle}>
              <ThemedText type="small" themeColor="textSecondary">
                {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </ThemedText>
            </Pressable>

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: theme.backgroundSelected }]} />
              <ThemedText type="small" themeColor="textSecondary">
                또는
              </ThemedText>
              <View style={[styles.line, { backgroundColor: theme.backgroundSelected }]} />
            </View>

            <Pressable
              disabled={googleBusy}
              onPress={onGoogle}
              style={({ pressed }) => [
                styles.socialButton,
                { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected, opacity: pressed || googleBusy ? 0.85 : 1 },
              ]}>
              {googleBusy ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <>
                  <GoogleMark />
                  <ThemedText type="smallBold">구글로 계속하기</ThemedText>
                </>
              )}
            </Pressable>

            <ThemedText type="small" themeColor="textSecondary" style={styles.socialHint}>
              카카오·네이버 로그인은 곧 추가됩니다
            </ThemedText>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.four, gap: Spacing.six },
  brand: { alignItems: 'center', gap: Spacing.two },
  title: { fontSize: 32, fontWeight: 800, lineHeight: 38 },
  form: { gap: Spacing.three },
  input: {
    height: 52,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  button: {
    height: 52,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggle: { alignItems: 'center', paddingVertical: Spacing.one },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginVertical: Spacing.one },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  socialButton: {
    height: 52,
    borderRadius: Spacing.three,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  socialHint: { textAlign: 'center', marginTop: Spacing.two },
});
