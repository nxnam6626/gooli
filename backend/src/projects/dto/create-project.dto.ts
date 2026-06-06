import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'Tên dự án phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Tên dự án không được để trống.' })
  @MaxLength(150, { message: 'Tên dự án không được vượt quá 150 ký tự.' })
  name: string;

  @IsString({ message: 'URL hình ảnh phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'URL hình ảnh không được để trống.' })
  @MaxLength(255, { message: 'URL hình ảnh không được vượt quá 255 ký tự.' })
  imageUrl: string;

  @IsString({ message: 'Mô tả phải là chuỗi ký tự.' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Địa điểm phải là chuỗi ký tự.' })
  @IsOptional()
  @MaxLength(100, { message: 'Địa điểm không được vượt quá 100 ký tự.' })
  location?: string;
}
