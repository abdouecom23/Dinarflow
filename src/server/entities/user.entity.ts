import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  full_name: string;

  @Column('text', { unique: true })
  payment_tag: string;

  @Column('int')
  kyc_level: number;

  @Column('text', { default: 'PENDING' })
  kyc_status: string;

  @Column('text', { default: 'USER' })
  role: string;

  @CreateDateColumn()
  created_at: Date;
}
