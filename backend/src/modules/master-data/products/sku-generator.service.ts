import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Quy tắc sinh SKU – Option B:
 *   [PREFIX 2 ký tự] - [KEYWORD tối đa 8 ký tự, viết hoa, không dấu] - [STT 3 số]
 *
 *   Ví dụ: TN-BASIU50-001, VN-AL100-001, PK-TAYNAMC-001
 *
 * Bảng PREFIX theo slug danh mục:
 *   tran-nhom  → TN
 *   vach-ngan  → VN
 *   phu-kien   → PK
 *   lam-go-nhua / lam-trong-nha / lam-ngoai-troi → LG
 *   san-nhua   → SN
 *   tam-nano   → TN (dùng TAM để phân biệt)
 *   (khác)     → SP
 */
@Injectable()
export class SkuGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /** Stop words cần loại bỏ khi trích từ khóa từ tên sản phẩm */
  private readonly STOP_WORDS = [
    'tam',
    'tran',
    'nhom',
    'vach',
    'ngan',
    'phu',
    'kien',
    'lam',
    'go',
    'nhua',
    'san',
    'ngoai',
    'trong',
    'nha',
    'troi',
    'noi',
    'that',
    'cao',
    'cap',
    'cai',
    'cay',
    'bo',
    'hop',
    'thanh',
    'met',
    'the',
    'va',
    'la',
    'de',
    'cho',
    'va',
  ];

  /** Map slug danh mục nội bộ → prefix 2 ký tự */
  private readonly CATEGORY_PREFIX_MAP: Record<string, string> = {
    'tran-nhom': 'TN',
    'vach-ngan': 'VN',
    'phu-kien': 'PK',
    'lam-go-nhua': 'LG',
    'lam-trong-nha': 'LG',
    'lam-ngoai-troi': 'LG',
    'san-nhua': 'SN',
    'tam-nano': 'NN',
    'cua-nhom': 'CN',
  };

  /**
   * Chuyển chuỗi tiếng Việt có dấu → ASCII không dấu, viết hoa.
   * Ví dụ: "Basi U50x25 Shaped" → "BASIU50X25SHAPED"
   */
  private removeAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  /**
   * Trích từ khóa từ tên sản phẩm:
   * 1. Loại stop words
   * 2. Ghép các từ còn lại
   * 3. Lấy tối đa 8 ký tự
   */
  private extractKeyword(name: string): string {
    const words = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ''))
      .filter((w) => w.length > 0 && !this.STOP_WORDS.includes(w));

    const keyword = this.removeAccents(words.join(' ')).slice(0, 8);
    return keyword || 'SP';
  }

  /**
   * Lấy prefix theo categoryId.
   * Nếu không tìm thấy trong map → dùng 'SP'.
   */
  private async getPrefixByCategoryId(categoryId: number): Promise<string> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { slug: true },
    });
    if (!category) return 'SP';
    return this.CATEGORY_PREFIX_MAP[category.slug] ?? 'SP';
  }

  /**
   * Sinh SKU duy nhất theo quy tắc Option B.
   * Kiểm tra DB để đảm bảo không trùng.
   *
   * @param categoryId  ID danh mục nội bộ
   * @param productName Tên sản phẩm (dùng để trích keyword)
   * @returns SKU đề xuất, VD: "TN-BASIU50-001"
   */
  async generate(categoryId: number, productName: string): Promise<string> {
    const prefix = await this.getPrefixByCategoryId(categoryId);
    const keyword = this.extractKeyword(productName || '');
    const basePattern = `${prefix}-${keyword}-`;

    // Đếm số sản phẩm đã có SKU bắt đầu bằng prefix này
    const existingCount = await this.prisma.product.count({
      where: { sku: { startsWith: basePattern } },
    });

    let counter = existingCount + 1;
    let sku = `${basePattern}${String(counter).padStart(3, '0')}`;

    // Đảm bảo không trùng (phòng trường hợp có lỗ hổng trong dãy số)
    while (
      await this.prisma.product.findFirst({ where: { sku } })
    ) {
      counter++;
      sku = `${basePattern}${String(counter).padStart(3, '0')}`;
    }

    return sku;
  }
}
