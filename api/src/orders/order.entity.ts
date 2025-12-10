import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  branchId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  deliveryAddress: {
    addressId: string;
    label: string;
    line1: string;
    line2?: string | null;
    city: string;
    postalCode?: string | null;
    country: string;
  } | null;

  @Column({ type: 'jsonb' })
  items: Array<{
    itemId: string;
    name: string;
    basePrice: number;
    quantity: number;
  }>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'varchar', length: 32, default: 'created' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
