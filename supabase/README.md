# Supabase

새록 백엔드(Postgres + PostGIS · Auth · Storage · RLS) 정의.

## 구조
- `migrations/0001_init.sql` — 도감 데이터 모델(profiles / species / catches / dex_progress) + RLS + 민감종 좌표 마스킹 뷰 + Storage 버킷.
- `seed.sql` — 도감 스모크 테스트용 흔한 새 예시 8종.

## 적용 방법 (택1)

### A. Supabase CLI (권장, 로컬→원격)
```bash
# 프로젝트 1회 연결
supabase login
supabase link --project-ref <PROJECT_REF>

# 원격에 마이그레이션 적용
supabase db push

# (선택) 시드: 로컬 리셋 시 자동 실행되거나, 원격엔 수동 실행
```

### B. 대시보드 SQL Editor
`migrations/0001_init.sql` → `seed.sql` 순서로 붙여넣어 실행.

### C. MCP (이 세션에서)
연결된 Supabase MCP의 `apply_migration` 으로 `0001_init.sql` 적용, `execute_sql` 로 시드 실행.

## 연결값
적용 후 대시보드 → **Project Settings → API** 에서 아래를 `.env` 에 채운다.
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 타입 생성
```bash
supabase gen types typescript --project-id <PROJECT_REF> > src/lib/database.types.ts
```
이후 `src/lib/supabase.ts` 의 `createClient` 를 `createClient<Database>(...)` 로 변경.

## 알려진 항목
- PostGIS 를 `public` 스키마에 설치 → Supabase advisor가 경고할 수 있음(기능엔 무방). 운영 단계에서 `extensions` 스키마 이전 검토.
- `dex_progress.total` 은 전체 종 수로 단순화. 추후 '지역별 도래 종' 기준으로 정교화.
