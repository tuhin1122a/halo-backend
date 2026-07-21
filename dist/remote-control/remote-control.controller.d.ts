import { RemoteControlService } from './remote-control.service';
export declare class RemoteControlController {
    private readonly remoteControlService;
    constructor(remoteControlService: RemoteControlService);
    getDevices(req: any): Promise<{
        lastSeen: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }[]>;
    getDevice(id: string): Promise<{
        lastSeen: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    } | null>;
    deleteDevice(id: string): Promise<{
        lastSeen: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
    }>;
    getSession(id: string): Promise<({
        device: {
            lastSeen: Date;
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
    }) | null>;
    endSession(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deviceId: string;
        isActive: boolean;
        startedAt: Date;
        endedAt: Date | null;
        webSocketId: string | null;
        peerConnection: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getSessionCommands(id: string): Promise<{
        error: string | null;
        id: string;
        createdAt: Date;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        status: import("@prisma/client").$Enums.CommandStatus;
        type: import("@prisma/client").$Enums.CommandType;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        executedAt: Date | null;
        completedAt: Date | null;
        sessionId: string;
    }[]>;
}
