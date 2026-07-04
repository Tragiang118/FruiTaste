import { IsNotEmpty, IsString } from 'class-validator';

export class ChatQueryDto {
  @IsString()
  @IsNotEmpty({ message: 'Nội dung câu hỏi không được để trống' })
  text: string;
}
