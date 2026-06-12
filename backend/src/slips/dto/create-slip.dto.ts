import { IsEnum, IsNumber, IsOptional, IsString, IsPositive } from 'class-validator';
import { SlipType } from '@prisma/client';

export class CreateSlipDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsEnum(SlipType)
  type: SlipType;

  @IsNumber()
  partnerId: number;

  @IsOptional()
  @IsNumber()
  receiptId?: number;

  @IsOptional()
  @IsNumber()
  exportId?: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  note?: string;
}
