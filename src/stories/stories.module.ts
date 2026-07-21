import { Module } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryService } from '../common/cloudinary.service';

@Module({
  imports: [PrismaModule],
  controllers: [StoriesController],
  providers: [StoriesService, CloudinaryService],
  exports: [StoriesService],
})
export class StoriesModule {}
