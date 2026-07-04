import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LedgerService } from './ledger.service';

@Controller('v1/ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('account/:id')
  async getByAccount(@Param('id') id: string) {
    return this.ledgerService.findByAccountId(id);
  }

  @Get('recent')
  async getRecent() {
    return this.ledgerService.getRecentActivity();
  }
}
