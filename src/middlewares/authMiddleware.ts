import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Udvid Express’ Request med vores felter
export interface TenantRequest extends Request {
  user?: any;         // Hele JWT-payload
  tenantId?: string;  // tenantId fra token
}

/**
 * Middleware til at:
 * 1) Tjekke Bearer-header
 * 2) Verificere JWT (egen udstedelse)
 * 3) Lægge payload + tenantId på req
 */
export function authMiddleware() {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Bearer token' });
    }

    const token = authHeader.substring(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = payload;
      req.tenantId = payload.tenantId;   // Multi-tenant claim
      next();
    } catch (err) {
      console.error('JWT verification failed:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}