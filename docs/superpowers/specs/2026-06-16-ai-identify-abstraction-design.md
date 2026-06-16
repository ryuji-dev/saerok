# AI 식별 추상화 (1단계) — 설계

작성일: 2026-06-16

## 배경
촬영 → 도감 등록 플로우에서 종 식별은 현재 `camera.tsx`에 박힌 `fakeIdentify` 스텁(종 목록 무작위 셔플)이다. 실제 AI 식별을 붙여야 하지만, **운영자 비용 정책**상 제약이 있다:

- 무료/MVP 구간에선 **운영자 사비를 쓰지 않는다($0)** → 호출당 과금되는 클라우드 LLM은 보류.
- **유료 유저가 생겨 매출이 비용을 덮는 시점**에 LLM으로 올라갈 수 있어야 한다.

따라서 특정 엔진에 잠기지 않도록 **식별 엔진을 교체 가능한 인터페이스 뒤에 둔다.**

## 단계 구분
- **1단계 (본 문서, 지금)**: 식별 로직을 카메라에서 분리해 교체 가능한 모듈로 만든다. 기본 전략은 현재 휴리스틱(placeholder). 외부 호출 0, $0. `tsc`/lint/프리뷰로 검증 가능.
- **2단계 (dev build 확보 후)**: `local` 전략 내부를 "공공데이터 참조 이미지 + 온디바이스 임베딩 대조"로 교체. 호출당 $0 유지.
- **3단계 (유료 유저 시점)**: 같은 인터페이스에 `remote`(Edge Function → LLM) 전략 추가.

> 2·3단계는 본 설계 범위 밖. 1단계는 그 둘을 받아들일 **이음매(seam)**만 만든다.

## 1단계 설계

### 모듈: `src/features/identify/`
- **`types.ts`**
  - `IdentifyInput = { uri: string; base64?: string | null }` — 촬영 사진.
  - `IdentifyCandidate = { speciesId: string; confidence: number }` — 결과 후보. 표시 정보(이름·희귀도·보호종)는 호출부가 종 목록에서 채운다(관심사 분리).
  - `Identifier = (input, species) => Promise<IdentifyCandidate[]>` — 전략 인터페이스.
- **`local-identifier.ts`**
  - `localIdentifier: Identifier` — 1단계 placeholder. 외부 호출 없이 종 목록을 섞어 상위 3종 + 내림차순 신뢰도를 반환(현재 `fakeIdentify` 로직 이전).
  - 내부에 2단계 교체 지점(온디바이스 임베딩 대조)을 주석으로 명시.
- **`index.ts`**
  - `export const identify: Identifier = localIdentifier` — **활성 전략 단일 지점.** 향후 이 한 줄·이 파일만 바꿔 전략 교체.
  - 타입 재노출.

### `camera.tsx` 변경
- 박혀 있던 `fakeIdentify` 제거 → `await identify({ uri, base64 }, species)` 호출.
- 결과(`IdentifyCandidate[]`)를 종 목록과 합쳐 화면용 `Candidate`(이름·희귀도·보호종 포함)로 변환하는 `toCandidates` 헬퍼 추가.
- "AI 분석 중" 연출(약 700ms 최소 지연)은 기존 리사이즈 흐름에서 유지.

## 데이터 흐름
```
shoot() ─ takePicture ─ resize ─┐
                                 └─ identify({uri,base64}, species) ─> IdentifyCandidate[]
                                       (활성 전략 = localIdentifier)
                                    └─ toCandidates(+species) ─> 화면 후보 3종 ─ 사용자 선택 ─ register
```

## 비범위 (YAGNI)
- Edge Function 서버 경계 — 3단계에서. 지금 빈 껍데기로 만들지 않는다.
- 실제 ML 모델 파일·공공데이터 참조 이미지 파이프라인 — 2단계.

## 검증
- `pnpm exec tsc --noEmit`, `pnpm run lint` 통과.
- 프리뷰: 식별 후 후보 3종이 동일하게 표시되는지(사용자 체감 변화 없음), 콘솔 에러 없음.
- 동작 변화 없음 — 순수 구조 리팩터(엔진 교체 가능화).
