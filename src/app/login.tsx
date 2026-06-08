import { Bird } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-provider';
import { useTheme } from '@/hooks/use-theme';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

            <ThemedText type="small" themeColor="textSecondary" style={styles.socialHint}>
              간편 로그인(구글·카카오·네이버)은 곧 추가됩니다
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
  socialHint: { textAlign: 'center', marginTop: Spacing.two },
});
