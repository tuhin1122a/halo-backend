import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';

// MongoDB ObjectId validation (24-char hex string)
function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

@WebSocketGateway({ cors: true })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected users: userId -> Set of socket IDs
  private connectedUsers = new Map<string, Set<string>>();

  constructor(
    private messagesService: MessagesService,
    private prisma: PrismaService
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId && isValidObjectId(userId)) {
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(client.id);

      // Update user online status
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { isOnline: true }
        });
        // Broadcast online status
        this.server.emit('userStatusChanged', { userId, isOnline: true });
      } catch (e) {}
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId && isValidObjectId(userId) && this.connectedUsers.has(userId)) {
      const userSockets = this.connectedUsers.get(userId)!;
      userSockets.delete(client.id);
      
      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId);
        
        // Update user offline status
        try {
          await this.prisma.user.update({
            where: { id: userId },
            data: { isOnline: false, lastSeen: new Date() }
          });
          // Broadcast offline status
          this.server.emit('userStatusChanged', { userId, isOnline: false });
        } catch (e) {}
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    const { receiverId, content, senderId, tempId, replyToId } = payload;
    
    if (senderId === receiverId) {
      client.emit('error', { message: 'Cannot send message to yourself.' });
      return;
    }
    const block = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: senderId, blockedId: receiverId, isRestricted: false },
          { blockerId: receiverId, blockedId: senderId, isRestricted: false }
        ]
      }
    });

    if (block) {
      client.emit('error', { message: 'Message delivery blocked.' });
      return;
    }

    // Check follow / message-request status
    const followRecord = await this.prisma.follow.findFirst({
      where: {
        OR: [
          { followerId: senderId, followingId: receiverId },
          { followerId: receiverId, followingId: senderId },
        ]
      },
    });

    if (!followRecord) {
      // Auto-create a PENDING follow request so initial message acts as a message request!
      try {
        const newFollow = await this.prisma.follow.create({
          data: {
            followerId: senderId,
            followingId: receiverId,
            status: 'PENDING',
          },
          include: { follower: { select: { id: true, name: true, email: true, avatarUrl: true } } }
        });
        this.emitToUser(receiverId, 'follow:request', {
          from: newFollow.follower,
          followId: newFollow.id,
        });
      } catch (e) {}
    } else if (followRecord.status === 'DECLINED') {
      client.emit('error', { message: 'Message request was declined.' });
      return;
    }

    // Save message to DB
    const message = await this.messagesService.createMessage({
      senderId,
      receiverId,
      content,
      tempId,
      replyToId
    });

    // Check if muted or restricted by receiver to send isSilent flag
    const [user1Id, user2Id] = senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];
    const setting = await this.prisma.chatSetting.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } }
    });

    const isReceiverMuted = setting ? (receiverId === user1Id ? setting.isMutedByUser1 : setting.isMutedByUser2) : false;
    const restrictRelation = await this.prisma.userBlock.findUnique({
      where: { blockerId_blockedId: { blockerId: receiverId, blockedId: senderId } }
    });
    const isReceiverRestricted = restrictRelation ? restrictRelation.isRestricted : false;
    
    const messagePayload = {
      ...message,
      senderName: message.sender?.name || message.sender?.email?.split('@')[0] || 'User',
      senderAvatar: message.sender?.avatarUrl || null,
      isSilent: isReceiverMuted || isReceiverRestricted
    };

    // Send to receiver if online
    if (this.connectedUsers.has(receiverId)) {
      const receiverSockets = this.connectedUsers.get(receiverId)!;
      for (const socketId of receiverSockets) {
        this.server.to(socketId).emit('newMessage', messagePayload);
      }
    }

    // Echo back to sender (all devices)
    if (this.connectedUsers.has(senderId)) {
      const senderSockets = this.connectedUsers.get(senderId)!;
      for (const socketId of senderSockets) {
        this.server.to(socketId).emit('newMessage', messagePayload);
      }
    }
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    const { senderId, receiverId } = payload;
    if (this.connectedUsers.has(receiverId)) {
      const receiverSockets = this.connectedUsers.get(receiverId)!;
      for (const socketId of receiverSockets) {
        this.server.to(socketId).emit('typing', { senderId });
      }
    }
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
    const { senderId, receiverId } = payload;
    if (this.connectedUsers.has(receiverId)) {
      const receiverSockets = this.connectedUsers.get(receiverId)!;
      for (const socketId of receiverSockets) {
        this.server.to(socketId).emit('stopTyping', { senderId });
      }
    }
  }
  // Helper: emit an event to all sockets of a given user
  emitToUser(userId: string, event: string, data: any) {
    if (this.connectedUsers.has(userId)) {
      for (const socketId of this.connectedUsers.get(userId)!) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }
}
