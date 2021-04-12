import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecognitionController } from './recognition.controller';
import { RecognitionService } from './recognition.service';
import {Recognition} from '../dtos/entity/recognition.entity'
import { Users } from '../dtos/entity/users.entity';
import { Tag } from 'src/dtos/entity/tag.entity';
import { Company } from 'src/dtos/entity/company.entity';
import { TagStats } from 'src/dtos/entity/tagstats.entity';
import {Report} from 'src/dtos/entity/report.entity'
@Module({
  imports: [ TypeOrmModule.forFeature([ Recognition, Users, Tag, Company, TagStats, Report])],
  providers: [RecognitionService],
  controllers: [ RecognitionController],
  exports: [RecognitionService]
})
export class RecognitionModule {}
