import type { SourceRule } from '@manga/types';

/**
 * mihon-port: Tachiyomi/Mihon Kotlin extensions hand-ported to JSON.
 * V1 stub — throws so users get a clear "not supported yet" message.
 * Real implementation comes in V2 with Suwayomi-Server bridge.
 */
export function fromMihonPort(_input: unknown): SourceRule {
  throw new Error(
    'mihon-port adapter is not implemented in V1. ' + 'Use legado-v3 or manga-tracker-v1 for now.',
  );
}
