import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RockstarController } from './rockstar.controller';
import { RockstarService } from './rockstar.service';
import {Recognition} from '../common/entity/recognition.entity'
import { Users } from '../common/entity/users.entity';
import { Tag } from '../common/entity/tag.entity';
import { Company } from '../common/entity/company.entity';
import { TagStats } from '../common/entity/tagstats.entity';
import {Report} from '../common/entity/report.entity'
import { Rockstar} from '../common/entity/rockstar.entity'
import {RockstarStats} from '../common/entity/rockstarstats.entity'
@Module({
  imports: [ TypeOrmModule.forFeature([ Recognition, Users, Tag, Company, TagStats, Report, Rockstar, RockstarStats])],
  providers: [RockstarService],
  controllers: [ RockstarController],
  exports: [RockstarService]
})
export class RockstarModule {}
