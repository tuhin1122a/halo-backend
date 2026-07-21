import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  // Send follow / message request
  @Post(':userId')
  follow(@Request() req, @Param('userId') userId: string) {
    return this.followService.followUser(req.user.userId, userId);
  }

  // Accept incoming request
  @Post('accept/:userId')
  accept(@Request() req, @Param('userId') userId: string) {
    return this.followService.acceptFollow(req.user.userId, userId);
  }

  // Decline incoming request
  @Post('decline/:userId')
  decline(@Request() req, @Param('userId') userId: string) {
    return this.followService.declineFollow(req.user.userId, userId);
  }

  // Unfollow
  @Delete(':userId')
  unfollow(@Request() req, @Param('userId') userId: string) {
    return this.followService.unfollowUser(req.user.userId, userId);
  }

  // Check follow status with a specific user
  @Get('status/:userId')
  status(@Request() req, @Param('userId') userId: string) {
    return this.followService.getFollowStatus(req.user.userId, userId);
  }

  // List of users I follow (for story bar)
  @Get('following')
  following(@Request() req) {
    return this.followService.getFollowing(req.user.userId);
  }

  // Incoming pending requests (message requests inbox)
  @Get('requests')
  requests(@Request() req) {
    return this.followService.getIncomingRequests(req.user.userId);
  }
}
