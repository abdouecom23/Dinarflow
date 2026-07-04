import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column({ unique: true })
  payment_tag: string;

  @Column()
  kyc_level: number;

  @Column({ default: 'PENDING' })
  kyc_status: string;

  @Column({ default: 'USER' })
  role: string;

  @CreateDateColumn()
  created_at: Date;
}
