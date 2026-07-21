"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function isValidObjectId(id) {
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
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.user.create({
            data,
        });
    }
    async findOne(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findByUsername(username) {
        if (!username)
            return null;
        const clean = username.toLowerCase().trim();
        return this.prisma.user.findFirst({
            where: {
                username: { equals: clean, mode: 'insensitive' },
            },
        });
    }
    async findByPhone(phoneNumber) {
        return this.prisma.user.findUnique({
            where: { phoneNumber },
        });
    }
    async findOneById(id) {
        if (!isValidObjectId(id))
            return null;
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async findProfile(id) {
        if (!isValidObjectId(id))
            throw new common_1.NotFoundException('User not found');
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
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async update(id, data) {
        const cleanData = {};
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
                if (!/^[a-zA-Z0-9._]{3,30}$/.test(normalizedUsername)) {
                    throw new common_1.BadRequestException('Username must be 3-30 characters (letters, numbers, dots, underscores)');
                }
                const existing = await this.prisma.user.findFirst({
                    where: {
                        username: { equals: normalizedUsername, mode: 'insensitive' },
                    },
                });
                if (existing && existing.id !== id) {
                    throw new common_1.BadRequestException('Username is already taken');
                }
                cleanData.username = normalizedUsername;
            }
        }
        return this.prisma.user.update({
            where: { id },
            data: cleanData,
        });
    }
    async updateRefreshToken(id, refreshToken) {
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
    async searchUsers(query) {
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
    async remove(id) {
        return this.prisma.user.delete({
            where: { id }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map