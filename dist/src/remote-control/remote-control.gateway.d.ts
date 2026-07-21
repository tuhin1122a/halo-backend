import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { RemoteControlService } from './remote-control.service';
export declare class RemoteControlGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly remoteControlService;
    private readonly jwtService;
    private readonly prisma;
    server: Server;
    constructor(remoteControlService: RemoteControlService, jwtService: JwtService, prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    handleUpdatePresence(client: Socket, data: {
        isOnline: boolean;
    }): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleDeviceRegister(client: Socket, data: any): Promise<{
        success: boolean;
        device: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            lastSeen: Date;
            userId: string;
            deviceName: string;
            deviceModel: string | null;
            osVersion: string | null;
            appVersion: string | null;
            deviceId: string;
            status: import("@prisma/client").$Enums.DeviceStatus;
            socketId: string | null;
            fcmToken: string | null;
            isActive: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        device?: undefined;
    }>;
    handleSessionStart(client: Socket, data: {
        deviceId: string;
    }): Promise<{
        success: boolean;
        session: {
            device: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                lastSeen: Date;
                userId: string;
                deviceName: string;
                deviceModel: string | null;
                osVersion: string | null;
                appVersion: string | null;
                deviceId: string;
                status: import("@prisma/client").$Enums.DeviceStatus;
                socketId: string | null;
                fcmToken: string | null;
                isActive: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deviceId: string;
            isActive: boolean;
            startedAt: Date;
            endedAt: Date | null;
            webSocketId: string | null;
            peerConnection: import("@prisma/client/runtime/library").JsonValue | null;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        session?: undefined;
    }>;
    handleSessionResponse(client: Socket, data: {
        sessionId: string;
        accepted: boolean;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleCommandSend(client: Socket, data: {
        sessionId: string;
        type: string;
        payload?: any;
    }): Promise<{
        success: boolean;
        commandId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        commandId?: undefined;
    }>;
    handleCommandResult(client: Socket, data: {
        commandId: string;
        status: string;
        result?: any;
        error?: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleWebRTCOffer(client: Socket, data: any): Promise<{
        success: boolean;
        error: string;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    handleWebRTCAnswer(client: Socket, data: {
        sessionId: string;
        [key: string]: any;
    }): Promise<{
        success: boolean;
        error: string;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    handleICECandidate(client: Socket, data: any): Promise<{
        success: boolean;
        error: string;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    handleNotificationReceive(client: Socket, data: {
        sessionId: string;
        notification: string;
    }): Promise<void>;
    handleScreenFrame(client: Socket, data: {
        sessionId: string;
        frame: string;
        type?: string;
    }): Promise<void>;
}
