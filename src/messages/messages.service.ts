import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getRecentChats(userId: string) {
    // Get all messages where user is sender or receiver
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

    // Group by conversation partner
    const chatsMap = new Map<string, any>();

    for (const msg of messages) {
      const isSender = msg.senderId === userId;
      const partner = isSender ? msg.receiver : msg.sender;

      if (!partner) continue;

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

      // Count unread messages sent TO the user
      if (!msg.isRead && msg.receiverId === userId) {
        chatsMap.get(partner.id).unreadCount += 1;
      }
    }

    const finalChats = Array.from(chatsMap.values());
    return finalChats.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
  }

  async getConversation(userId: string, otherUserId: string, limit: number = 30, offset: number = 0) {
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

    // Android expects oldest at the top or newest at bottom?
    // Based on Android code, it adds them to the list. Wait, if it's stackFromEnd = true, usually order matters.
    // If we return desc, we might need to reverse it. But wait, let's keep it desc and let Android handle it.
    // Actually, Android adds them to index 0: `messages.addAll(0, body)` if it's fetching older, or `messages.addAll(body)` on initial load.
    // For initial load, Android expects chronological order (oldest first). Wait.
    // In Android: limit=30, offset=0. If we return desc, then `messages.last()` will be the oldest.
    // Let's reverse the array before returning so it's chronologically ordered (oldest first, newest last).
    return messages.reverse();
  }

  async markAsRead(userId: string, senderId: string) {
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

  async createMessage(data: {
    senderId: string;
    receiverId: string;
    content?: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    tempId?: string;
    replyToId?: string;
  }) {
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

  async deleteMessage(userId: string, messageId: string) {
    const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.senderId !== userId) throw new ForbiddenException('You can only delete your own messages');
    
    await this.prisma.message.delete({ where: { id: messageId } });
  }

  async deleteConversation(userId: string, otherUserId: string) {
    await this.prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      }
    });
  }

  async getSharedMedia(userId: string, otherUserId: string, types?: string) {
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

  async getChatSettings(userId: string, otherUserId: string) {
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

  async updateChatSettings(userId: string, otherUserId: string, data: {
    themeId?: string | null;
    quickReaction?: string;
    nickname?: string | null;
    isMuted?: boolean;
    disappearingTimer?: number;
    wordEffects?: string | null;
  }) {
    const [user1Id, user2Id] = userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];
    
    const updateData: any = {};
    if (data.themeId !== undefined) updateData.themeId = data.themeId;
    if (data.quickReaction !== undefined) updateData.quickReaction = data.quickReaction;
    if (data.disappearingTimer !== undefined) updateData.disappearingTimer = data.disappearingTimer;
    if (data.wordEffects !== undefined) updateData.wordEffects = data.wordEffects;
    
    if (data.nickname !== undefined) {
      if (userId === user1Id) {
        updateData.user2Nickname = data.nickname;
      } else {
        updateData.user1Nickname = data.nickname;
      }
    }

    if (data.isMuted !== undefined) {
      if (userId === user1Id) {
        updateData.isMutedByUser1 = data.isMuted;
      } else {
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

  async blockUser(userId: string, otherUserId: string, isRestricted: boolean = false) {
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

  async unblockUser(userId: string, otherUserId: string) {
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

  async searchMessages(userId: string, otherUserId: string, query: string) {
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

  async togglePinMessage(userId: string, messageId: string) {
    const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');
    
    // Verify user is sender or receiver
    if (msg.senderId !== userId && msg.receiverId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isPinned: !msg.isPinned }
    });
  }

  async getPinnedMessages(userId: string, otherUserId: string) {
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
}
