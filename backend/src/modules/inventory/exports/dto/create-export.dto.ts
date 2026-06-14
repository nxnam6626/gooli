import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExportItemDto {
  @IsNumber({}, { message: 'productId phải là số.' })
  @IsNotEmpty({ message: 'productId không được để trống.' })
  @Type(() => Number)
  productId: number;

  @IsNumber({}, { message: 'Số lượng phải là số.' })
  @Min(1, { message: 'Số lượng xuất phải lớn hơn hoặc bằng 1.' })
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsBoolean({ message: 'isFaulty phải là boolean.' })
  isFaulty?: boolean;
}

export class CreateExportDto {
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự.' })
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự.' })
  note?: string;

  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'Phiếu xuất phải chứa ít nhất 1 sản phẩm.' })
  @Type(() => ExportItemDto)
  items: ExportItemDto[];
}
