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
var RemoteControlService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteControlService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let RemoteControlService = RemoteControlService_1 = class RemoteControlService {
    prisma;
    logger = new common_1.Logger(RemoteControlService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async retryOnWriteConflict(fn, maxRetries = 5, delayMs = 100) {
        let attempt = 0;
        while (true) {
            try {
                return await fn();
            }
            catch (error) {
                attempt++;
                const isWriteConflict = error?.code === 'P2034' ||
                    (error?.message &&
                        (error.message.includes('write conflict') ||
                            error.message.includes('deadlock') ||
                            error.message.includes('Transaction failed')));
                if (isWriteConflict && attempt <= maxRetries) {
                    this.logger.warn(`Prisma write conflict detected (attempt ${attempt}/${maxRetries}). Retrying...`);
                    const backoff = delayMs * Math.pow(2, attempt - 1) + Math.random() * 50;
                    await new Promise((resolve) => setTimeout(resolve, backoff));
                    continue;
                }
                throw error;
            }
        }
    }
    async registerDevice(userId, deviceInfo, socketId) {
        return this.retryOnWriteConflict(() => this.prisma.registeredDevice.upsert({
            where: { deviceId: deviceInfo.deviceId },
            update: {
                userId,
                status: client_1.DeviceStatus.ONLINE,
                socketId,
                lastSeen: new Date(),
                ...deviceInfo,
            },
            create: {
                userId,
                ...deviceInfo,
                socketId,
                status: client_1.DeviceStatus.ONLINE,
            },
        }));
    }
    async handleDeviceDisconnect(socketId) {
        return this.retryOnWriteConflict(async () => {
            const device = await this.prisma.registeredDevice.findFirst({
                where: { socketId },
            });
            if (device) {
                await this.prisma.registeredDevice.updateMany({
                    where: { id: device.id },
                    data: {
                        status: client_1.DeviceStatus.OFFLINE,
                        socketId: null,
                    },
                });
                await this.prisma.remoteSession.updateMany({
                    where: {
                        deviceId: device.id,
                        isActive: true,
                    },
                    data: {
                        isActive: false,
                        endedAt: new Date(),
                    },
                });
            }
        });
    }
    async getUserDevices(userId) {
        return this.prisma.registeredDevice.findMany({
            where: {
                userId,
                isActive: true,
            },
            orderBy: {
                lastSeen: 'desc',
            },
        });
    }
    async startSession(deviceId, webSocketId, requestingUserId) {
        const device = await this.prisma.registeredDevice.findUnique({
            where: { id: deviceId },
        });
        if (!device) {
            throw new Error('Device not found');
        }
        if (device.userId !== requestingUserId) {
            throw new Error('Forbidden: You do not own this device');
        }
        if (device.status !== client_1.DeviceStatus.ONLINE) {
            throw new Error('Device is not online');
        }
        await this.prisma.remoteSession.updateMany({
            where: {
                deviceId,
                isActive: true,
            },
            data: {
                isActive: false,
                endedAt: new Date(),
            },
        });
        return this.prisma.remoteSession.create({
            data: {
                deviceId,
                webSocketId,
                isActive: true,
            },
            include: {
                device: true,
            },
        });
    }
    async updateSessionStatus(sessionId, accepted) {
        return this.prisma.remoteSession.update({
            where: { id: sessionId },
            data: {
                isActive: accepted,
                endedAt: accepted ? null : new Date(),
            },
        });
    }
    async getSession(sessionId) {
        return this.prisma.remoteSession.findUnique({
            where: { id: sessionId },
            include: {
                device: true,
            },
        });
    }
    async createCommand(sessionId, type, payload) {
        return this.prisma.remoteCommand.create({
            data: {
                sessionId,
                type: type,
                payload,
                status: client_1.CommandStatus.PENDING,
            },
        });
    }
    async updateCommandStatus(commandId, status, result, error) {
        return this.prisma.remoteCommand.update({
            where: { id: commandId },
            data: {
                status: status,
                result,
                error,
                executedAt: status === 'EXECUTING' ? new Date() : undefined,
                completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date() : undefined,
            },
        });
    }
    async getCommand(commandId) {
        return this.prisma.remoteCommand.findUnique({
            where: { id: commandId },
        });
    }
    async getSessionCommands(sessionId) {
        return this.prisma.remoteCommand.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async endSession(sessionId) {
        return this.prisma.remoteSession.update({
            where: { id: sessionId },
            data: {
                isActive: false,
                endedAt: new Date(),
            },
        });
    }
    async getDevice(deviceId) {
        return this.prisma.registeredDevice.findUnique({
            where: { id: deviceId },
        });
    }
    async deleteDevice(deviceId) {
        return this.prisma.registeredDevice.update({
            where: { id: deviceId },
            data: {
                isActive: false,
            },
        });
    }
};
exports.RemoteControlService = RemoteControlService;
exports.RemoteControlService = RemoteControlService = RemoteControlService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RemoteControlService);
//# sourceMappingURL=remote-control.service.js.map