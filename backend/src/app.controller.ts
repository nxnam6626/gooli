import { Controller, Get } from '@nestjs/common';

/**
 * Health check endpoint dùng để UptimeRobot ping mỗi 14 phút
 * → Giữ cho Render Free Tier không bị spin down (cold start)
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'gooli-api',
    };
  }
}
