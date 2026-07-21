import { PrismaService } from '../prisma/prisma.service';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    getRecentChats(userId: string): Promise<any[]>;
    getConversation(userId: string, otherUserId: string, limit?: number, offset?: number): Promise<({
        sender: {
            id: string;
            email: string;
            avatarUrl: string | null;
            isOnline: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        senderId: string;
        receiverId: string;
        isRead: boolean;
        messageType: string;
        fileUrl: string | null;
        fileName: string | null;
        tempId: string | null;
        replyToId: string | null;
        isPinned: boolean;
    })[]>;
    markAsRead(userId: string, senderId: string): Promise<void>;
    createMessage(data: {
        senderId: string;
        receiverId: string;
        content?: string;
        messageType?: string;
        fileUrl?: string;
        fileName?: string;
        tempId?: string;
        replyToId?: string;
    }): Promise<{
        sender: {
            id: string;
            email: string;
            avatarUrl: string | null;
            isOnline: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        senderId: string;
        receiverId: string;
        isRead: boolean;
        messageType: string;
        fileUrl: string | null;
        fileName: string | null;
        tempId: string | null;
        replyToId: string | null;
        isPinned: boolean;
    }>;
    deleteMessage(userId: string, messageId: string): Promise<void>;
    deleteConversation(userId: string, otherUserId: string): Promise<void>;
    getSharedMedia(userId: string, otherUserId: string, types?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        senderId: string;
        receiverId: string;
        isRead: boolean;
        messageType: string;
        fileUrl: string | null;
        fileName: string | null;
        tempId: string | null;
        replyToId: string | null;
        isPinned: boolean;
    }[]>;
    getChatSettings(userId: string, otherUserId: string): Promise<{
        themeId: string | null;
        quickReaction: string;
        nickname: string | null;
        myNickname: string | null;
        isMuted: boolean;
        disappearingTimer: number;
        wordEffects: string | null;
        isBlocked: boolean;
        isRestricted: boolean;
        hasBlockedMe: boolean;
    }>;
    updateChatSettings(userId: string, otherUserId: string, data: {
        themeId?: string | null;
        quickReaction?: string;
        nickname?: string | null;
        isMuted?: boolean;
        disappearingTimer?: number;
        wordEffects?: string | null;
    }): Promise<{
        themeId: string | null;
        quickReaction: string;
        nickname: string | null;
        myNickname: string | null;
        isMuted: boolean;
        disappearingTimer: number;
        wordEffects: string | null;
        isBlocked: boolean;
        isRestricted: boolean;
        hasBlockedMe: boolean;
    }>;
    blockUser(userId: string, otherUserId: string, isRestricted?: boolean): Promise<void>;
    unblockUser(userId: string, otherUserId: string): Promise<void>;
    searchMessages(userId: string, otherUserId: string, query: string): Promise<({
        sender: {
            id: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        senderId: string;
        receiverId: string;
        isRead: boolean;
        messageType: string;
        fileUrl: string | null;
        fileName: string | null;
        tempId: string | null;
        replyToId: string | null;
        isPinned: boolean;
    })[]>;
    togglePinMessage(userId: string, messageId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        senderId: string;
        receiverId: string;
        isRead: boolean;
        messageType: string;
        fileUrl: string | null;
        fileName: string | null;
        tempId: string | null;
        replyToId: string | null;
        isPinned: boolean;
    }>;
    getPinnedMessages(userId: string, otherUserId: string): Promise<({
        sender: {
            id: string;
            email: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        senderId: string;
        receiverId: string;
        isRead: boolean;
        messageType: string;
        fileUrl: string | null;
        fileName: string | null;
        tempId: string | null;
        replyToId: string | null;
        isPinned: boolean;
    })[]>;
}
