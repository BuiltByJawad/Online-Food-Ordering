import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 16 })
  discountType: 'percent' | 'fixed';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscount?: number | null;

  @Column({ type: 'int', default: 0 })
  maxUses: number;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'int', default: 0 })
  perUserLimit: number;

  @Column({ type: 'timestamptz', nullable: true })
  validFrom?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  validTo?: Date;

  @Column({ type: 'uuid', nullable: true })
  branchId?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  conditions?: Record<string, any>;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: 'active' | 'inactive';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
