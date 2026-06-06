/**
 * Centralized access to public runtime config.
 *
 * Expo only exposes env vars prefixed with `EXPO_PUBLIC_` to the app bundle.
 * Values come from `.env` (gitignored) — see `.env.example` for the keys.
 */

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const NAVER_MAP_CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ?? '';

/** True once the Supabase project URL + anon key are present in `.env`. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** True once the Naver Cloud Platform Maps client ID is present in `.env`. */
export const isNaverMapConfigured = Boolean(NAVER_MAP_CLIENT_ID);
