import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpsertCompanyInfoDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsString()
  taxCode?: string;

  @IsOptional() @IsString()
  note?: string;

  @IsOptional() @IsDateString()
  auditDate?: string;

  @IsOptional() @IsDateString()
  inventoryDate?: string;
}
