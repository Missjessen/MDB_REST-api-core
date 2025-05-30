import { TenantRequest } from '../middlewares/authMiddleware';

/**
 * Hjælper til at scope alle DB-calls til den korrekte tenant.
 * Kaster fejl, hvis tenantId mangler på request.
 */
export function withTenant<T>(
  req: TenantRequest,
  filter: Partial<T> = {}
): Partial<T> & { tenantId: string } {
  if (!req.tenantId) {
    throw new Error('Missing tenantId on request');
  }
  return { ...filter, tenantId: req.tenantId };
}