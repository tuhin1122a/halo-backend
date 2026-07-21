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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const messages_service_1 = require("./messages.service");
const prisma_service_1 = require("../prisma/prisma.service");
function isValidObjectId(id) {
    return /^[a-f\d]{24}$/i.test(id);
}
let MessagesGateway = class MessagesGateway {
    messagesService;
    prisma;
    server;
    connectedUsers = new Map();
    constructor(messagesService, prisma) {
        this.messagesService = messagesService;
        this.prisma = prisma;
    }
    async handleConnection(client) {
        const userId = client.handshake.query.userId;
        if (userId && isValidObjectId(userId)) {
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            this.connectedUsers.get(userId).add(client.id);
            try {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { isOnline: true }
                });
                this.server.emit('userStatusChanged', { userId, isOnline: true });
            }
            catch (e) { }
        }
    }
    async handleDisconnect(client) {
        const userId = client.handshake.query.userId;
        if (userId && isValidObjectId(userId) && this.connectedUsers.has(userId)) {
            const userSockets = this.connectedUsers.get(userId);
            userSockets.delete(client.id);
            if (userSockets.size === 0) {
                this.connectedUsers.delete(userId);
                try {
                    await this.prisma.user.update({
                        where: { id: userId },
                        data: { isOnline: false, lastSeen: new Date() }
                    });
                    this.server.emit('userStatusChanged', { userId, isOnline: false });
                }
                catch (e) { }
            }
        }
    }
    async handleSendMessage(client, payload) {
        const { receiverId, content, senderId, tempId, replyToId } = payload;
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
        const followRecord = await this.prisma.follow.findFirst({
            where: {
                OR: [
                    { followerId: senderId, followingId: receiverId },
                    { followerId: receiverId, followingId: senderId },
                ],
                status: 'ACCEPTED',
            },
        });
        if (!followRecord) {
            client.emit('error', { message: 'You must be connected to chat. Send a follow request first.' });
            return;
        }
        const message = await this.messagesService.createMessage({
            senderId,
            receiverId,
            content,
            tempId,
            replyToId
        });
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
            isSilent: isReceiverMuted || isReceiverRestricted
        };
        if (this.connectedUsers.has(receiverId)) {
            const receiverSockets = this.connectedUsers.get(receiverId);
            for (const socketId of receiverSockets) {
                this.server.to(socketId).emit('newMessage', messagePayload);
            }
        }
        if (this.connectedUsers.has(senderId)) {
            const senderSockets = this.connectedUsers.get(senderId);
            for (const socketId of senderSockets) {
                this.server.to(socketId).emit('newMessage', messagePayload);
            }
        }
    }
    handleTyping(client, payload) {
        const { senderId, receiverId } = payload;
        if (this.connectedUsers.has(receiverId)) {
            const receiverSockets = this.connectedUsers.get(receiverId);
            for (const socketId of receiverSockets) {
                this.server.to(socketId).emit('typing', { senderId });
            }
        }
    }
    handleStopTyping(client, payload) {
        const { senderId, receiverId } = payload;
        if (this.connectedUsers.has(receiverId)) {
            const receiverSockets = this.connectedUsers.get(receiverId);
            for (const socketId of receiverSockets) {
                this.server.to(socketId).emit('stopTyping', { senderId });
            }
        }
    }
    emitToUser(userId, event, data) {
        if (this.connectedUsers.has(userId)) {
            for (const socketId of this.connectedUsers.get(userId)) {
                this.server.to(socketId).emit(event, data);
            }
        }
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stopTyping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], MessagesGateway.prototype, "handleStopTyping", null);
exports.MessagesGateway = MessagesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        prisma_service_1.PrismaService])
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map