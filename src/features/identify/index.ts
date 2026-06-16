import { localIdentifier } from './local-identifier';
import { type Identifier } from './types';

export type { IdentifyInput, IdentifyCandidate, Identifier } from './types';

/**
 * 활성 식별 전략 — 미래 교체의 단일 지점.
 * 지금은 온디바이스 placeholder(local) 하나.
 *   - 2단계: localIdentifier 내부를 실제 온디바이스 모델로 교체(이 줄은 그대로).
 *   - 3단계: 유료 유저 시점에 remoteIdentifier(Edge Function→LLM)를 추가하고 여기서 선택.
 */
export const identify: Identifier = localIdentifier;
