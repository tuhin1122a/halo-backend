import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowStatus } from '@prisma/client';
import { MessagesGateway } from '../messages/messages.gateway';

@Injectable()
export class FollowService {
  constructor(
    private prisma: PrismaService,
    private messagesGateway: MessagesGateway,
  ) {}

  // Send a follow / message request
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId)
      throw new BadRequestException('You cannot follow yourself');

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      if (existing.status === FollowStatus.ACCEPTED)
        throw new BadRequestException('Already following');
      if (existing.status === FollowStatus.PENDING)
        throw new BadRequestException('Follow request already sent');
      // If DECLINED, allow re-sending
      return this.prisma.follow.update({
        where: { id: existing.id },
        data: { status: FollowStatus.PENDING },
      });
    }

    const follow = await this.prisma.follow.create({
      data: { followerId, followingId, status: FollowStatus.PENDING },
      include: { follower: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });

    // Notify via socket
    this.messagesGateway.emitToUser(followingId, 'follow:request', {
      from: follow.follower,
      followId: follow.id,
    });

    return { success: true, status: 'PENDING' };
  }

  // Accept a follow request
  async acceptFollow(followingId: string, followerId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!follow) throw new NotFoundException('Follow request not found');
    if (follow.status !== FollowStatus.PENDING)
      throw new BadRequestException('No pending request to accept');

    // Accept the original request (A → B becomes ACCEPTED)
    const updated = await this.prisma.follow.update({
      where: { id: follow.id },
      data: { status: FollowStatus.ACCEPTED },
      include: { following: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });

    // Auto-create mutual follow: B → A (ACCEPTED) if not already exists
    const reverseExists = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: followingId, followingId: followerId } },
    });

    if (!reverseExists) {
      // Create a new accepted follow from the acceptor back to the requester
      await this.prisma.follow.create({
        data: {
          followerId: followingId,
          followingId: followerId,
          status: FollowStatus.ACCEPTED,
        },
      });
    } else if (reverseExists.status !== FollowStatus.ACCEPTED) {
      // If it exists but is not ACCEPTED (e.g. DECLINED/PENDING), upgrade it
      await this.prisma.follow.update({
        where: { id: reverseExists.id },
        data: { status: FollowStatus.ACCEPTED },
      });
    }

    // Notify sender that request was accepted
    this.messagesGateway.emitToUser(followerId, 'follow:accepted', {
      by: updated.following,
    });

    return { success: true, status: 'ACCEPTED' };
  }

  // Decline a follow request
  async declineFollow(followingId: string, followerId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!follow) throw new NotFoundException('Follow request not found');

    await this.prisma.follow.update({
      where: { id: follow.id },
      data: { status: FollowStatus.DECLINED },
    });

    return { success: true, status: 'DECLINED' };
  }

  // Unfollow
  async unfollowUser(followerId: string, followingId: string) {
    await this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    });
    return { success: true };
  }

  // Check follow status between two users (from current user's perspective)
  async getFollowStatus(currentUserId: string, targetUserId: string) {
    const [iFollow, theyFollow] = await Promise.all([
      this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: targetUserId } },
      }),
      this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: targetUserId, followingId: currentUserId } },
      }),
    ]);

    return {
      iFollow: iFollow?.status ?? null,        // PENDING / ACCEPTED / DECLINED / null
      theyFollow: theyFollow?.status ?? null,  // PENDING / ACCEPTED / DECLINED / null
      canChat: iFollow?.status === FollowStatus.ACCEPTED || theyFollow?.status === FollowStatus.ACCEPTED,
    };
  }

  // Get list of users you follow (ACCEPTED only) — for Story bar
  async getFollowing(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId, status: FollowStatus.ACCEPTED },
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

  // Get incoming pending follow requests — for Message Requests inbox
  async getIncomingRequests(userId: string) {
    const requests = await this.prisma.follow.findMany({
      where: { followingId: userId, status: FollowStatus.PENDING },
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
}
