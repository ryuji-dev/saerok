# 01. 기술 스택 결정 (ADR)

> 새록(Saerok) MVP의 기술 스택을 확정한 의사결정 기록. 작성일: 2026-06-05.

## 배경
- 새록은 **모바일 우선** 앱이다. 카메라(실시간 촬영)·위치(GPS)·한국 지도 SDK가 핵심 요구사항이다.
- 데이터는 관계형(도감/종/수집 기록) + 지리 집계(동네→시→도→전국 진행률) + 사진(UGC) + 실시간(랭킹) 성격을 모두 가진다.
- 3대 리스크(AI 식별 정확도·부정행위·생태 윤리)를 MVP 설계 단계부터 반영해야 한다.

## 확정 스택

| 영역 | 선택 | 근거 |
|---|---|---|
| 앱 프레임워크 | **Expo (React Native) + TypeScript** | 로컬 `node`/`pnpm` 환경과 일치, 백엔드와 TS 타입 공유, Expo Router·EAS(빌드·OTA) |
| 상태/데이터 | **TanStack Query + Supabase JS** | 서버 상태 캐싱·낙관적 업데이트 |
| 백엔드 | **Supabase** | Postgres+PostGIS(지역·위치 집계), Auth, Storage(사진), Realtime(랭킹), Edge Functions(AI·치팅 검증 프록시), RLS(민감종 마스킹) |
| 지도 | **네이버 지도** | 국내 POI·항공뷰 강점, 국내 서버 처리로 지도 국외반출 회피 |
| 디바이스 | expo-camera / expo-location / expo-image-manipulator | 실시간 촬영·GPS·EXIF 기반 치팅 방지 토대 |
| 품질 | ESLint + Prettier + TypeScript strict | 일관성·타입 안전성 |

## 선택 이유 (요약)
- **Expo(RN)**: 단일 코드베이스로 iOS/Android 동시 개발, 인디 개발 속도 최상. 백엔드 TS와 코드/타입 공유로 도감 데이터 모델 일관성 확보.
- **Supabase**: 새록의 데이터 4종 성격(관계형·지리·파일·실시간)을 한 플랫폼에서 충족. PostGIS로 지역 진행률·근처 관측 집계, RLS로 **민감종 좌표 마스킹**을 DB 레벨에서 강제.
- **네이버 지도**: 위치기반·지도 국외반출 회피 요건(규제) 충족.

## 검토 후 탈락한 대안
- **Flutter**: 한국 지도 플러그인 성숙도는 높으나 Flutter/Dart 신규 설치 필요(로컬 미설치) + 백엔드 TS와 코드 공유 불가.
- **Firebase**: 빠른 시작 장점이나 Firestore의 관계형·지리 집계 및 민감종 행단위 권한제어가 상대적으로 약함.
- **카카오 지도**: 네이버와 큰 차이 없으나 1차 적용은 네이버로 단일화(추후 병행 검토 가능).

## 미해결 결정 (후속)
- **AI 식별 엔진**: MVP 핵심 리스크 #1. 초기엔 식별 호출을 Edge Function 프록시로 추상화한 스텁만 두고, 실제 엔진(iNaturalist CV API / 호스팅 비전 모델 / 추후 자체 분류기)은 별도 조사·결정 후 연결.
- **시작 권역·시작 종 범위**: TODO Phase 0 결정 항목과 연계.

## 알려진 제약
- 네이버 지도는 네이티브 모듈이라 **Expo Go 사용 불가** → dev client(prebuild) 필수.
- Expo는 Node LTS(20/22) 공식 지원. 로컬 `node v25`에서 설치 오류 시 LTS 전환.
- pnpm 사용 시 RN 호이스팅 이슈 → `.npmrc`에 `node-linker=hoisted`.
