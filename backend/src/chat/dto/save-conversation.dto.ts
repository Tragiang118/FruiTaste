import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SaveConversationDto {
  @IsInt()
  @IsOptional()
  sessionId?: number;

  @IsInt()
  @IsNotEmpty({ message: 'Người dùng phải đăng nhập mới được dùng Chatbot' })
  userId: number;

  @IsString()
  @IsNotEmpty({ message: 'userMessage không được để trống' })
  userMessage: string;

  @IsString()
  @IsNotEmpty({ message: 'botMessage không được để trống' })
  botMessage: string;

  @IsString()
  @IsOptional()
  intent?: string;
}
