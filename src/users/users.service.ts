
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// MongoDB ObjectId is a 24-char hex string
function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

const ALLOWED_USER_UPDATE_FIELDS = new Set([
  'email',
  'username',
  'password',
  'name',
  'phoneNumber',
  'countryCode',
  'isVerified',
  'role',
  'refreshToken',
  'failedAttempts',
  'lockoutUntil',
  'bio',
  'address',
  'education',
  'category',
  'avatarUrl',
  'coverImageUrl',
  'coverPosition',
  'avatarPosition',
  'isOnline',
  'lastSeen',
  'otp',
  'otpExpires',
]);

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

  async findByUsername(username: string) {
    if (!username) return null;
    const clean = username.toLowerCase().trim();
    return this.prisma.user.findFirst({
      where: {
        username: { equals: clean, mode: 'insensitive' },
      },
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
        username: true,
        name: true,
        role: true,
        bio: true,
        address: true,
        education: true,
        category: true,
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
    const cleanData: any = {};
    if (data && typeof data === 'object') {
      for (const key of Object.keys(data)) {
        if (ALLOWED_USER_UPDATE_FIELDS.has(key)) {
          cleanData[key] = data[key];
        }
      }
    }

    if (cleanData.username !== undefined) {
      if (typeof cleanData.username === 'string' && cleanData.username.trim().length > 0) {
        const normalizedUsername = cleanData.username.trim().toLowerCase();
        // Check if alphanumeric + underscores/dots only
        if (!/^[a-zA-Z0-9._]{3,30}$/.test(normalizedUsername)) {
          throw new BadRequestException('Username must be 3-30 characters (letters, numbers, dots, underscores)');
        }
        const existing = await this.prisma.user.findFirst({
          where: {
            username: { equals: normalizedUsername, mode: 'insensitive' },
          },
        });
        if (existing && existing.id !== id) {
          throw new BadRequestException('Username is already taken');
        }
        cleanData.username = normalizedUsername;
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: cleanData,
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
