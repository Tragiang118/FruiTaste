import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from '@prisma/client';

import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    try {
      return await this.prisma.user.create({
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email đã tồn tại. Vui lòng sử dụng email khác.');
      }
      throw error;
    }
  }

  async findOne(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByVerificationToken(token: string) {
    return this.prisma.user.findFirst({
      where: { verificationToken: token },
    });
  }

  async verifyUserEmail(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
      },
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    console.log('Found users:', users);
    return users;
  }
}
