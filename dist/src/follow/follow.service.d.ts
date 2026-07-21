import { PrismaService } from '../prisma/prisma.service';
import { MessagesGateway } from '../messages/messages.gateway';
export declare class FollowService {
    private prisma;
    private messagesGateway;
    constructor(prisma: PrismaService, messagesGateway: MessagesGateway);
    followUser(followerId: string, followingId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.FollowStatus;
        followerId: string;
        followingId: string;
    } | {
        success: boolean;
        status: string;
    }>;
    acceptFollow(followingId: string, followerId: string): Promise<{
        success: boolean;
        status: string;
    }>;
    declineFollow(followingId: string, followerId: string): Promise<{
        success: boolean;
        status: string;
    }>;
    unfollowUser(followerId: string, followingId: string): Promise<{
        success: boolean;
    }>;
    getFollowStatus(currentUserId: string, targetUserId: string): Promise<{
        iFollow: import("@prisma/client").$Enums.FollowStatus | null;
        theyFollow: import("@prisma/client").$Enums.FollowStatus | null;
        canChat: boolean;
    }>;
    getFollowing(userId: string): Promise<{
        id: string;
        email: string;
        name: string | null;
        avatarUrl: string | null;
        isOnline: boolean;
        lastSeen: Date | null;
    }[]>;
    getIncomingRequests(userId: string): Promise<{
        followId: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
            isOnline: boolean;
        };
        createdAt: Date;
    }[]>;
}
