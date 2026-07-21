import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
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
    register(body: any): Promise<{
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
    registerOtp(body: any): Promise<{
        message: string;
    }>;
    verifyRegisterOtp(body: {
        email: string;
        otp: string;
    }): Promise<{
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
    refresh(body: {
        refresh_token: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    requestMagicLink(body: {
        email: string;
        forgotPassword?: boolean;
    }): Promise<{
        message: string;
    }>;
    verifyMagicLink(body: {
        email: string;
        token: string;
    }): Promise<{
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
