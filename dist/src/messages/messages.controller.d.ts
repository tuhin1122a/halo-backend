import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    getRecentChats(req: any): Promise<any[]>;
    getConversation(req: any, otherUserId: string, limit?: string, offset?: string): Promise<({
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
    markAsRead(req: any, senderId: string): Promise<{
        success: boolean;
    }>;
    uploadMessageFile(req: any, receiverId: string, messageType: string, tempId: string, file: Express.Multer.File): Promise<{
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
    getSharedMedia(req: any, otherUserId: string, types?: string): Promise<{
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
    deleteConversation(req: any, otherUserId: string): Promise<{
        success: boolean;
    }>;
    deleteMessage(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getChatSettings(req: any, otherUserId: string): Promise<{
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
    updateChatSettings(req: any, otherUserId: string, body: {
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
    blockUser(req: any, otherUserId: string): Promise<{
        success: boolean;
    }>;
    unblockUser(req: any, otherUserId: string): Promise<{
        success: boolean;
    }>;
    restrictUser(req: any, otherUserId: string): Promise<{
        success: boolean;
    }>;
    unrestrictUser(req: any, otherUserId: string): Promise<{
        success: boolean;
    }>;
    searchMessages(req: any, otherUserId: string, query: string): Promise<({
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
    togglePinMessage(req: any, messageId: string): Promise<{
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
    getPinnedMessages(req: any, otherUserId: string): Promise<({
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
