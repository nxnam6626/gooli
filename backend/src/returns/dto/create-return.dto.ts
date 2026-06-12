import { IsNumber, IsOptional, IsString, IsArray, ValidateNested, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  vatRate?: number;
}

export class CreateReturnDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsNumber()
  partnerId: number;

  @IsOptional()
  @IsNumber()
  exportId?: number; // For customer return

  @IsOptional()
  @IsNumber()
  receiptId?: number; // For supplier return

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];
}
