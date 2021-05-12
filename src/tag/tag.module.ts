import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { Tag } from '../common/entity/tag.entity';
import { Company } from '../common/entity/company.entity';

@Module({
  imports: [ TypeOrmModule.forFeature([Tag, Company])],
  providers: [TagService],
  controllers: [ TagController],
  exports: [TagService]
})
export class TagModule {}