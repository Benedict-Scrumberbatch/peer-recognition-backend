import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { Tag } from '../peer-recognition-dtos/entity/tag.entity';
import { Company } from '../peer-recognition-dtos/entity/company.entity';
@Module({
  imports: [ TypeOrmModule.forFeature([Tag, Company])],
  providers: [TagService],
  controllers: [ TagController],
  exports: [TagService]
})
export class TagModule {}