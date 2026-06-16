/**
 * Returns the active color palette, respecting the user's theme preference
 * (system / light / dark). See `src/components/theme-preference.tsx`.
 */
import { useThemePreference } from '@/components/theme-preference';
import { Colors } from '@/constants/theme';

export function useTheme() {
  const { colorScheme } = useThemePreference();
  return Colors[colorScheme];
}
