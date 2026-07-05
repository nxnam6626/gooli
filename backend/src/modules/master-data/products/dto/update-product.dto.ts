import {
  IsOptional,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsNumber({}, { message: 'categoryId phải là số.' })
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsString({ message: 'Mã SKU phải là chuỗi ký tự.' })
  @MaxLength(50, { message: 'Mã SKU không được vượt quá 50 ký tự.' })
  sku?: string;

  @IsOptional()
  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự.' })
  @MaxLength(150, { message: 'Tên sản phẩm không được vượt quá 150 ký tự.' })
  name?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Đơn giá phải là số.' })
  @Min(0, { message: 'Đơn giá không được nhỏ hơn 0.' })
  @Type(() => Number)
  pricePerM2?: number;

  @IsOptional()
  @IsString({ message: 'Đường dẫn ảnh phải là chuỗi ký tự.' })
  @MaxLength(255, { message: 'Đường dẫn ảnh không được vượt quá 255 ký tự.' })
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự.' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Độ dày phải là số.' })
  @Min(0, { message: 'Độ dày không được nhỏ hơn 0.' })
  @Type(() => Number)
  thickness?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Chiều rộng phải là số.' })
  @Min(0, { message: 'Chiều rộng không được nhỏ hơn 0.' })
  @Type(() => Number)
  width?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Chiều dài phải là số.' })
  @Min(0, { message: 'Chiều dài không được nhỏ hơn 0.' })
  @Type(() => Number)
  length?: number;

  @IsOptional()
  @IsString({ message: 'Đơn vị tính phải là chuỗi ký tự.' })
  @MaxLength(20, { message: 'Đơn vị tính không được vượt quá 20 ký tự.' })
  unit?: string;

  @IsOptional()
  @Type(() => Number)
  publicCategoryIds?: number[];
}
