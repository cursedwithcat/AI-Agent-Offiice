import { auditRepository } from '../repositories/auditRepository.js';
import { DatabaseSync } from '../config/db.js';

export class AuditService {
  logAction(
    actorId: number | null | undefined,
    actorRole: string,
    action: string,
    targetType: string,
    targetId?: number | null,
    details?: any,
    ipAddress?: string | null,
    customDb?: DatabaseSync
  ) {
    try {
      auditRepository.create(
        {
          actorId,
          actorRole,
          action,
          targetType,
          targetId,
          details,
          ipAddress
        },
        customDb
      );
    } catch (err) {
      console.error('[AUDIT LOG ERROR] Failed to record audit log:', err);
    }
  }

  getAuditLogs(filters: { actorRole?: string; action?: string; limit?: number; offset?: number }) {
    return auditRepository.findAll(filters);
  }

  getPlatformStats() {
    return auditRepository.getPlatformStats();
  }
}

export const auditService = new AuditService();
