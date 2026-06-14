import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PartnerType } from '@prisma/client';

export class CreatePartnerDto {
  @IsString({ message: 'Mã đối tác phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Mã đối tác không được để trống.' })
  @MaxLength(50, { message: 'Mã đối tác không được vượt quá 50 ký tự.' })
  code: string;

  @IsString({ message: 'Tên đối tác phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Tên đối tác không được để trống.' })
  @MaxLength(150, { message: 'Tên đối tác không được vượt quá 150 ký tự.' })
  name: string;

  @IsEnum(PartnerType, {
    message:
      'Loại đối tác phải là SUPPLIER (Nhà cung cấp) hoặc CUSTOMER (Khách hàng).',
  })
  @IsNotEmpty({ message: 'Loại đối tác không được để trống.' })
  type: PartnerType;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự.' })
  @MaxLength(20, { message: 'Số điện thoại không được vượt quá 20 ký tự.' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  @MaxLength(100, { message: 'Email không được vượt quá 100 ký tự.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự.' })
  @MaxLength(255, { message: 'Địa chỉ không được vượt quá 255 ký tự.' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Mã số thuế phải là chuỗi ký tự.' })
  @MaxLength(50, { message: 'Mã số thuế không được vượt quá 50 ký tự.' })
  taxCode?: string;
}
