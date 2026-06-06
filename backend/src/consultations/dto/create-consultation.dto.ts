import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class CreateConsultationDto {
  @IsString({ message: 'Email phải là chuỗi ký tự.' })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ.' })
  @IsOptional()
  @MaxLength(150, { message: 'Email không được vượt quá 150 ký tự.' })
  email?: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống.' })
  @MaxLength(20, { message: 'Số điện thoại không được vượt quá 20 ký tự.' })
  phone: string;

  @IsString({ message: 'Nội dung ghi chú phải là chuỗi ký tự.' })
  @IsOptional()
  @MaxLength(500, {
    message: 'Nội dung ghi chú không được vượt quá 500 ký tự.',
  })
  note?: string;
}
