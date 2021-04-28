import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecognitionController } from './recognition.controller';
import { RecognitionService } from './recognition.service';
import {Recognition} from '../peer-recognition-dtos/entity/recognition.entity'
import { Users } from '../peer-recognition-dtos/entity/users.entity';
import { Tag } from '../peer-recognition-dtos/entity/tag.entity';
import { Company } from '../peer-recognition-dtos/entity/company.entity';
import { TagStats } from '../peer-recognition-dtos/entity/tagstats.entity';
import {Report} from '../peer-recognition-dtos/entity/report.entity';
import {Comment} from '../peer-recognition-dtos/entity/comment.entity';
import {Reaction} from '../peer-recognition-dtos/entity/reaction.entity';
@Module({
  imports: [ TypeOrmModule.forFeature([ Recognition, Users, Tag, Company, TagStats, Report, Comment, Reaction])],
  providers: [RecognitionService],
  controllers: [ RecognitionController],
  exports: [RecognitionService]
})
export class RecognitionModule {}
