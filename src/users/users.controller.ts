
import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from '../common/cloudinary.service';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll(@Request() req) {
    if (req.user?.role !== 'ADMIN') {
      throw new BadRequestException('Unauthorized: Only admins can list users');
    }

    return this.usersService.findAll();
  }

  @Get('profile')
  getOwnProfile(@Request() req) {
    return this.usersService.findProfile(req.user.userId);
  }

  @Get('check-username')
  async checkUsername(@Request() req, @Query('username') username: string) {
    if (!username || username.trim().length === 0) {
      throw new BadRequestException('Username is required');
    }
    const cleanUsername = username.trim().toLowerCase();
    const existing = await this.usersService.findByUsername(cleanUsername);
    const isAvailable = !existing || existing.id === req.user.userId;
    return { username: cleanUsername, available: isAvailable };
  }

  @Get('search')
  searchUsers(@Query('q') q: string) {
    if (!q || q.trim().length === 0) return [];
    return this.usersService.searchUsers(q.trim());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findProfile(id);
  }

  @Patch('profile/update')
  async updateProfileInfo(@Request() req, @Body() body: { 
    name?: string; 
    username?: string;
    password?: string;
    bio?: string;
    address?: string;
    education?: string;
  }) {
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.username !== undefined) data.username = body.username;
    if (body.bio !== undefined) data.bio = body.bio;
    if (body.address !== undefined) data.address = body.address;
    if (body.education !== undefined) data.education = body.education;
    
    if (body.password) {
        data.password = await bcrypt.hash(body.password, 10);
    }
    
    return this.usersService.update(req.user.userId, data);
  }

  @Patch('profile')
  async update(@Request() req, @Body() updateDto: { 
    name?: string;
    username?: string; 
    bio?: string; 
    address?: string; 
    education?: string; 
    avatarUrl?: string; 
    coverImageUrl?: string; 
    coverPosition?: any; 
    avatarPosition?: any;
    password?: string;
  }) {
    const data: any = { ...updateDto };
    
    // Special handling for password - hash it before saving
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    } else {
        delete data.password;
    }

    return this.usersService.update(req.user.userId, data);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
      if (req.user.role !== 'ADMIN') {
          throw new BadRequestException('Unauthorized: Only admins can delete users');
      }
      return this.usersService.remove(id);
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const url = await this.cloudinaryService.uploadImage(file);
      await this.usersService.update(req.user.userId, { avatarUrl: url });
      return { url };
    } catch (error) {
      throw new BadRequestException('Failed to upload avatar: ' + error.message);
    }
  }

  @Post('upload-cover')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const url = await this.cloudinaryService.uploadImage(file);
      await this.usersService.update(req.user.userId, { coverImageUrl: url });
      return { url };
    } catch (error) {
      throw new BadRequestException('Failed to upload cover image: ' + error.message);
    }
  }
}
