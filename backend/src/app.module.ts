import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { RequestsModule } from './requests/requests.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [AuthModule, RequestsModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
