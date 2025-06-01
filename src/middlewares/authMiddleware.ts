import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export interface TenantRequest extends Request {
  user?: any;
  tenantId?: string;
}

// Nu returnerer vi RequestHandler, ikke bare en funktion
export function authMiddleware(): RequestHandler {
  return (req: TenantRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing Bearer token' });
      return;
    }

    

    const token = authHeader.substring(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = payload;
      req.tenantId = payload.tenantId;
      next();
    } catch (err) {
      console.error('JWT verification failed:', err);
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
  };
}
