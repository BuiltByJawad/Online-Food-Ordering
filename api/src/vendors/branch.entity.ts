import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { BranchStatus } from './branch-status.enum';
import { MenuCategory } from '../menu/menu-category.entity';

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.branches, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  vendor: Vendor;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  addressLine1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine2?: string;

  @Column({ type: 'varchar', length: 128 })
  city: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  postalCode?: string;

  @Column({ type: 'varchar', length: 64 })
  country: string;

  @Column({ type: 'double precision', nullable: true })
  lat?: number;

  @Column({ type: 'double precision', nullable: true })
  lng?: number;

  @Column({ type: 'enum', enum: BranchStatus, default: BranchStatus.ACTIVE })
  status: BranchStatus;

  @Column({ type: 'jsonb', nullable: true })
  openingHours?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  deliveryZones?: Record<string, any>;

  @OneToMany(() => MenuCategory, (category) => category.branch)
  menuCategories: MenuCategory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
