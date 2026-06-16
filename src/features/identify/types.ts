import { type Species } from '@/features/species/use-species';

/** 식별 입력 — 촬영 사진. base64 는 향후 온디바이스/원격 전략에서 사용. */
export type IdentifyInput = { uri: string; base64?: string | null };

/** 식별 결과 후보 한 건. 표시 정보(이름·희귀도·보호종)는 호출부가 종 목록에서 채운다. */
export type IdentifyCandidate = { speciesId: string; confidence: number };

/**
 * 사진을 받아 후보 종을 신뢰도 내림차순으로 돌려주는 식별기.
 * 전략(local 온디바이스 / remote LLM)을 이 인터페이스 뒤로 숨겨, 호출부(camera)는
 * 어떤 엔진인지 모른 채 동일하게 쓴다.
 */
export type Identifier = (input: IdentifyInput, species: Species[]) => Promise<IdentifyCandidate[]>;
