import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { useColorScheme as useSystemColorScheme } from '@/hooks/use-color-scheme';

/** User-facing theme choice. `system` follows the OS setting. */
export type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedScheme = 'light' | 'dark';

const STORAGE_KEY = 'saerok.themePreference';

type ThemePreferenceContextValue = {
  /** What the user picked (`system` | `light` | `dark`). */
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  /** The actual scheme to render after resolving `system` against the OS. */
  colorScheme: ResolvedScheme;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Load the persisted choice once on mount.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'system' || stored === 'light' || stored === 'dark') {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const resolvedSystem: ResolvedScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const colorScheme: ResolvedScheme = preference === 'system' ? resolvedSystem : preference;

  const value = useMemo(
    () => ({ preference, setPreference, colorScheme }),
    [preference, setPreference, colorScheme],
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference() {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error('useThemePreference must be used within <ThemePreferenceProvider>');
  }
  return ctx;
}
