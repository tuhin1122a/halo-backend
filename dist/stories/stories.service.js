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
exports.StoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../common/cloudinary.service");
const client_1 = require("@prisma/client");
let StoriesService = class StoriesService {
    prisma;
    cloudinaryService;
    constructor(prisma, cloudinaryService) {
        this.prisma = prisma;
        this.cloudinaryService = cloudinaryService;
    }
    async createStory(userId, file, durationHours = 24) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        try {
            const imageUrl = await this.cloudinaryService.uploadImage(file);
            const validDuration = [12, 24, 48].includes(durationHours) ? durationHours : 24;
            const story = await this.prisma.story.create({
                data: {
                    userId,
                    imageUrl,
                    durationHours: validDuration,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            return story;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create story: ' + error.message);
        }
    }
    async getFeedStories(userId) {
        const follows = await this.prisma.follow.findMany({
            where: {
                followerId: userId,
                status: client_1.FollowStatus.ACCEPTED,
            },
            select: {
                followingId: true,
            },
        });
        const followedUserIds = follows.map((f) => f.followingId);
        const queryUserIds = [userId, ...followedUserIds];
        const maxWindow = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const stories = await this.prisma.story.findMany({
            where: {
                userId: { in: queryUserIds },
                createdAt: { gte: maxWindow },
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        isOnline: true,
                    },
                },
                views: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });
        const now = Date.now();
        return stories.filter((story) => {
            const durationMs = (story.durationHours || 24) * 60 * 60 * 1000;
            return story.createdAt.getTime() + durationMs > now;
        });
    }
    async deleteStory(userId, storyId) {
        const story = await this.prisma.story.findUnique({
            where: { id: storyId },
        });
        if (!story) {
            throw new common_1.BadRequestException('Story not found');
        }
        if (story.userId !== userId) {
            throw new common_1.BadRequestException('Unauthorized to delete this story');
        }
        await this.prisma.story.delete({
            where: { id: storyId },
        });
        return { success: true };
    }
    async viewStory(userId, storyId) {
        return this.prisma.storyView.upsert({
            where: {
                storyId_userId: { storyId, userId },
            },
            update: {},
            create: {
                storyId,
                userId,
            },
        });
    }
    async reactStory(userId, storyId, reaction) {
        return this.prisma.storyView.upsert({
            where: {
                storyId_userId: { storyId, userId },
            },
            update: {
                reaction,
            },
            create: {
                storyId,
                userId,
                reaction,
            },
        });
    }
};
exports.StoriesService = StoriesService;
exports.StoriesService = StoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], StoriesService);
//# sourceMappingURL=stories.service.js.map