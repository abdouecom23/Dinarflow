import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'sender_account_id' })
  senderAccount: Account;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'receiver_account_id' })
  receiverAccount: Account;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ nullable: true })
  reference: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ unique: true })
  idempotencyKey: string;

  @CreateDateColumn()
  ts: Date;
}
