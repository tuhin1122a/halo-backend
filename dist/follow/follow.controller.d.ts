import { FollowService } from './follow.service';
export declare class FollowController {
    private readonly followService;
    constructor(followService: FollowService);
    follow(req: any, userId: string): Promise<{
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
    accept(req: any, userId: string): Promise<{
        success: boolean;
        status: string;
    }>;
    decline(req: any, userId: string): Promise<{
        success: boolean;
        status: string;
    }>;
    unfollow(req: any, userId: string): Promise<{
        success: boolean;
    }>;
    status(req: any, userId: string): Promise<{
        iFollow: import("@prisma/client").$Enums.FollowStatus | null;
        theyFollow: import("@prisma/client").$Enums.FollowStatus | null;
        canChat: boolean;
    }>;
    following(req: any): Promise<{
        name: string | null;
        email: string;
        avatarUrl: string | null;
        isOnline: boolean;
        lastSeen: Date | null;
        id: string;
    }[]>;
    requests(req: any): Promise<{
        followId: string;
        user: {
            name: string | null;
            email: string;
            avatarUrl: string | null;
            isOnline: boolean;
            id: string;
        };
        createdAt: Date;
    }[]>;
}
