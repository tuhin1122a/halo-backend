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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MessagesService = class MessagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRecentChats(userId) {
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, email: true, name: true, avatarUrl: true, isOnline: true } },
                receiver: { select: { id: true, email: true, name: true, avatarUrl: true, isOnline: true } }
            }
        });
        const chatsMap = new Map();
        for (const msg of messages) {
            const isSender = msg.senderId === userId;
            const partner = isSender ? msg.receiver : msg.sender;
            if (!chatsMap.has(partner.id)) {
                chatsMap.set(partner.id, {
                    id: partner.id,
                    email: partner.email,
                    name: partner.name,
                    avatarUrl: partner.avatarUrl,
                    isOnline: partner.isOnline,
                    lastMessage: msg.messageType === 'text' ? msg.content : `[${msg.messageType}]`,
                    lastTimestamp: msg.createdAt,
                    unreadCount: 0
                });
            }
            if (!msg.isRead && msg.receiverId === userId) {
                chatsMap.get(partner.id).unreadCount += 1;
            }
        }
        const finalChats = [];
        for (const chat of chatsMap.values()) {
            const followRelation = await this.prisma.follow.findFirst({
                where: {
                    OR: [
                        { followerId: userId, followingId: chat.id, status: 'ACCEPTED' },
                        { followerId: chat.id, followingId: userId, status: 'ACCEPTED' }
                    ]
                }
            });
            if (followRelation) {
                finalChats.push(chat);
            }
        }
        return finalChats.sort((a, b) => b.lastTimestamp.getTime() - a.lastTimestamp.getTime());
    }
    async getConversation(userId, otherUserId, limit = 30, offset = 0) {
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
            include: {
                sender: { select: { id: true, email: true, avatarUrl: true, isOnline: true } }
            }
        });
        return messages.reverse();
    }
    async markAsRead(userId, senderId) {
        await this.prisma.message.updateMany({
            where: {
                senderId: senderId,
                receiverId: userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
    }
    async createMessage(data) {
        return this.prisma.message.create({
            data: {
                senderId: data.senderId,
                receiverId: data.receiverId,
                content: data.content,
                messageType: data.messageType || 'text',
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                tempId: data.tempId,
                replyToId: data.replyToId
            },
            include: {
                sender: { select: { id: true, email: true, avatarUrl: true, isOnline: true } }
            }
        });
    }
    async deleteMessage(userId, messageId) {
        const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!msg)
            throw new common_1.NotFoundException('Message not found');
        if (msg.senderId !== userId)
            throw new common_1.ForbiddenException('You can only delete your own messages');
        await this.prisma.message.delete({ where: { id: messageId } });
    }
    async deleteConversation(userId, otherUserId) {
        await this.prisma.message.deleteMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            }
        });
    }
    async getSharedMedia(userId, otherUserId, types) {
        const typeArray = types ? types.split(',') : ['image', 'voice', 'file'];
        return this.prisma.message.findMany({
            where: {
                messageType: { in: typeArray },
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getChatSettings(userId, otherUserId) {
        const [user1Id, user2Id] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];
        let setting = await this.prisma.chatSetting.findUnique({
            where: {
                user1Id_user2Id: { user1Id, user2Id }
            }
        });
        if (!setting) {
            setting = await this.prisma.chatSetting.create({
                data: {
                    user1Id,
                    user2Id
                }
            });
        }
        const myBlock = await this.prisma.userBlock.findUnique({
            where: {
                blockerId_blockedId: { blockerId: userId, blockedId: otherUserId }
            }
        });
        const otherBlock = await this.prisma.userBlock.findUnique({
            where: {
                blockerId_blockedId: { blockerId: otherUserId, blockedId: userId }
            }
        });
        const isMuted = userId === user1Id ? setting.isMutedByUser1 : setting.isMutedByUser2;
        const nickname = userId === user1Id ? setting.user2Nickname : setting.user1Nickname;
        const myNickname = userId === user1Id ? setting.user1Nickname : setting.user2Nickname;
        return {
            themeId: setting.themeId,
            quickReaction: setting.quickReaction,
            nickname,
            myNickname,
            isMuted,
            disappearingTimer: setting.disappearingTimer,
            wordEffects: setting.wordEffects,
            isBlocked: myBlock ? !myBlock.isRestricted : false,
            isRestricted: myBlock ? myBlock.isRestricted : false,
            hasBlockedMe: otherBlock ? true : false
        };
    }
    async updateChatSettings(userId, otherUserId, data) {
        const [user1Id, user2Id] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];
        const updateData = {};
        if (data.themeId !== undefined)
            updateData.themeId = data.themeId;
        if (data.quickReaction !== undefined)
            updateData.quickReaction = data.quickReaction;
        if (data.disappearingTimer !== undefined)
            updateData.disappearingTimer = data.disappearingTimer;
        if (data.wordEffects !== undefined)
            updateData.wordEffects = data.wordEffects;
        if (data.nickname !== undefined) {
            if (userId === user1Id) {
                updateData.user2Nickname = data.nickname;
            }
            else {
                updateData.user1Nickname = data.nickname;
            }
        }
        if (data.isMuted !== undefined) {
            if (userId === user1Id) {
                updateData.isMutedByUser1 = data.isMuted;
            }
            else {
                updateData.isMutedByUser2 = data.isMuted;
            }
        }
        await this.prisma.chatSetting.upsert({
            where: {
                user1Id_user2Id: { user1Id, user2Id }
            },
            update: updateData,
            create: {
                user1Id,
                user2Id,
                ...updateData
            }
        });
        return this.getChatSettings(userId, otherUserId);
    }
    async blockUser(userId, otherUserId, isRestricted = false) {
        await this.prisma.userBlock.upsert({
            where: {
                blockerId_blockedId: { blockerId: userId, blockedId: otherUserId }
            },
            update: {
                isRestricted
            },
            create: {
                blockerId: userId,
                blockedId: otherUserId,
                isRestricted
            }
        });
    }
    async unblockUser(userId, otherUserId) {
        const block = await this.prisma.userBlock.findUnique({
            where: {
                blockerId_blockedId: { blockerId: userId, blockedId: otherUserId }
            }
        });
        if (block) {
            await this.prisma.userBlock.delete({
                where: {
                    blockerId_blockedId: { blockerId: userId, blockedId: otherUserId }
                }
            });
        }
    }
    async searchMessages(userId, otherUserId, query) {
        return this.prisma.message.findMany({
            where: {
                content: {
                    contains: query,
                    mode: 'insensitive'
                },
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, email: true, avatarUrl: true } }
            }
        });
    }
    async togglePinMessage(userId, messageId) {
        const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!msg)
            throw new common_1.NotFoundException('Message not found');
        if (msg.senderId !== userId && msg.receiverId !== userId) {
            throw new common_1.ForbiddenException('Not authorized');
        }
        return this.prisma.message.update({
            where: { id: messageId },
            data: { isPinned: !msg.isPinned }
        });
    }
    async getPinnedMessages(userId, otherUserId) {
        return this.prisma.message.findMany({
            where: {
                isPinned: true,
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, email: true, avatarUrl: true } }
            }
        });
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map