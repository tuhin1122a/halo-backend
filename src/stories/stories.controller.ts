import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StoriesService } from './stories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStory(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('durationHours') durationHours?: string,
  ) {
    const hours = durationHours ? parseInt(durationHours, 10) : 24;
    return this.storiesService.createStory(req.user.userId, file, hours);
  }

  @Get('feed')
  async getFeed(@Request() req) {
    return this.storiesService.getFeedStories(req.user.userId);
  }

  @Delete(':id')
  async deleteStory(@Request() req, @Param('id') id: string) {
    return this.storiesService.deleteStory(req.user.userId, id);
  }

  @Post('view/:storyId')
  async viewStory(@Request() req, @Param('storyId') storyId: string) {
    return this.storiesService.viewStory(req.user.userId, storyId);
  }

  @Post('react/:storyId')
  async reactStory(
    @Request() req,
    @Param('storyId') storyId: string,
    @Body('reaction') reaction: string,
  ) {
    return this.storiesService.reactStory(req.user.userId, storyId, reaction);
  }
}
