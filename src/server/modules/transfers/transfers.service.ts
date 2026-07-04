import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';
import { LedgerEntry } from '../../entities/ledger-entry.entity';
import { Transaction } from '../../entities/transaction.entity';
import { TIER_LIMITS, DAILY_OUTFLOW_LIMITS } from '../../../types';

@Injectable()
export class TransfersService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    @InjectRepository(Transaction) private txnRepo: Repository<Transaction>,
  ) {}

  async transfer(payload: {
    senderAccountId: string;
    receiverAccountId: string;
    amountCentimes: number;
    type: string;
    reference?: string;
    idempotencyKey: string;
  }) {
    // 1. Idempotency guard
    const existing = await this.txnRepo.findOne({ where: { idempotencyKey: payload.idempotencyKey } });
    if (existing) return existing;

    // 2. Run in a single ACID transaction
    return this.dataSource.transaction(async (manager) => {
      const accountRepo = manager.getRepository(Account);
      const ledgerRepo = manager.getRepository(LedgerEntry);
      const txnRepo = manager.getRepository(Transaction);

      // Lock accounts
      const sender = await accountRepo.findOne({
        where: { id: payload.senderAccountId },
        lock: { mode: 'pessimistic_write' },
      });
      const receiver = await accountRepo.findOne({
        where: { id: payload.receiverAccountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!sender || !receiver) throw new Error('Account not found');
      if (sender.id === receiver.id) throw new Error('Cannot transfer to self');
      if (sender.status !== 'ACTIVE') throw new Error('Sender account not active');
      if (sender.balance < payload.amountCentimes) throw new Error('Insufficient balance');

      // --- ALGERIAN PSP COMPLIANCE CHECKS ---
      
      // 1. Reset daily_debit_sum if it's a new day
      const now = new Date();
      const lastUpdate = new Date(sender.updated_at);
      if (lastUpdate.toDateString() !== now.toDateString()) {
        sender.daily_debit_sum = 0;
      }

      // 2. Check Daily Outflow Limit (Article 14)
      const dailyLimit = DAILY_OUTFLOW_LIMITS[sender.tier];
      if (Number(sender.daily_debit_sum) + payload.amountCentimes > dailyLimit) {
        throw new Error(`Daily outflow limit exceeded for Tier ${sender.tier} (${dailyLimit} DA)`);
      }

      // 3. Check Receiver Balance Cap (Article 11)
      const balanceCap = TIER_LIMITS[receiver.tier];
      if (Number(receiver.balance) + payload.amountCentimes > balanceCap) {
        throw new Error(`Receiver balance cap would be exceeded for Tier ${receiver.tier} (${balanceCap} DA)`);
      }

      // --- END COMPLIANCE CHECKS ---

      // 4. Update balances and metadata
      const newSenderBal = Number(sender.balance) - payload.amountCentimes;
      const newReceiverBal = Number(receiver.balance) + payload.amountCentimes;
      
      sender.balance = newSenderBal;
      sender.daily_debit_sum = Number(sender.daily_debit_sum) + payload.amountCentimes;
      
      receiver.balance = newReceiverBal;

      await accountRepo.save([sender, receiver]);

      // 5. Ledger Entries
      const txnId = crypto.randomUUID();
      const entries = [
        { transactionId: txnId, account: sender, direction: 'DEBIT', amount: payload.amountCentimes, balanceAfter: newSenderBal, ts: now },
        { transactionId: txnId, account: receiver, direction: 'CREDIT', amount: payload.amountCentimes, balanceAfter: newReceiverBal, ts: now },
      ];
      await ledgerRepo.insert(entries);

      // 6. Transaction Metadata
      const txn = txnRepo.create({
        id: txnId,
        type: payload.type,
        senderAccount: sender,
        receiverAccount: receiver,
        amount: payload.amountCentimes,
        reference: payload.reference,
        status: 'COMPLETED',
        idempotencyKey: payload.idempotencyKey,
        ts: now,
      });
      return txnRepo.save(txn);
    });
  }
}
