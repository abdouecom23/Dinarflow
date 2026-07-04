import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IdempotencyInterceptor } from './common/idempotency.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new IdempotencyInterceptor());
  await app.listen(3000);
}
bootstrap();
