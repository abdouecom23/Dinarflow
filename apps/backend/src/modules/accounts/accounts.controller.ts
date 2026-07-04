import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/accounts')
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyAccount(@Req() req: any) {
    return this.accountsService.findByUserId(req.user.userId);
  }
}
