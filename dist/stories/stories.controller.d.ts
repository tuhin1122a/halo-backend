import { StoriesService } from './stories.service';
export declare class StoriesController {
    private readonly storiesService;
    constructor(storiesService: StoriesService);
    uploadStory(req: any, file: Express.Multer.File, durationHours?: string): Promise<{
        user: {
            name: string | null;
            email: string;
            avatarUrl: string | null;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        imageUrl: string;
        durationHours: number;
    }>;
    getFeed(req: any): Promise<({
        user: {
            name: string | null;
            email: string;
            avatarUrl: string | null;
            isOnline: boolean;
            id: string;
        };
        views: ({
            user: {
                name: string | null;
                email: string;
                avatarUrl: string | null;
                id: string;
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
    deleteStory(req: any, id: string): Promise<{
        success: boolean;
    }>;
    viewStory(req: any, storyId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storyId: string;
        reaction: string | null;
    }>;
    reactStory(req: any, storyId: string, reaction: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storyId: string;
        reaction: string | null;
    }>;
}
