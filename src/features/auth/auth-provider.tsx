import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirm: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Pull OAuth tokens out of a redirect URL fragment (#a=b) or query (?a=b). */
function paramsFromUrl(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const frag = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
  if (!frag) return out;
  for (const pair of frag.split('&')) {
    const [k, v] = pair.split('=');
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return out;
}

/** Set a Supabase session from an OAuth redirect URL. Returns null if no token present. */
async function createSessionFromUrl(url: string): Promise<Session | null> {
  const p = paramsFromUrl(url);
  if (p.error_description) throw new Error(p.error_description);
  if (!p.access_token) return null;
  const { data, error } = await supabase.auth.setSession({
    access_token: p.access_token,
    refresh_token: p.refresh_token,
  });
  if (error) throw error;
  return data.session;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Native: handle the OAuth redirect when it reopens the app (cold start / background).
  // onAuthStateChange picks up the new session after setSession runs.
  const incomingUrl = Linking.useURL();
  useEffect(() => {
    if (Platform.OS === 'web' || !incomingUrl) return;
    createSessionFromUrl(incomingUrl).catch(() => {
      /* not an auth redirect — ignore */
    });
  }, [incomingUrl]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { error: error?.message ?? null, needsConfirm: !error && !data.session };
      },
      signInWithGoogle: async () => {
        const redirectTo = Linking.createURL('/');

        // Web: let supabase-js do the full-page redirect; detectSessionInUrl finishes it.
        if (Platform.OS === 'web') {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo },
          });
          return { error: error?.message ?? null };
        }

        // Native: open the in-app browser, then parse tokens from the redirect URL.
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error || !data?.url) {
          return { error: error?.message ?? 'OAuth URL 생성에 실패했어요.' };
        }
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (res.type === 'success') {
          try {
            await createSessionFromUrl(res.url);
          } catch (e) {
            return { error: e instanceof Error ? e.message : '로그인 처리에 실패했어요.' };
          }
        }
        // 'cancel' / 'dismiss' = user closed the browser; not an error.
        return { error: null };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
