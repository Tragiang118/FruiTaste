import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  @UseGuards(JwtAuthGuard)
  @Post('recipe')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/recipes',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|avif)$/)) {
        return cb(new BadRequestException('Chỉ cho phép các định dạng ảnh (jpg, jpeg, png, webp, avif)'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async uploadRecipeImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = `/uploads/recipes/${file.filename}`;
    return { imageUrl };
  }

  @UseGuards(JwtAuthGuard)
  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|avif|mp4|webm)$/)) {
        return cb(new BadRequestException('Chỉ cho phép ảnh (jpg, png, webp, avif) hoặc video (mp4, webm)'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB (hỗ trợ video dung lượng lớn)
    }
  }))
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    const url = `/uploads/products/${file.filename}`;
    return { url };
  }
}
