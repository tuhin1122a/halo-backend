import { Controller, Get, Post, Patch, Delete, Param, Query, UseGuards, Request, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import * as fs from 'fs';

// Setup multer storage for local uploads (can be changed to S3/Cloudinary later)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/messages';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  }
});

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('chats')
  async getRecentChats(@Request() req) {
    return this.messagesService.getRecentChats(req.user.userId);
  }

  @Get('conversation/:otherUserId')
  async getConversation(
    @Request() req,
    @Param('otherUserId') otherUserId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const lim = limit ? parseInt(limit, 10) : 30;
    const off = offset ? parseInt(offset, 10) : 0;
    return this.messagesService.getConversation(req.user.userId, otherUserId, lim, off);
  }

  @Patch('read/:senderId')
  async markAsRead(@Request() req, @Param('senderId') senderId: string) {
    await this.messagesService.markAsRead(req.user.userId, senderId);
    return { success: true };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadMessageFile(
    @Request() req,
    @Body('receiverId') receiverId: string,
    @Body('messageType') messageType: string,
    @Body('tempId') tempId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) throw new BadRequestException('File is required');
    
    // In a real app, you would upload this to Cloudinary or S3.
    // For now, we will just return a local route that serves it, assuming static serving is enabled.
    const fileUrl = `/uploads/messages/${file.filename}`;

    return this.messagesService.createMessage({
      senderId: req.user.userId,
      receiverId,
      messageType,
      tempId,
      fileUrl,
      fileName: file.originalname
    });
  }

  @Get('shared-media/:otherUserId')
  async getSharedMedia(
    @Request() req,
    @Param('otherUserId') otherUserId: string,
    @Query('types') types?: string
  ) {
    return this.messagesService.getSharedMedia(req.user.userId, otherUserId, types);
  }

  @Delete('conversation/:otherUserId')
  async deleteConversation(@Request() req, @Param('otherUserId') otherUserId: string) {
    await this.messagesService.deleteConversation(req.user.userId, otherUserId);
    return { success: true };
  }

  @Delete(':id')
  async deleteMessage(@Request() req, @Param('id') id: string) {
    await this.messagesService.deleteMessage(req.user.userId, id);
    return { success: true };
  }

  @Get('settings/:otherUserId')
  async getChatSettings(@Request() req, @Param('otherUserId') otherUserId: string) {
    return this.messagesService.getChatSettings(req.user.userId, otherUserId);
  }

  @Patch('settings/:otherUserId')
  async updateChatSettings(
    @Request() req,
    @Param('otherUserId') otherUserId: string,
    @Body() body: {
      themeId?: string | null;
      quickReaction?: string;
      nickname?: string | null;
      isMuted?: boolean;
      disappearingTimer?: number;
      wordEffects?: string | null;
    }
  ) {
    return this.messagesService.updateChatSettings(req.user.userId, otherUserId, body);
  }

  @Post('block/:otherUserId')
  async blockUser(@Request() req, @Param('otherUserId') otherUserId: string) {
    await this.messagesService.blockUser(req.user.userId, otherUserId, false);
    return { success: true };
  }

  @Delete('block/:otherUserId')
  async unblockUser(@Request() req, @Param('otherUserId') otherUserId: string) {
    await this.messagesService.unblockUser(req.user.userId, otherUserId);
    return { success: true };
  }

  @Post('restrict/:otherUserId')
  async restrictUser(@Request() req, @Param('otherUserId') otherUserId: string) {
    await this.messagesService.blockUser(req.user.userId, otherUserId, true);
    return { success: true };
  }

  @Delete('restrict/:otherUserId')
  async unrestrictUser(@Request() req, @Param('otherUserId') otherUserId: string) {
    await this.messagesService.unblockUser(req.user.userId, otherUserId);
    return { success: true };
  }

  @Get('search/:otherUserId')
  async searchMessages(
    @Request() req,
    @Param('otherUserId') otherUserId: string,
    @Query('query') query: string
  ) {
    if (!query) return [];
    return this.messagesService.searchMessages(req.user.userId, otherUserId, query);
  }

  @Patch('pin/:messageId')
  async togglePinMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.messagesService.togglePinMessage(req.user.userId, messageId);
  }

  @Get('pinned/:otherUserId')
  async getPinnedMessages(@Request() req, @Param('otherUserId') otherUserId: string) {
    return this.messagesService.getPinnedMessages(req.user.userId, otherUserId);
  }
}

