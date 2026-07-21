import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../common/cloudinary.service';
export declare class StoriesService {
    private readonly prisma;
    private readonly cloudinaryService;
    constructor(prisma: PrismaService, cloudinaryService: CloudinaryService);
    createStory(userId: string, file: Express.Multer.File, durationHours?: number): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        imageUrl: string;
        durationHours: number;
    }>;
    getFeedStories(userId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
            isOnline: boolean;
        };
        views: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            storyId: string;
            reaction: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        imageUrl: string;
        durationHours: number;
    })[]>;
    deleteStory(userId: string, storyId: string): Promise<{
        success: boolean;
    }>;
    viewStory(userId: string, storyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storyId: string;
        reaction: string | null;
    }>;
    reactStory(userId: string, storyId: string, reaction: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storyId: string;
        reaction: string | null;
    }>;
}
