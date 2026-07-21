"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    configService;
    transporter;
    constructor(configService) {
        this.configService = configService;
        const user = this.configService.get('SMTP_USER');
        const pass = this.configService.get('SMTP_PASS');
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
            port: Number(this.configService.get('SMTP_PORT', 587)),
            secure: false,
            auth: {
                user: user,
                pass: pass,
            },
        });
    }
    async sendMagicLink(email, token, isForgotPassword = false) {
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
        const magicLink = `${frontendUrl}/verify-otp?email=${email}&token=${token}`;
        const mailOptions = {
            from: `"TaskPro Support" <${this.configService.get('SMTP_USER')}>`,
            to: email,
            subject: isForgotPassword ? 'Reset Your TaskPro Password' : 'Your Magic Login Link',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #3b82f6;">${isForgotPassword ? 'Password Reset' : 'Welcome to TaskPro'}</h2>
          <p>${isForgotPassword
                ? 'We received a request to reset your password. Click the button below to log in securely and update your credentials.'
                : 'Click the button below to log in to your account. This link will expire in 10 minutes.'}</p>
          <a href="${magicLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            ${isForgotPassword ? 'Reset Password & Login' : 'Log In to TaskPro'}
          </a>
          <p style="color: #64748b; font-size: 14px;">Or copy and paste this link: <br/> ${magicLink}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">If you didn't request this email, you can safely ignore it.</p>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            throw new Error('Failed to send email');
        }
    }
    async sendOtp(email, otp) {
        const mailOptions = {
            from: `"TaskPro Support" <${this.configService.get('SMTP_USER')}>`,
            to: email,
            subject: 'Your Verification Code',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #3b82f6;">Verify Your Account</h2>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>Please enter this code in the app to complete your registration. This code will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">If you didn't request this email, you can safely ignore it.</p>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            throw new Error('Failed to send OTP email');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map