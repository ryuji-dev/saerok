import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

// TODO: replace `any` with generated DB types once the Supabase project exists:
//   supabase gen types typescript ... > src/lib/database.types.ts
//   then: createClient<Database>(...)
//
// Fallback values keep `createClient` from throwing when `.env` is not yet
// filled. Queries are gated on `isSupabaseConfigured` (see src/lib/env.ts), so
// they won't actually run against the placeholder URL.
export const supabase = createClient(SUPABASE_URL || 'http://localhost', SUPABASE_ANON_KEY || 'placeholder-anon-key', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Web can parse the OAuth redirect (#access_token=…) automatically;
    // native parses it manually after expo-web-browser returns (see auth-provider).
    detectSessionInUrl: Platform.OS === 'web',
  },
});
