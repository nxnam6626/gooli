import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNumber({}, { message: 'categoryId phải là số.' })
  @IsNotEmpty({ message: 'categoryId không được để trống.' })
  @Type(() => Number)
  categoryId: number;

  @IsString({ message: 'Mã SKU phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Mã SKU không được để trống.' })
  @MaxLength(50, { message: 'Mã SKU không được vượt quá 50 ký tự.' })
  sku: string;

  @IsString({ message: 'Tên sản phẩm phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống.' })
  @MaxLength(150, { message: 'Tên sản phẩm không được vượt quá 150 ký tự.' })
  name: string;

  @IsNumber({}, { message: 'Đơn giá phải là số.' })
  @Min(0, { message: 'Đơn giá không được nhỏ hơn 0.' })
  @Type(() => Number)
  pricePerM2: number;

  @IsString({ message: 'Đường dẫn ảnh phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Đường dẫn ảnh không được để trống.' })
  @MaxLength(255, { message: 'Đường dẫn ảnh không được vượt quá 255 ký tự.' })
  imageUrl: string;

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
