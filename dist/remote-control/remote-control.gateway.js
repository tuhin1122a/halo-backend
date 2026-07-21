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
exports.RemoteControlGateway = void 0;
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
const remote_control_service_1 = require("./remote-control.service");
function isValidObjectId(id) {
    return /^[a-f\d]{24}$/i.test(id);
}
let RemoteControlGateway = class RemoteControlGateway {
    remoteControlService;
    jwtService;
    prisma;
    server;
    constructor(remoteControlService, jwtService, prisma) {
        this.remoteControlService = remoteControlService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async handleConnection(client) {
        const authHeader = client.handshake.auth?.token;
        const queryToken = client.handshake.query?.token;
        try {
            const token = (authHeader || queryToken);
            if (!token) {
                client.disconnect();
                return;
            }
            const decoded = this.jwtService.verify(token);
            const userId = decoded.sub;
            client['userId'] = userId;
            client.join(`user_${userId}`);
        }
        catch (error) {
            client.disconnect();
        }
    }
    async handleUpdatePresence(client, data) {
        const userId = client['userId'];
        if (userId && isValidObjectId(userId)) {
            try {
                await this.prisma.user.updateMany({
                    where: { id: userId },
                    data: { isOnline: data.isOnline, lastSeen: new Date() },
                });
                const namespaces = ['/', '/remote-control'];
                namespaces.forEach(ns => {
                    this.server.of(ns).emit('userStatusChanged', { userId, isOnline: data.isOnline });
                });
            }
            catch (e) { }
        }
    }
    async handleDisconnect(client) {
        const userId = client['userId'];
        if (userId && isValidObjectId(userId)) {
            try {
                await this.prisma.user.updateMany({
                    where: { id: userId },
                    data: { isOnline: false, lastSeen: new Date() },
                });
                const namespaces = ['/', '/remote-control'];
                namespaces.forEach(ns => {
                    this.server.of(ns).emit('userStatusChanged', { userId, isOnline: false });
                });
            }
            catch (e) { }
        }
        await this.remoteControlService.handleDeviceDisconnect(client.id);
    }
    async handleDeviceRegister(client, data) {
        try {
            const userId = client['userId'];
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const device = await this.remoteControlService.registerDevice(userId, data.deviceInfo, client.id);
            client.join(`device:${device.id}`);
            return {
                success: true,
                device,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async handleSessionStart(client, data) {
        try {
            const userId = client['userId'];
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const session = await this.remoteControlService.startSession(data.deviceId, client.id, userId);
            client.join(`session:${session.id}`);
            this.server.to(`device:${data.deviceId}`).emit('session:request', {
                sessionId: session.id,
                webClientId: client.id,
            });
            return {
                success: true,
                session,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async handleSessionResponse(client, data) {
        try {
            const session = await this.remoteControlService.getSession(data.sessionId);
            if (!session)
                return { success: false, error: 'Session not found' };
            const device = await this.remoteControlService.getDevice(session.deviceId);
            if (device?.userId !== client['userId']) {
                return { success: false, error: 'Unauthorized' };
            }
            await this.remoteControlService.updateSessionStatus(data.sessionId, data.accepted);
            this.server.to(`session:${data.sessionId}`).emit('session:status', {
                accepted: data.accepted,
                session,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleCommandSend(client, data) {
        try {
            const session = await this.remoteControlService.getSession(data.sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            const device = await this.remoteControlService.getDevice(session.deviceId);
            if (device?.userId !== client['userId']) {
                throw new Error('Unauthorized: You do not own this device/session');
            }
            const command = await this.remoteControlService.createCommand(data.sessionId, data.type, data.payload);
            if (session) {
                this.server.to(`device:${session.deviceId}`).emit('command:execute', {
                    commandId: command.id,
                    type: command.type,
                    payload: command.payload,
                });
            }
            return {
                success: true,
                commandId: command.id,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async handleCommandResult(client, data) {
        try {
            const command = await this.remoteControlService.getCommand(data.commandId);
            if (!command)
                throw new Error('Command not found');
            const session = await this.remoteControlService.getSession(command.sessionId);
            if (!session)
                throw new Error('Session not found');
            const device = await this.remoteControlService.getDevice(session.deviceId);
            if (device?.userId !== client['userId']) {
                return { success: false, error: 'Unauthorized' };
            }
            await this.remoteControlService.updateCommandStatus(data.commandId, data.status, data.result, data.error);
            this.server.to(`session:${command.sessionId}`).emit('command:completed', {
                ...data,
                type: command.type,
            });
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    async handleWebRTCOffer(client, data) {
        const session = await this.remoteControlService.getSession(data.sessionId);
        if (session) {
            const device = await this.remoteControlService.getDevice(session.deviceId);
            if (device?.userId !== client['userId']) {
                return { success: false, error: 'Unauthorized' };
            }
            this.server.to(`device:${session.deviceId}`).emit('webrtc:offer', data);
        }
        else {
        }
        return { success: true };
    }
    async handleWebRTCAnswer(client, data) {
        const session = await this.remoteControlService.getSession(data.sessionId);
        if (session) {
            const device = await this.remoteControlService.getDevice(session.deviceId);
            if (device?.userId !== client['userId']) {
                return { success: false, error: 'Unauthorized' };
            }
            this.server.to(`session:${data.sessionId}`).emit('webrtc:answer', data);
        }
        return { success: true };
    }
    async handleICECandidate(client, data) {
        const session = await this.remoteControlService.getSession(data.sessionId);
        if (!session)
            return { success: false, error: 'Session not found' };
        const device = await this.remoteControlService.getDevice(session.deviceId);
        if (device?.userId !== client['userId']) {
            return { success: false, error: 'Unauthorized' };
        }
        if (data.target === 'web') {
            this.server.to(`session:${data.sessionId}`).emit('webrtc:ice-candidate', data);
        }
        else {
            this.server.to(`device:${session.deviceId}`).emit('webrtc:ice-candidate', data);
        }
        return { success: true };
    }
    async handleNotificationReceive(client, data) {
        if (!data.sessionId)
            return;
        const session = await this.remoteControlService.getSession(data.sessionId);
        if (session) {
            const device = await this.remoteControlService.getDevice(session.deviceId);
            if (device?.userId === client['userId']) {
                this.server.to(`session:${data.sessionId}`).emit('notification:receive', data);
            }
        }
    }
    async handleScreenFrame(client, data) {
        const session = await this.remoteControlService.getSession(data.sessionId);
        if (session) {
            const device = await this.remoteControlService.getDevice(session.deviceId);
            if (device?.userId !== client['userId']) {
                return;
            }
            if (data.type !== 'camera') {
            }
            this.server.to(`session:${data.sessionId}`).emit('screen:frame', {
                frame: data.frame,
                type: data.type,
            });
        }
    }
};
exports.RemoteControlGateway = RemoteControlGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RemoteControlGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('updatePresence'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleUpdatePresence", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('device:register'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleDeviceRegister", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('session:start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleSessionStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('session:response'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleSessionResponse", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('command:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleCommandSend", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('command:result'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleCommandResult", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc:offer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleWebRTCOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc:answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleWebRTCAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc:ice-candidate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleICECandidate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('notification:receive'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleNotificationReceive", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('screen:frame'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RemoteControlGateway.prototype, "handleScreenFrame", null);
exports.RemoteControlGateway = RemoteControlGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: [
                'https://taskpro.codevionix.com',
                'http://localhost:3000',
                'http://localhost:5173'
            ],
            credentials: true,
        },
        maxHttpBufferSize: 1e8,
    }),
    __metadata("design:paramtypes", [remote_control_service_1.RemoteControlService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], RemoteControlGateway);
//# sourceMappingURL=remote-control.gateway.js.map