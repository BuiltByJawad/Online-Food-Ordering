import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface AuditEventInput {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async record(event: AuditEventInput): Promise<void> {
    const log = this.auditRepository.create({
      actorId: event.actorId ?? null,
      actorRole: event.actorRole ?? null,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId ?? null,
      before: event.before ?? null,
      after: event.after ?? null,
    });
    await this.auditRepository.save(log);
  }
}
