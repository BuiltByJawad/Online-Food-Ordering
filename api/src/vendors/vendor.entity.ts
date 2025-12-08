import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Branch } from './branch.entity';
import { VendorStatus } from './vendor-status.enum';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  owner: User;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brandName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legalName?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  taxId?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  logoUrl?: string;

  @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.PENDING_REVIEW })
  status: VendorStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail?: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  contactPhone?: string;

  @Column({ type: 'double precision', nullable: true })
  commissionRate?: number;

  @Column({ type: 'varchar', length: 32, nullable: true })
  payoutCycle?: string;

  @OneToMany(() => Branch, (branch) => branch.vendor)
  branches: Branch[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
