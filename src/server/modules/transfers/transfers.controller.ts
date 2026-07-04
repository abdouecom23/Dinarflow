import { Controller, Post, Body, Req, UseGuards, Headers } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('transfers')
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('p2p')
  async p2pTransfer(
    @Body() body: { receiverAccountId: string; amountCentimes: number; reference?: string },
    @Req() req: any,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.transfersService.transfer({
      senderAccountId: req.user.accountId, // Assume this is populated by a strategy
      receiverAccountId: body.receiverAccountId,
      amountCentimes: body.amountCentimes,
      type: 'P2P',
      reference: body.reference,
      idempotencyKey,
    });
  }
}
