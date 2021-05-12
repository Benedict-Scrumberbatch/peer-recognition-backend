import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecognitionController } from './recognition.controller';
import { RecognitionService } from './recognition.service';
import {Recognition} from '../common/entity/recognition.entity'
import { Users } from '../common/entity/users.entity';
import { Tag } from '../common/entity/tag.entity';
import { Company } from '../common/entity/company.entity';
import { TagStats } from '../common/entity/tagstats.entity';
import {Report} from '../common/entity/report.entity';
import {Comment} from '../common/entity/comment.entity';
import {Reaction} from '../common/entity/reaction.entity';
import { UserNotification } from '../common/entity/notification.entity';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [ TypeOrmModule.forFeature([ Recognition, Users, Tag, Company, TagStats, Report, Comment, Reaction, UserNotification])],
  providers: [RecognitionService],
  controllers: [ RecognitionController],
  exports: [RecognitionService]
})
export class RecognitionModule {}
