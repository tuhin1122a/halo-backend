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
exports.FollowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const messages_gateway_1 = require("../messages/messages.gateway");
let FollowService = class FollowService {
    prisma;
    messagesGateway;
    constructor(prisma, messagesGateway) {
        this.prisma = prisma;
        this.messagesGateway = messagesGateway;
    }
    async followUser(followerId, followingId) {
        if (followerId === followingId)
            throw new common_1.BadRequestException('You cannot follow yourself');
        const existing = await this.prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });
        if (existing) {
            if (existing.status === client_1.FollowStatus.ACCEPTED)
                throw new common_1.BadRequestException('Already following');
            if (existing.status === client_1.FollowStatus.PENDING)
                throw new common_1.BadRequestException('Follow request already sent');
            return this.prisma.follow.update({
                where: { id: existing.id },
                data: { status: client_1.FollowStatus.PENDING },
            });
        }
        const follow = await this.prisma.follow.create({
            data: { followerId, followingId, status: client_1.FollowStatus.PENDING },
            include: { follower: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        });
        this.messagesGateway.emitToUser(followingId, 'follow:request', {
            from: follow.follower,
            followId: follow.id,
        });
        return { success: true, status: 'PENDING' };
    }
    async acceptFollow(followingId, followerId) {
        const follow = await this.prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });
        if (!follow)
            throw new common_1.NotFoundException('Follow request not found');
        if (follow.status !== client_1.FollowStatus.PENDING)
            throw new common_1.BadRequestException('No pending request to accept');
        const updated = await this.prisma.follow.update({
            where: { id: follow.id },
            data: { status: client_1.FollowStatus.ACCEPTED },
            include: { following: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        });
        const reverseExists = await this.prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: followingId, followingId: followerId } },
        });
        if (!reverseExists) {
            await this.prisma.follow.create({
                data: {
                    followerId: followingId,
                    followingId: followerId,
                    status: client_1.FollowStatus.ACCEPTED,
                },
            });
        }
        else if (reverseExists.status !== client_1.FollowStatus.ACCEPTED) {
            await this.prisma.follow.update({
                where: { id: reverseExists.id },
                data: { status: client_1.FollowStatus.ACCEPTED },
            });
        }
        this.messagesGateway.emitToUser(followerId, 'follow:accepted', {
            by: updated.following,
        });
        return { success: true, status: 'ACCEPTED' };
    }
    async declineFollow(followingId, followerId) {
        const follow = await this.prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });
        if (!follow)
            throw new common_1.NotFoundException('Follow request not found');
        await this.prisma.follow.update({
            where: { id: follow.id },
            data: { status: client_1.FollowStatus.DECLINED },
        });
        return { success: true, status: 'DECLINED' };
    }
    async unfollowUser(followerId, followingId) {
        await this.prisma.follow.deleteMany({
            where: { followerId, followingId },
        });
        return { success: true };
    }
    async getFollowStatus(currentUserId, targetUserId) {
        const [iFollow, theyFollow] = await Promise.all([
            this.prisma.follow.findUnique({
                where: { followerId_followingId: { followerId: currentUserId, followingId: targetUserId } },
            }),
            this.prisma.follow.findUnique({
                where: { followerId_followingId: { followerId: targetUserId, followingId: currentUserId } },
            }),
        ]);
        return {
            iFollow: iFollow?.status ?? null,
            theyFollow: theyFollow?.status ?? null,
            canChat: iFollow?.status === client_1.FollowStatus.ACCEPTED || theyFollow?.status === client_1.FollowStatus.ACCEPTED,
        };
    }
    async getFollowing(userId) {
        const follows = await this.prisma.follow.findMany({
            where: { followerId: userId, status: client_1.FollowStatus.ACCEPTED },
            include: {
                following: {
                    select: {
                        id: true, name: true, email: true, avatarUrl: true, isOnline: true, lastSeen: true,
                    },
                },
            },
        });
        return follows.map((f) => f.following);
    }
    async getIncomingRequests(userId) {
        const requests = await this.prisma.follow.findMany({
            where: { followingId: userId, status: client_1.FollowStatus.PENDING },
            orderBy: { createdAt: 'desc' },
            include: {
                follower: {
                    select: {
                        id: true, name: true, email: true, avatarUrl: true, isOnline: true,
                    },
                },
            },
        });
        return requests.map((r) => ({
            followId: r.id,
            user: r.follower,
            createdAt: r.createdAt,
        }));
    }
};
exports.FollowService = FollowService;
exports.FollowService = FollowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        messages_gateway_1.MessagesGateway])
], FollowService);
//# sourceMappingURL=follow.service.js.map