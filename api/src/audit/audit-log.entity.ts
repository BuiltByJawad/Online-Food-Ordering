import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  actorRole: string | null;

  @Column({ type: 'varchar', length: 128 })
  action: string;

  @Column({ type: 'varchar', length: 128 })
  entityType: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  entityId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  before: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  after: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}
