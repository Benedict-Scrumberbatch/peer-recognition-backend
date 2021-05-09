import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RockstarController } from './rockstar.controller';
import { RockstarService } from './rockstar.service';
import {Recognition} from '../dtos/entity/recognition.entity'
import { Users } from '../dtos/entity/users.entity';
import { Tag } from '../dtos/entity/tag.entity';
import { Company } from '../dtos/entity/company.entity';
import { TagStats } from '../dtos/entity/tagstats.entity';
import {Report} from '../dtos/entity/report.entity'
import { Rockstar} from '../dtos/entity/rockstar.entity'
import {RockstarStats} from '../dtos/entity/rockstarstats.entity'
@Module({
  imports: [ TypeOrmModule.forFeature([ Recognition, Users, Tag, Company, TagStats, Report, Rockstar, RockstarStats])],
  providers: [RockstarService],
  controllers: [ RockstarController],
  exports: [RockstarService]
})
export class RockstarModule {}
