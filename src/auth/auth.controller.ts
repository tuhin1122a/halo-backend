
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
        throw new BadRequestException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body);
  }

  @Post('register-otp')
  async registerOtp(@Body() body: any) {
    return this.authService.registerOtp(body);
  }

  @Post('verify-register-otp')
  async verifyRegisterOtp(@Body() body: { email: string; otp: string }) {
    if (!body.email || !body.otp) throw new BadRequestException('Email and OTP are required');
    return this.authService.verifyRegisterOtp(body.email, body.otp);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refresh(body.refresh_token);
  }

  @Post('request-magic-link')
  async requestMagicLink(@Body() body: { email: string; forgotPassword?: boolean }) {
    if (!body.email) throw new BadRequestException('Email is required');
    return this.authService.requestMagicLink(body.email, body.forgotPassword || false);
  }

  @Post('verify-magic-link')
  async verifyMagicLink(@Body() body: { email: string; token: string }) {
    if (!body.email || !body.token) throw new BadRequestException('Email and token are required');
    return this.authService.verifyMagicLink(body.email, body.token);
  }

  @Post('guest-login')
  async guestLogin() {
      return this.authService.guestLogin();
  }
}
