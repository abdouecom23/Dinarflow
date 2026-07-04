import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransfersModule } from './modules/transfers/transfers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: 'admin',
      password: 'devpass',
      database: 'dinarflow',
      autoLoadEntities: true,
      synchronize: true, // Use migrations in production
    }),
    AuthModule,
    AccountsModule,
    TransfersModule,
  ],
})
export class AppModule {}
