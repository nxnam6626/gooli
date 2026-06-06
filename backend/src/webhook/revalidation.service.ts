import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);
  private readonly frontendUrl: string;
  private readonly revalidateSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    this.revalidateSecret =
      this.configService.get<string>('REVALIDATE_SECRET') ||
      'gooli-revalidate-secret-2026';
  }

  async triggerRevalidation(tags: string[]) {
    if (!tags || tags.length === 0) return;

    const url = `${this.frontendUrl}/api/revalidate`;
    this.logger.log(
      `Calling Next.js Webhook Revalidate for tags: ${tags.join(', ')}`,
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: this.revalidateSecret,
          tags,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        this.logger.log(
          `Next.js Revalidation success: ${JSON.stringify(data)}`,
        );
      } else {
        this.logger.error(
          `Next.js Revalidation error: [${response.status}] ${JSON.stringify(data)}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to call Next.js revalidation webhook: ${error.message || error}`,
      );
    }
  }

  async checkAndTrigger(productSlug: string, oldQty: number, newQty: number) {
    const statusChanged =
      (oldQty === 0 && newQty > 0) || (oldQty > 0 && newQty === 0);

    if (statusChanged) {
      this.logger.log(
        `Stock status changed for ${productSlug} (from ${oldQty} to ${newQty}). Triggering revalidation.`,
      );
      await this.triggerRevalidation(['products', `product-${productSlug}`]);
    } else {
      this.logger.log(
        `Stock changed for ${productSlug} from ${oldQty} to ${newQty} but status (in-stock/out-of-stock) did not change. Skipping revalidate.`,
      );
    }
  }
}
