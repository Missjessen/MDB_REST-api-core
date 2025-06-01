import { Router, Request, Response, NextFunction, RequestHandler } from 'express';

type Versions = Record<string, Router>;
interface VersionRouterOpts { defaultVersion: string; }

export function versionRouter(
  versions: Versions,
  opts: VersionRouterOpts
): Router {
  const router = Router();

  // 1) Læs Accept-Version med fallback
  router.use((req: Request & { apiVersion?: string }, _res, next) => {
    const header = req.header('Accept-Version');
    req.apiVersion = header && versions[header] ? header : opts.defaultVersion;
    next();
  });

  // 2) Mount statisk /v1, /v2 osv.
  for (const [ver, sub] of Object.entries(versions)) {
    router.use(`/v${ver}`, sub);
  }

  // 3) Redirect / → /v{default}
  router.get('/', (req: Request, res: Response) => {
    res.redirect(`${req.baseUrl}/v${opts.defaultVersion}${req.url}`);
  });

  // 4) Dynamisk dispatch som RequestHandler (void)
  const dispatch: RequestHandler = (req, res, next) => {
    const ver = (req as any).apiVersion as string;
    const sub = versions[ver];
    if (!sub) {
      res.status(400).json({ error: `Unsupported API version: ${ver}` });
      return;
    }
    sub(req, res, next);
  };

  
  router.use(dispatch);
  return router;
}
