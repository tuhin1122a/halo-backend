import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { FollowStatus } from '@prisma/client';

@Injectable()
export class StoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createStory(userId: string, file: Express.Multer.File, durationHours: number = 24) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
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
    } catch (error) {
      throw new BadRequestException('Failed to create story: ' + error.message);
    }
  }

  async getFeedStories(userId: string) {
    // 1. Get userIds of users followed by the current user (ACCEPTED only)
    const follows = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
        status: FollowStatus.ACCEPTED,
      },
      select: {
        followingId: true,
      },
    });

    const followedUserIds = follows.map((f) => f.followingId);

    // 2. Combine own userId and followed userIds
    const queryUserIds = [userId, ...followedUserIds];

    // 3. Get stories created in the last 48 hours (max possible duration)
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
      const durationMs = ((story as any).durationHours || 24) * 60 * 60 * 1000;
      return story.createdAt.getTime() + durationMs > now;
    });
  }

  async deleteStory(userId: string, storyId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new BadRequestException('Story not found');
    }

    if (story.userId !== userId) {
      throw new BadRequestException('Unauthorized to delete this story');
    }

    await this.prisma.story.delete({
      where: { id: storyId },
    });

    return { success: true };
  }

  async viewStory(userId: string, storyId: string) {
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

  async reactStory(userId: string, storyId: string, reaction: string) {
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
}
