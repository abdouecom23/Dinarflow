import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/server/app.module';
import { IdempotencyInterceptor } from './src/server/common/idempotency.interceptor';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from "vite";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new IdempotencyInterceptor());
  
  const expressApp = app.getHttpAdapter().getInstance();
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use Vite middleware for anything that isn't the API
    expressApp.use((req, res, next) => {
      if (req.url.startsWith('/api/v1')) {
        return next();
      }
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    expressApp.use(express.static(distPath));
    expressApp.get('*', (req, res, next) => {
      if (req.url.startsWith('/api/v1')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
