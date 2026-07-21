import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendMagicLink(email: string, token: string, isForgotPassword?: boolean): Promise<void>;
    sendOtp(email: string, otp: string): Promise<void>;
}
