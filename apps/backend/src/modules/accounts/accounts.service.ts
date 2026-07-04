import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account) private accountRepo: Repository<Account>,
  ) {}

  async findByUserId(userId: string): Promise<Account | null> {
    return this.accountRepo.findOne({ where: { user: { id: userId } } });
  }
}
