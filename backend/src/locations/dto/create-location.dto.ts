import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLocationDto {
  @IsString({ message: 'Mã vị trí phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Mã vị trí không được để trống.' })
  @MaxLength(50, { message: 'Mã vị trí không được vượt quá 50 ký tự.' })
  code: string;

  @IsString({ message: 'Tên vị trí phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Tên vị trí không được để trống.' })
  @MaxLength(100, { message: 'Tên vị trí không được vượt quá 100 ký tự.' })
  name: string;

  @IsString({ message: 'Khu vực kho (Zone) phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Khu vực kho không được để trống.' })
  @MaxLength(50, { message: 'Khu vực kho không được vượt quá 50 ký tự.' })
  zone: string;

  @IsOptional()
  @IsString({ message: 'Dãy (Row) phải là chuỗi ký tự.' })
  @MaxLength(20, { message: 'Dãy không được vượt quá 20 ký tự.' })
  row?: string;

  @IsOptional()
  @IsString({ message: 'Kệ (Shelf) phải là chuỗi ký tự.' })
  @MaxLength(20, { message: 'Kệ không được vượt quá 20 ký tự.' })
  shelf?: string;

  @IsOptional()
  @IsString({ message: 'Vị trí chi tiết phải là chuỗi ký tự.' })
  @MaxLength(20, { message: 'Vị trí chi tiết không được vượt quá 20 ký tự.' })
  position?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự.' })
  @MaxLength(200, { message: 'Mô tả không được vượt quá 200 ký tự.' })
  description?: string;
}
