import { Router } from 'express';

type Versions = Record<string, Router>;

/**
 * Monterer sub-routers under /v1, /v2 osv.
 *
 * @example
 *   versionRouter({ '1': adsV1, '2': adsV2 })
 *   // giver /v1 ↦ adsV1, /v2 ↦ adsV2
 */
export function versionRouter(versions: Versions): Router {
  const router = Router();
  for (const [ver, subRouter] of Object.entries(versions)) {
    router.use(`/v${ver}`, subRouter);
  }
  return router;
}