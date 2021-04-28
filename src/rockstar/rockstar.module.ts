import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RockstarController } from './rockstar.controller';
import { RockstarService } from './rockstar.service';
import {Recognition} from '../../peer-recognition-dtos/entity/recognition.entity'
import { Users } from '../../peer-recognition-dtos/entity/users.entity';
import { Tag } from '../../peer-recognition-dtos/entity/tag.entity';
import { Company } from '../../peer-recognition-dtos/entity/company.entity';
import { TagStats } from '../../peer-recognition-dtos/entity/tagstats.entity';
import {Report} from '../../peer-recognition-dtos/entity/report.entity'
import { Rockstar} from '../../peer-recognition-dtos/entity/rockstar.entity'
@Module({
  imports: [ TypeOrmModule.forFeature([ Recognition, Users, Tag, Company, TagStats, Report, Rockstar])],
  providers: [RockstarService],
  controllers: [ RockstarController],
  exports: [RockstarService]
})
export class RockstarModule {}
