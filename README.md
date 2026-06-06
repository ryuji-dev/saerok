# 새록 (Saerok)

새 도감 수집 게임. **한국 종·한국어 + 동네 도감 하이퍼로컬 + 생태 윤리 내장**을 차별점으로 한다.

- 제품 전략·실행 작업: [`TODO.md`](./TODO.md)
- 기술 스택 결정(ADR): [`docs/01_tech-stack-decision.md`](./docs/01_tech-stack-decision.md)

## 기술 스택
- **앱**: Expo (React Native) + TypeScript + Expo Router
- **데이터**: TanStack Query + Supabase JS
- **백엔드**: Supabase (Postgres + PostGIS · Auth · Storage · Realtime · Edge Functions · RLS)
- **지도**: 네이버 지도 (dev client 필요)

## 사전 준비
1. **Node LTS 권장**(20/22). 현재 머신은 Node 25 — 설치/번들 오류 시 `fnm`/`nvm`로 LTS 전환.
2. 의존성 설치: `pnpm install`
3. 환경변수: `.env.example` → `.env` 복사 후 값 채우기
   - Supabase: 대시보드 → Project Settings → API 에서 URL / anon key
   - 네이버: 클라우드 플랫폼 Maps(Mobile Dynamic Map) client ID

## Supabase 셋업
`supabase/README.md` 참고. 요약: 프로젝트 생성(무료 티어) → `migrations/0001_init.sql` 적용 → `seed.sql` 실행 → `.env` 채우기.

## 실행
네이버 지도 등 네이티브 모듈 때문에 **Expo Go 사용 불가**. dev client 필요.

```bash
# 네이티브 프로젝트 생성 (ios/android 폴더는 gitignore됨)
npx expo prebuild

# 실행 (시뮬레이터/실기기)
npx expo run:ios
# 또는
npx expo run:android
```

## 검증
```bash
pnpm exec tsc --noEmit   # 타입체크
pnpm run lint            # ESLint
npx expo export -p ios   # JS 번들 그래프 검증 (시뮬레이터 불필요)
```
앱 실행 후 **도감 탭**에서 "✅ Supabase 연결됨" 메시지로 백엔드 연결을 확인할 수 있다(`.env` 설정 시).

## 디렉토리
```
src/
  app/                # Expo Router 라우트
    (tabs)/           # 도감 · 지도 · 촬영 · 프로필
    onboarding.tsx
  components/         # 공용 UI (ThemedText/ThemedView 등)
  constants/ hooks/   # 테마·훅
  lib/                # supabase 클라이언트, query client, env
supabase/
  migrations/         # 스키마 (PostGIS · RLS · 민감종 마스킹)
  seed.sql
docs/                 # 한국어 문서(ADR 등)
```

## 현재 상태 (Phase 1 셋업 완료)
부팅되는 앱 골격(4탭 + 온보딩) · Supabase 연결 배선 · 도감 데이터 모델 마이그레이션까지 완료.
카메라→AI 식별→도감 등록 등 실제 기능 로직은 Phase 2부터(`TODO.md` 참고).
