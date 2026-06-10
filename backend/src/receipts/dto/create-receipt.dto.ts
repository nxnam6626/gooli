import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiptItemDto {
  @IsNumber({}, { message: 'productId phải là số.' })
  @IsNotEmpty({ message: 'productId không được để trống.' })
  @Type(() => Number)
  productId: number;

  @IsOptional()
  @IsNumber({}, { message: 'warehouseLocationId phải là số.' })
  @Type(() => Number)
  warehouseLocationId?: number;

  @IsNumber({}, { message: 'Số lượng phải là số.' })
  @Min(1, { message: 'Số lượng nhập phải lớn hơn hoặc bằng 1.' })
  @Type(() => Number)
  quantity: number;

  @IsNumber({}, { message: 'Giá nhập phải là số.' })
  @Min(0, { message: 'Giá nhập không được nhỏ hơn 0.' })
  @Type(() => Number)
  price: number;
}

export class CreateReceiptDto {
  @IsOptional()
  @IsNumber({}, { message: 'partnerId phải là số.' })
  @Type(() => Number)
  partnerId?: number;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự.' })
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự.' })
  note?: string;

  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Phiếu nhập phải chứa ít nhất 1 sản phẩm.' })
  @Type(() => ReceiptItemDto)
  items: ReceiptItemDto[];
}
