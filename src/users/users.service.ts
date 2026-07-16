
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// MongoDB ObjectId is a 24-char hex string
function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.user.create({
      data,
    });
  }

  async findOne(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phoneNumber: string) {
    return this.prisma.user.findUnique({
      where: { phoneNumber },
    });
  }

  async findOneById(id: string) {
    if (!isValidObjectId(id)) return null;
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findProfile(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('User not found');
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        address: true,
        education: true,
        avatarUrl: true,
        coverImageUrl: true,
        coverPosition: true,
        avatarPosition: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateRefreshToken(id: string, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        avatarUrl: true,
        isOnline: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isOnline: true,
      },
      orderBy: { name: 'asc' },
      take: 30,
    });
  }

  async remove(id: string) {
      return this.prisma.user.delete({
          where: { id }
      });
  }
}
