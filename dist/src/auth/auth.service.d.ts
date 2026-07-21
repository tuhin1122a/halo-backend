import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../common/email.service';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private emailService;
    constructor(usersService: UsersService, jwtService: JwtService, emailService: EmailService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            role: any;
            name: any;
            category: any;
        };
    }>;
    register(userDto: any): Promise<{
        id: string;
        email: string;
        phoneNumber: string | null;
        username: string | null;
        password: string | null;
        name: string | null;
        countryCode: string | null;
        isVerified: boolean;
        role: import("@prisma/client").$Enums.Role;
        refreshToken: string | null;
        failedAttempts: number;
        lockoutUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        address: string | null;
        education: string | null;
        category: string | null;
        avatarUrl: string | null;
        coverImageUrl: string | null;
        coverPosition: import("@prisma/client/runtime/library").JsonValue | null;
        avatarPosition: import("@prisma/client/runtime/library").JsonValue | null;
        isOnline: boolean;
        lastSeen: Date | null;
        otp: string | null;
        otpExpires: Date | null;
    }>;
    registerOtp(userDto: any): Promise<{
        message: string;
    }>;
    verifyRegisterOtp(email: string, otp: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            role: any;
            name: any;
            category: any;
        };
    }>;
    requestMagicLink(email: string, forgotPassword?: boolean): Promise<{
        message: string;
    }>;
    verifyMagicLink(email: string, token: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            role: any;
            name: any;
            category: any;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    guestLogin(): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: any;
            email: any;
            role: any;
            name: any;
            category: any;
        };
    }>;
}
