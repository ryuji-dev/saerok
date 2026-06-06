// Ambient declaration so `tsc` accepts CSS side-effect imports (e.g. `@/global.css`).
// Expo's Metro bundler handles CSS at runtime; this only satisfies the static
// typecheck before Expo generates `expo-env.d.ts`.
declare module '*.css';
