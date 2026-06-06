import { Module, Global } from '@nestjs/common';
import { RevalidationService } from './revalidation.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RevalidationService],
  exports: [RevalidationService],
})
export class WebhookModule {}
