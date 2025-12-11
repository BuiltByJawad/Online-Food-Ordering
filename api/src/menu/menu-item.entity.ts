import {
  Column,
  CreateDateColumn,
  Entity,
<<<<<<< HEAD
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
=======
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MenuCategory } from './menu-category.entity';
import { MenuOption } from './menu-option.entity';
>>>>>>> fd897c04ea83262b56abf608b5aae4be4db3f547

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

<<<<<<< HEAD
=======
  @ManyToOne(() => MenuCategory, (category) => category.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  category: MenuCategory;

>>>>>>> fd897c04ea83262b56abf608b5aae4be4db3f547
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
<<<<<<< HEAD
  description?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'uuid', nullable: true })
  branchId?: string | null;
=======
  description?: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  imageUrl?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  taxCategory?: string;
>>>>>>> fd897c04ea83262b56abf608b5aae4be4db3f547

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

<<<<<<< HEAD
=======
  @Column({ type: 'jsonb', nullable: true })
  availabilitySchedule?: Record<string, any>;

  @OneToMany(() => MenuOption, (option) => option.item)
  options: MenuOption[];

>>>>>>> fd897c04ea83262b56abf608b5aae4be4db3f547
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
