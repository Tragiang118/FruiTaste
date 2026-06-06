import { Controller, Get, Delete, Patch, Post, Body, Param, ParseIntPipe, NotFoundException, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto, ForceChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id/lock')
  async lockUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.lockUser(id);
    if (!user) throw new NotFoundException('Không tìm thấy user');
    return { message: 'Đã khóa tài khoản' };
  }

  @Patch(':id/unlock')
  async unlockUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.unlockUser(id);
    if (!user) throw new NotFoundException('Không tìm thấy user');
    return { message: 'Đã khôi phục tài khoản' };
  }

  @Delete(':id')
  async softDeleteUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.softDeleteUser(id);
    if (!user) throw new NotFoundException('Không tìm thấy user');
    return { message: 'Đã xóa (mềm) user thành công' };
  }

  @Patch(':id/role')
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string
  ) {
    const user = await this.usersService.changeRole(id, role as any);
    if (!user) throw new NotFoundException('Không tìm thấy user');
    return { message: 'Đã đổi quyền user thành công' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/update')
  async updateProfile(@Req() req: any, @Body() data: any) {
    return this.usersService.update(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/request-email-change')
  async requestEmailChange(@Req() req: any, @Body('newEmail') newEmail: string) {
    return this.usersService.requestEmailChange(req.user.userId, newEmail);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, dto.oldPassword, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/force-change-password')
  async forceChangePassword(@Req() req: any, @Body() dto: ForceChangePasswordDto) {
    return this.usersService.forceChangePassword(req.user.userId, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/addresses')
  async getAddresses(@Req() req: any) {
    return this.usersService.getAddresses(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/addresses')
  async addAddress(@Req() req: any, @Body() data: any) {
    return this.usersService.addAddress(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/addresses/:id')
  async deleteAddress(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteAddress(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/addresses/:id')
  async updateAddress(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any
  ) {
    return this.usersService.updateAddress(req.user.userId, id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/addresses/:id/default')
  async setDefaultAddress(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.setDefaultAddress(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.updateAvatar(req.user.userId, avatarUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteOwnAccount(@Req() req: any) {
    return this.usersService.softDeleteUser(req.user.userId);
  }
}
