import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private messagesService;
    private prisma;
    server: Server;
    private connectedUsers;
    constructor(messagesService: MessagesService, prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleSendMessage(client: Socket, payload: any): Promise<void>;
    handleTyping(client: Socket, payload: any): void;
    handleStopTyping(client: Socket, payload: any): void;
    emitToUser(userId: string, event: string, data: any): void;
}
