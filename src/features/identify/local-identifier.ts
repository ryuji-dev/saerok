import { type Identifier } from './types';

const MAX_CANDIDATES = 3;
const STUB_CONFIDENCES = [0.86, 0.61, 0.39];

/**
 * 1단계 placeholder 식별기 — 외부 호출 없이($0) 동작.
 * 현재는 종 목록을 무작위로 섞어 상위 후보를 제시하는 스텁이다.
 *
 * 2단계 교체 지점: 이 함수 내부를 "공공데이터 참조 이미지 + 온디바이스 임베딩 대조"로 바꾼다.
 *   - input.uri 를 온디바이스 모델로 임베딩 → 종별 참조 벡터와 코사인 유사도 → 상위 N.
 *   - 인터페이스(Identifier)는 그대로라 camera.tsx 는 수정 불필요.
 */
export const localIdentifier: Identifier = async (_input, species) => {
  const pool = [...species];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, MAX_CANDIDATES).map((s, i) => ({
    speciesId: s.id,
    confidence: STUB_CONFIDENCES[i] ?? 0.3,
  }));
};
