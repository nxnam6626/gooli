import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() cho phép inject PrismaService ở bất kỳ module nào
// mà không cần import PrismaModule lặp lại
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
